import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { DB, type Db } from "../db";
import { booking, consentEvent } from "../db/schema";
import { AdvisersService } from "./advisers.service";

const bookingFields = { id: booking.id, adviserId: booking.adviserId, share: booking.share, status: booking.status, calUid: booking.calUid, startsAt: booking.startsAt, createdAt: booking.createdAt, cancelledAt: booking.cancelledAt };

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** The consent wording version a booking's share was last recorded under. */
const shareVersionOf = async (tx: Tx, bookingId: string) =>
  (await tx.select({ version: consentEvent.version }).from(consentEvent)
    .where(and(eq(consentEvent.kind, "adviser_share"), sql`${consentEvent.detail}->>'bookingId' = ${bookingId}`))
    .orderBy(desc(consentEvent.id)).limit(1))[0]?.version;

/** Records that a booking's share is withdrawn (consent_event granted false), under the wording version it was last granted with. */
export const withdrawShare = async (tx: Tx, b: { id: string; userId: string; organizationId: string; adviserId: string; share: Record<string, boolean> }) =>
  tx.insert(consentEvent).values({
    userId: b.userId, organizationId: b.organizationId, kind: "adviser_share", granted: false, version: (await shareVersionOf(tx, b.id)) ?? "unknown",
    detail: { bookingId: b.id, adviserId: b.adviserId, items: b.share },
  });

/**
 * Adviser bookings, the caller's in the session's tenant. Creating one (pending, before the Cal.com embed opens) records the share consent
 * (consent_event kind adviser_share, detail = exactly what is shared). Cal.com's webhooks confirm, move and cancel it (CalService).
 */
@Injectable()
export class BookingsService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(AdvisersService) private readonly advisers: AdvisersService) {}

  /**
   * undefined when adviserId is not one of the tenant's advisers. Reuses the caller's open pending booking (no Cal.com booking yet) with that adviser,
   * so reopening the embed adds nothing; the share consent is recorded again only when what is shared or the consent wording version changed.
   * Open pending bookings with other advisers are cancelled and their shares withdrawn, so only the adviser being booked holds a granted share.
   */
  async create(userId: string, organizationId: string, { shareVersion, ...b }: { adviserId: string; share: Record<string, boolean>; shareVersion: string }) {
    if (!(await this.advisers.list(organizationId, b.adviserId)).length) return undefined;
    return this.db.transaction(async (tx) => {
      const open = and(eq(booking.userId, userId), eq(booking.organizationId, organizationId), eq(booking.status, "pending"), isNull(booking.calUid));
      const others = await tx.update(booking).set({ status: "cancelled", cancelledAt: new Date() }).where(and(open, ne(booking.adviserId, b.adviserId))).returning();
      for (const o of others) await withdrawShare(tx, o);
      const [mine] = await tx.select(bookingFields).from(booking).where(and(open, eq(booking.adviserId, b.adviserId))).orderBy(desc(booking.createdAt)).limit(1);
      if (mine && isDeepStrictEqual(mine.share, b.share) && (await shareVersionOf(tx, mine.id)) === shareVersion) return mine;
      const [row] = mine
        ? await tx.update(booking).set({ share: b.share }).where(eq(booking.id, mine.id)).returning(bookingFields)
        : await tx.insert(booking).values({ id: randomUUID(), userId, organizationId, ...b }).returning(bookingFields);
      await tx.insert(consentEvent).values({
        userId, organizationId, kind: "adviser_share", granted: Object.values(b.share).some(Boolean), version: shareVersion,
        detail: { bookingId: row.id, adviserId: b.adviserId, items: b.share },
      });
      return row;
    });
  }

  list = (userId: string, orgId: string) =>
    this.db.select(bookingFields).from(booking).where(and(eq(booking.userId, userId), eq(booking.organizationId, orgId))).orderBy(desc(booking.createdAt));
}
