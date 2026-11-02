import { createHmac, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { CloudEvent } from 'cloudevents';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DB, type Db } from '../db';
import { type BookingStatus, booking, bookingEvent, consentEvent } from '../db/schema';
import { EVENT_BUS, type EventBus } from '../events/bus';

/** The Cal.com triggers a tenant's team webhook sends (docs/runbook.md) and the booking status each sets; anything else (e.g. the ping test) is acknowledged and ignored. */
const STATUS: Record<string, Exclude<BookingStatus, 'pending'>> = {
  BOOKING_CREATED: 'booked',
  BOOKING_RESCHEDULED: 'booked',
  BOOKING_CANCELLED: 'cancelled',
  MEETING_ENDED: 'ended',
  BOOKING_NO_SHOW_UPDATED: 'no_show',
  AFTER_HOSTS_CAL_VIDEO_NO_SHOW: 'no_show',
  AFTER_GUESTS_CAL_VIDEO_NO_SHOW: 'no_show',
};
// The statuses each one may replace (booked always applies: a create or reschedule carries the latest time), so a late or repeated trigger never undoes a later one.
const FROM: Record<Exclude<BookingStatus, 'booked' | 'pending'>, BookingStatus[]> = {
  cancelled: ['pending', 'booked'],
  ended: ['booked'],
  no_show: ['booked', 'ended'],
};

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
  }),
});
export type CalWebhook = z.infer<typeof calWebhook>;

/**
 * Cal.com webhooks, the source of truth for a booking: each delivery updates the booking and adds a booking_event row in one transaction, then
 * publishes a CloudEvent (also for a retried delivery, so a publish that failed before is retried too). Throws when publishing fails, so the
 * route answers 500 and Cal.com retries.
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

  /** false when the trigger is not one we handle or the booking is not one of this tenant's. */
  async handle(tenant: string, { triggerEvent: trigger, createdAt, payload: p }: CalWebhook) {
    const uid = p.uid ?? p.bookingUid;
    const status = Object.hasOwn(STATUS, trigger) ? STATUS[trigger] : undefined;
    if (!status || !uid) return false;
    const ours = or(
      eq(booking.calUid, uid),
      p.metadata?.bookingId ? eq(booking.id, p.metadata.bookingId) : undefined,
      p.rescheduleUid ? eq(booking.calUid, p.rescheduleUid) : undefined, // a reschedule gets a new uid
    );
    const row = await this.db.transaction(async (tx) => {
      const [b] = await tx.select().from(booking).where(and(eq(booking.organizationId, tenant), ours));
      if (!b) return undefined;
      const [isNew] = await tx.insert(bookingEvent).values({ bookingId: b.id, calUid: uid, trigger }).onConflictDoNothing().returning({ id: bookingEvent.id });
      if (!isNew) return b;
      if (status === 'booked') {
        await tx.update(booking).set({ status, calUid: uid, startsAt: p.startTime ? new Date(p.startTime) : null }).where(eq(booking.id, b.id));
        return b;
      }
      const [changed] = await tx.update(booking).set({ status, ...(status === 'cancelled' && { cancelledAt: new Date() }) })
        .where(and(eq(booking.id, b.id), inArray(booking.status, FROM[status]))).returning({ id: booking.id });
      if (changed && status === 'cancelled') {
        // the share is withdrawn, under the wording version it was granted with
        const [granted] = await tx.select({ version: consentEvent.version }).from(consentEvent)
          .where(and(eq(consentEvent.userId, b.userId), eq(consentEvent.organizationId, tenant), eq(consentEvent.kind, 'adviser_share'), sql`${consentEvent.detail}->>'bookingId' = ${b.id}`));
        await tx.insert(consentEvent).values({
          userId: b.userId, organizationId: tenant, kind: 'adviser_share', granted: false, version: granted?.version ?? 'unknown',
          detail: { bookingId: b.id, adviserId: b.adviserId, items: b.share },
        });
      }
      return b;
    });
    if (!row) return false;
    const id = `${uid}:${trigger}`; // the idempotency key: consumers dedupe on it
    await this.bus.publish([new CloudEvent({
      id, source: 'lifemap/bookings', type: `lifemap.booking.${trigger}`, time: createdAt, datacontenttype: 'application/json',
      data: { tenant, booking: row.id, adviser: row.adviserId, user: row.userId, startsAt: p.startTime ?? null, endsAt: p.endTime ?? null, idempotencyKey: id },
    })]);
    return true;
  }
}
