import { createHmac, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { CloudEvent } from 'cloudevents';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { z } from 'zod';
import { DB, type Db } from '../db';
import { type BookingStatus, booking, bookingEvent, user } from '../db/schema';
import { EVENT_BUS, type EventBus } from '../events/bus';
import { logger } from '../observe';
import { withdrawShare } from './bookings.service';

/**
 * The Cal.com triggers a tenant's team webhook sends (docs/runbook.md): the status each sets and the statuses it may replace, so a late or repeated
 * trigger never undoes a later one. Anything else (e.g. the ping test) is acknowledged and ignored. BOOKING_REQUESTED (an event type the adviser
 * confirms) keeps the booking pending but sets its cal_uid: pending with a cal_uid = awaiting the adviser's confirmation, then BOOKING_CREATED.
 */
const MOVES: Record<string, [BookingStatus, BookingStatus[]]> = {
  BOOKING_REQUESTED: ['pending', ['pending']],
  BOOKING_CREATED: ['booked', ['pending', 'booked']],
  BOOKING_RESCHEDULED: ['booked', ['pending', 'booked']],
  BOOKING_CANCELLED: ['cancelled', ['pending', 'booked']],
  BOOKING_REJECTED: ['cancelled', ['pending']], // the adviser declined a requested booking
  MEETING_ENDED: ['ended', ['booked']],
  BOOKING_NO_SHOW_UPDATED: ['no_show', ['booked', 'ended']], // an unmark goes back from no_show instead (handle)
  AFTER_HOSTS_CAL_VIDEO_NO_SHOW: ['no_show', ['booked', 'ended']],
  AFTER_GUESTS_CAL_VIDEO_NO_SHOW: ['no_show', ['booked', 'ended']],
};
// The triggers that carry the Cal.com booking itself (its uid and time); each must come from the booking's adviser.
const BOOKS = new Set(['BOOKING_REQUESTED', 'BOOKING_CREATED', 'BOOKING_RESCHEDULED']);

/** The parts of a Cal.com webhook we read. Booking triggers carry `uid` (and our id in metadata.bookingId, set by the embed); no-show triggers carry `bookingUid`. */
export const calWebhook = z.object({
  triggerEvent: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  payload: z.looseObject({
    uid: z.string().optional(),
    bookingUid: z.string().optional(),
    rescheduleUid: z.string().nullish(),
    startTime: z.iso.datetime({ offset: true }).optional(),
    endTime: z.iso.datetime({ offset: true }).optional(),
    metadata: z.looseObject({ bookingId: z.string().optional() }).nullish(),
    organizer: z.looseObject({ username: z.string().nullish() }).nullish(),
    // BOOKING_NO_SHOW_UPDATED: the flag Cal.com set or cleared, on the attendees and/or the host
    attendees: z.array(z.looseObject({ noShow: z.boolean().nullish() })).nullish(),
    noShowHost: z.boolean().nullish(),
  }),
});
type CalWebhook = z.infer<typeof calWebhook>;

/** Thrown inside the transaction to roll it back: the delivery is retried later. */
class NotYet extends Error {}

/**
 * What handle did with a delivery: applied (or a retry of an applied one: published again), rejected (recorded, nothing changed or published),
 * ignored (not a trigger or booking we track; bookings are stored before the embed opens, so an unmatched one is never ours later) or later
 * (a reschedule that arrived before the one it follows: the route answers 409 so Cal.com retries).
 */
type CalOutcome = 'applied' | 'rejected' | 'ignored' | 'later';

/**
 * Cal.com webhooks, the source of truth for a booking: each delivery adds a booking_event row (once per uid and trigger) and, when the transition
 * applies, updates the booking in the same transaction, then publishes a CloudEvent (also for a retry of an applied delivery, so a publish that
 * failed before is retried too). Throws when publishing fails, so the route answers 500 and Cal.com retries.
 */
@Injectable()
export class CalService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(EVENT_BUS) private readonly bus: EventBus) {}

  /** x-cal-signature-256 = hex HMAC SHA-256 of the raw body with the tenant's secret (CAL_WEBHOOK_SECRETS, JSON { "<organization id>": "<secret>" }). */
  verify(tenant: string, raw: string, signature: string | undefined) {
    const secrets: Record<string, unknown> = JSON.parse(process.env.CAL_WEBHOOK_SECRETS ?? '{}');
    const secret = Object.hasOwn(secrets, tenant) ? secrets[tenant] : undefined;
    if (typeof secret !== 'string' || !secret || !signature) return false;
    const expected = createHmac('sha256', secret).update(raw).digest();
    const given = Buffer.from(signature, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  }

  async handle(tenant: string, { triggerEvent: trigger, createdAt, payload: p }: CalWebhook): Promise<CalOutcome> {
    const uid = p.uid ?? p.bookingUid;
    const move = Object.hasOwn(MOVES, trigger) ? MOVES[trigger] : undefined;
    const flags = [p.noShowHost, ...(p.attendees ?? []).map((a) => a.noShow)].filter((f) => typeof f === 'boolean');
    const flagged = trigger === 'BOOKING_NO_SHOW_UPDATED';
    if (!move || !uid || (flagged && !flags.length)) return 'ignored';
    const noShow = flags.some(Boolean);
    const key = flagged ? `${trigger}:${noShow}:${createdAt}` : trigger; // the dedupe key: mark, unmark and mark again are each applied
    const current = (trigger === 'BOOKING_RESCHEDULED' && p.rescheduleUid) || uid; // the Cal.com booking this trigger acts on
    const ours = or(
      eq(booking.calUid, uid),
      p.metadata?.bookingId ? eq(booking.id, p.metadata.bookingId) : undefined,
      p.rescheduleUid ? eq(booking.calUid, p.rescheduleUid) : undefined, // a reschedule gets a new uid
    );
    const done = await this.db.transaction(async (tx) => {
      const [b] = await tx.select().from(booking).where(and(eq(booking.organizationId, tenant), ours));
      if (!b) return undefined;
      const [isNew] = await tx.insert(bookingEvent).values({ bookingId: b.id, calUid: uid, trigger: key }).onConflictDoNothing().returning({ id: bookingEvent.id });
      if (!isNew) {
        const [prior] = await tx.select({ status: bookingEvent.status }).from(bookingEvent).where(and(eq(bookingEvent.calUid, uid), eq(bookingEvent.trigger, key)));
        return { b, status: prior?.status ?? null };
      }
      if (BOOKS.has(trigger)) {
        const [adviser] = await tx.select({ calLink: user.calLink }).from(user).where(eq(user.id, b.adviserId));
        if (!p.organizer?.username || adviser?.calLink?.split('/')[0] !== p.organizer.username) {
          logger.warn('cal organizer is not the booking\'s adviser', { booking: b.id, trigger });
          return { b, status: null };
        }
      }
      let [to, from] = move;
      if (flagged && !noShow) {
        const [ended] = await tx.select({ id: bookingEvent.id }).from(bookingEvent).where(and(eq(bookingEvent.bookingId, b.id), eq(bookingEvent.trigger, 'MEETING_ENDED'))).limit(1);
        [to, from] = [ended ? 'ended' : 'booked', ['no_show']];
      }
      const set = BOOKS.has(trigger)
        ? { status: to, calUid: uid, ...(p.startTime && { startsAt: new Date(p.startTime) }) }
        : { status: to, ...(to === 'cancelled' && { cancelledAt: new Date() }) };
      const [changed] = await tx.update(booking).set(set)
        .where(and(eq(booking.id, b.id), inArray(booking.status, from), or(isNull(booking.calUid), eq(booking.calUid, current)))).returning({ id: booking.id });
      if (!changed) {
        // A reschedule of a Cal.com booking we have no delivery for yet: the reschedule it follows has not landed. Roll back (nothing recorded) and
        // answer 409, so Cal.com retries it after that one. Every other mismatch is stale and recorded as rejected.
        if (trigger === 'BOOKING_RESCHEDULED' && p.rescheduleUid && from.includes(b.status)
          && !(await tx.select({ id: bookingEvent.id }).from(bookingEvent).where(eq(bookingEvent.calUid, p.rescheduleUid)).limit(1)).length) throw new NotYet();
        return { b, status: null };
      }
      await tx.update(bookingEvent).set({ status: to }).where(eq(bookingEvent.id, isNew.id));
      if (to === 'cancelled') await withdrawShare(tx, b);
      return { b, status: to };
    }).catch((e: unknown) => { if (e instanceof NotYet) return 'later' as const; throw e; });
    if (done === 'later') return 'later';
    if (!done) return 'ignored';
    if (!done.status) return 'rejected';
    const id = `${uid}:${key}`; // the idempotency key: consumers dedupe on it
    await this.bus.publish([new CloudEvent({
      id, source: 'lifemap/bookings', type: `lifemap.booking.${trigger}`, time: createdAt, datacontenttype: 'application/json',
      data: { tenant, booking: done.b.id, adviser: done.b.adviserId, user: done.b.userId, status: done.status, startsAt: p.startTime ?? null, endsAt: p.endTime ?? null, idempotencyKey: id },
    })]);
    return 'applied';
  }
}
