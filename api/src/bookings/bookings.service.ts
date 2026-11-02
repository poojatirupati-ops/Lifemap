import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DB, type Db } from "../db";
import { booking, consentEvent } from "../db/schema";
import { AdvisersService } from "./advisers.service";

export const bookingFields = { id: booking.id, adviserId: booking.adviserId, share: booking.share, status: booking.status, calUid: booking.calUid, startsAt: booking.startsAt, createdAt: booking.createdAt, cancelledAt: booking.cancelledAt };

/**
 * Adviser bookings, the caller's in the session's tenant. Creating one (pending, before the Cal.com embed opens) records the share consent
 * (consent_event kind adviser_share, detail = exactly what is shared). Cal.com's webhooks confirm, move and cancel it (CalService).
 */
@Injectable()
export class BookingsService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(AdvisersService) private readonly advisers: AdvisersService) {}

  /** undefined when adviserId is not one of the tenant's advisers. */
  async create(userId: string, organizationId: string, { shareVersion, ...b }: { adviserId: string; share: Record<string, boolean>; shareVersion: string }) {
    if (!(await this.advisers.list(organizationId, b.adviserId)).length) return undefined;
    const id = randomUUID();
    return this.db.transaction(async (tx) => {
      const [created] = await tx.insert(booking).values({ id, userId, organizationId, ...b }).returning(bookingFields);
      await tx.insert(consentEvent).values({
        userId, organizationId, kind: "adviser_share", granted: Object.values(b.share).some(Boolean), version: shareVersion,
        detail: { bookingId: id, adviserId: b.adviserId, items: b.share },
      });
      return created;
    });
  }

  list = (userId: string, orgId: string) =>
    this.db.select(bookingFields).from(booking).where(and(eq(booking.userId, userId), eq(booking.organizationId, orgId))).orderBy(desc(booking.createdAt));
}
