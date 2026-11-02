import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Db } from "../db";
import { booking, consentEvent } from "../db/schema";
import type { Env } from "../guard";
import { requireFeature } from "../tenant";

const text = (max: number) => z.string().trim().min(1).max(max);
const newBooking = z.object({
  adviserId: text(64), // from the app's seeded adviser list; no adviser accounts yet
  slot: text(64),
  mode: text(32),
  share: z.strictObject({ report: z.boolean(), finances: z.boolean(), docs: z.boolean(), moneyProfile: z.boolean() }),
  shareVersion: text(64), // wording version of the share consent shown
});
const fields = { id: booking.id, adviserId: booking.adviserId, slot: booking.slot, mode: booking.mode, share: booking.share, status: booking.status, createdAt: booking.createdAt, cancelledAt: booking.cancelledAt };

/**
 * Adviser bookings, the caller's in the session's tenant. Creating one records the share consent (consent_event kind adviser_share, detail = exactly what is shared);
 * cancelling records its withdrawal. POST is gated by the tenant's adviserBooking flag; list and cancel always work.
 */
export const expertRoutes = (db: Db) => {
  const r = new Hono<Env>();
  const mine = (userId: string, orgId: string) => and(eq(booking.userId, userId), eq(booking.organizationId, orgId));

  r.post("/bookings", requireFeature(db, "adviserBooking"), zValidator("json", newBooking, (res, c) => (res.success ? undefined : c.json({ error: "invalid booking" }, 400))), async (c) => {
    const { userId, orgId: organizationId } = c.var;
    const { shareVersion, ...b } = c.req.valid("json");
    const id = randomUUID();
    const row = await db.transaction(async (tx) => {
      const [created] = await tx.insert(booking).values({ id, userId, organizationId, ...b }).returning(fields);
      await tx.insert(consentEvent).values({
        userId, organizationId, kind: "adviser_share", granted: Object.values(b.share).some(Boolean), version: shareVersion,
        detail: { bookingId: id, adviserId: b.adviserId, items: b.share },
      });
      return created;
    });
    return c.json({ booking: row }, 201);
  });

  r.get("/bookings", async (c) =>
    c.json({ bookings: await db.select(fields).from(booking).where(mine(c.var.userId, c.var.orgId)).orderBy(desc(booking.createdAt)) }));

  // Idempotent: cancelling a cancelled booking returns it unchanged.
  r.post("/bookings/:id/cancel", async (c) => {
    const { userId, orgId: organizationId } = c.var;
    const ofMine = and(mine(userId, organizationId), eq(booking.id, c.req.param("id")));
    const row = await db.transaction(async (tx) => {
      const [cancelled] = await tx.update(booking).set({ status: "cancelled", cancelledAt: new Date() })
        .where(and(ofMine, eq(booking.status, "booked"))).returning(fields);
      if (!cancelled) return (await tx.select(fields).from(booking).where(ofMine))[0];
      // the wording version this booking's share was granted under
      const [granted] = await tx.select({ version: consentEvent.version }).from(consentEvent)
        .where(and(eq(consentEvent.userId, userId), eq(consentEvent.organizationId, organizationId), eq(consentEvent.kind, "adviser_share"), sql`${consentEvent.detail}->>'bookingId' = ${cancelled.id}`));
      await tx.insert(consentEvent).values({
        userId, organizationId, kind: "adviser_share", granted: false, version: granted?.version ?? "unknown",
        detail: { bookingId: cancelled.id, adviserId: cancelled.adviserId, items: cancelled.share },
      });
      return cancelled;
    });
    return row ? c.json({ booking: row }) : c.json({ error: "not found" }, 404);
  });

  return r;
};
