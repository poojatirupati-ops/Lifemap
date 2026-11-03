import type { INestApplicationContext } from "@nestjs/common";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { AdvisersService } from "../bookings/advisers.service";
import { BookingsService } from "../bookings/bookings.service";
import { CalService, calWebhook } from "../bookings/cal.service";
import { booking } from "../db/schema";
import { type Env, requireFeature } from "../guard";
import { doc, docPublic, errors } from "../openapi";

const text = (max: number) => z.string().trim().min(1).max(max);
const newBooking = createInsertSchema(booking, {
  adviserId: text(64), // one of the tenant's advisers (GET /api/advisers)
  share: z.strictObject({ report: z.boolean(), finances: z.boolean(), docs: z.boolean(), moneyProfile: z.boolean() }),
}).pick({ adviserId: true, share: true }).extend({
  shareVersion: text(64), // wording version of the share consent shown
});

/** Advisers and their bookings (Cal.com). POST /bookings is gated by the tenant's adviserBooking flag; the rest always works. */
export const expertRoutes = (nest: INestApplicationContext) => {
  const r = new Hono<Env>();
  const bookings = nest.get(BookingsService);
  const advisers = nest.get(AdvisersService);
  const cal = nest.get(CalService);

  r.get("/advisers", doc({ tags: ["bookings"], summary: "The tenant's advisers", description: "Members with role `adviser` who have set a Cal.com link (user.calLink).", responses: { 200: { description: "`{ advisers }`" } } }), async (c) =>
    c.json({ advisers: await advisers.list(c.var.orgId) }));

  r.post("/bookings", doc({
    tags: ["bookings"], flag: "adviserBooking", summary: "Start a booking (pending) and record the share consent",
    description: "Also writes a consent_event (kind adviser_share, detail = booking, adviser and exactly what is shared). The app then opens the adviser's Cal.com embed with this booking's id as metadata; Cal.com's webhook confirms it.",
    responses: { 201: { description: "`{ booking }`" }, 400: errors[400] },
  }), requireFeature("adviserBooking"), validator("json", newBooking, (res, c) => (res.success ? undefined : c.json({ error: "invalid booking" }, 400))), async (c) => {
    const row = await bookings.create(c.var.userId, c.var.orgId, c.req.valid("json"));
    return row ? c.json({ booking: row }, 201) : c.json({ error: "unknown adviser" }, 400);
  });

  r.get("/bookings", doc({ tags: ["bookings"], summary: "The caller's bookings", responses: { 200: { description: "`{ bookings }`, newest first" } } }), async (c) =>
    c.json({ bookings: await bookings.list(c.var.userId, c.var.orgId) }));

  r.post("/webhooks/cal/:tenant", docPublic({
    tags: ["bookings"], summary: "Cal.com team webhook for one tenant",
    description: "Signed with the tenant's secret (x-cal-signature-256, HMAC SHA-256 of the raw body). Updates the booking, records the delivery and publishes a CloudEvent; 500 when publishing fails, so Cal.com retries. Setup: docs/runbook.md.",
    responses: {
      200: { description: "`{ ok }`: false when the trigger or booking is not one we track, or the transition was rejected (recorded, not applied)" },
      400: errors[400], 401: { description: "Bad signature" }, 409: { description: "A reschedule that arrived before the one it follows: Cal.com retries" },
    },
  }), async (c) => {
    const tenant = c.req.param("tenant");
    if (!cal.verify(tenant, await c.req.text(), c.req.header("x-cal-signature-256"))) return c.json({ error: "invalid signature" }, 401);
    const hook = calWebhook.safeParse(await c.req.json().catch(() => null));
    if (!hook.success) return c.json({ error: "invalid webhook" }, 400);
    const outcome = await cal.handle(tenant, hook.data);
    return outcome === "later" ? c.json({ error: "the reschedule this follows has not arrived yet" }, 409) : c.json({ ok: outcome === "applied" });
  });

  return r;
};
