import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { DB, type Db } from "../db";
import { booking, consentEvent } from "../db/schema";
import { AdvisersService } from "./advisers.service";

const bookingFields = { id: booking.id, adviserId: booking.adviserId, share: booking.share, status: booking.status, calUid: booking.calUid, startsAt: booking.startsAt, createdAt: booking.createdAt, cancelledAt: booking.cancelledAt };

/**
 * Adviser bookings, the caller's in the session's tenant. Creating one (pending, before the Cal.com embed opens) records the share consent
 * (consent_event kind adviser_share, detail = exactly what is shared). Cal.com's webhooks confirm, move and cancel it (CalService).
 */
@Injectable()
export class BookingsService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(AdvisersService) private readonly advisers: AdvisersService) {}

  /**
   * undefined when adviserId is not one of the tenant's advisers. Reuses the caller's open pending booking (no Cal.com booking yet), so reopening the
   * embed adds nothing; the share consent is recorded again only when the adviser, what is shared or the consent wording version changed.
   */
  async create(userId: string, organizationId: string, { shareVersion, ...b }: { adviserId: string; share: Record<string, boolean>; shareVersion: string }) {
    if (!(await this.advisers.list(organizationId, b.adviserId)).length) return undefined;
    return this.db.transaction(async (tx) => {
      const [open] = await tx.select(bookingFields).from(booking)
        .where(and(eq(booking.userId, userId), eq(booking.organizationId, organizationId), eq(booking.status, "pending"), isNull(booking.calUid)))
        .orderBy(desc(booking.createdAt)).limit(1);
      const [last] = open
        ? await tx.select({ version: consentEvent.version }).from(consentEvent)
          .where(and(eq(consentEvent.userId, userId), eq(consentEvent.organizationId, organizationId), eq(consentEvent.kind, "adviser_share"), sql`${consentEvent.detail}->>'bookingId' = ${open.id}`))
          .orderBy(desc(consentEvent.id)).limit(1)
        : [];
      if (open && open.adviserId === b.adviserId && isDeepStrictEqual(open.share, b.share) && last?.version === shareVersion) return open;
      const [row] = open
        ? await tx.update(booking).set(b).where(eq(booking.id, open.id)).returning(bookingFields)
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
