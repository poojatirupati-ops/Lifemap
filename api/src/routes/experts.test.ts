import { createHmac } from "node:crypto";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { mockClient } from "aws-sdk-client-mock";
import { eq } from "drizzle-orm";
import { expect, test, vi } from "vitest";
import { bookingEvent, consentEvent, member, organization, user } from "../db/schema";
import { testApp } from "../testing";

// PostHog client stub: flags per organization group, used once POSTHOG_API_KEY is set.
const groups = vi.hoisted(() => ({}) as Record<string, Record<string, boolean>>);
vi.mock("posthog-node", () => ({ PostHog: class { waitForLocalEvaluationReady = async () => true; getAllFlags = async (_: string, o: { groups: { organization: string } }) => groups[o.groups.organization] ?? {}; } }));

const share = { report: true, finances: true, docs: false, moneyProfile: false };
const profile = { qualifications: "QFA", languages: "English, Irish", location: "Dublin 2", meetingMode: "Video" };
type B = { booking: { id: string; status: string; calUid: string | null; startsAt: string | null } };

/** A signed-in app with bookings on for LifeMap Direct and one adviser (role adviser, Cal.com link set through Better Auth's updateUser). */
async function setUp() {
  vi.stubEnv("POSTHOG_API_KEY", "phc_test");
  groups["lifemap-direct"] = { adviserBooking: true };
  const t = await testApp();
  const adviser = await t.login("niamh@example.com");
  expect((await t.req("/api/auth/update-user", { method: "POST", body: { calLink: "../evil" } }, adviser)).status).toBe(400);
  expect((await t.req("/api/auth/update-user", { method: "POST", body: { calLink: "niamh/45min", adviserProfile: profile } }, adviser)).status).toBe(200);
  const [{ id: adviserId }] = await t.db.select({ id: user.id }).from(user).where(eq(user.email, "niamh@example.com"));
  await t.db.update(member).set({ role: "adviser" }).where(eq(member.userId, adviserId));
  return { ...t, adviserId, a: await t.login("a@example.com") };
}

test("advisers and bookings: the tenant's advisers only; a pending booking records the share consent; other users and tenants get nothing; flag off = 403", async () => {
  const { db, req, login, a, adviserId } = await setUp();
  await db.insert(organization).values({ id: "org-a", name: "CU A", slug: "cu-a" });
  expect((await req("/api/bookings")).status).toBe(401);
  // a customer with a calLink is not listed: only role adviser
  await req("/api/auth/update-user", { method: "POST", body: { calLink: "a/30min" } }, a);
  expect(((await (await req("/api/advisers", {}, a)).json()) as { advisers: unknown[] }).advisers)
    .toEqual([{ id: adviserId, name: expect.any(String), image: null, calLink: "niamh/45min", profile }]);

  const body = { adviserId, share, shareVersion: "share-v1" };
  expect((await req("/api/bookings", { method: "POST", body: { ...body, share: { report: true } } }, a)).status).toBe(400);
  expect((await req("/api/bookings", { method: "POST", body: { ...body, adviserId: "someone" } }, a)).status).toBe(400);
  const res = await req("/api/bookings", { method: "POST", body }, a);
  expect(res.status).toBe(201);
  expect(((await res.json()) as B).booking).toMatchObject({ adviserId, status: "pending", share, calUid: null });
  expect(((await (await req("/api/bookings", {}, a)).json()) as { bookings: unknown[] }).bookings).toHaveLength(1);

  // another user, and the same person in another tenant (no advisers there): nothing listed, cannot book that adviser
  for (const other of [await login("b@example.com"), await login("a@example.com", "org-a")])
    expect(((await (await req("/api/bookings", {}, other)).json()) as { bookings: unknown[] }).bookings).toEqual([]);
  groups["org-a"] = { adviserBooking: true };
  const elsewhere = await login("a@example.com", "org-a");
  expect(((await (await req("/api/advisers", {}, elsewhere)).json()) as { advisers: unknown[] }).advisers).toEqual([]);
  expect((await req("/api/bookings", { method: "POST", body }, elsewhere)).status).toBe(400);
  groups["org-a"] = {};
  expect((await req("/api/bookings", { method: "POST", body }, elsewhere)).status).toBe(403);

  expect(await db.select({ granted: consentEvent.granted, version: consentEvent.version }).from(consentEvent)).toEqual([{ granted: true, version: "share-v1" }]);
  expect(((await (await req("/api/me/export", {}, a)).json()) as { bookings: unknown[] }).bookings).toHaveLength(1);
  vi.unstubAllEnvs();
});

test("Cal.com webhook: signed per tenant; confirms, ends, marks no-shows, cancels (withdrawing the share) and records each delivery once and publishes it, again on a retry; 500 when publishing fails", async () => {
  const { db, req, a, adviserId } = await setUp();
  vi.stubEnv("CAL_WEBHOOK_SECRETS", JSON.stringify({ "lifemap-direct": "whsec-direct", "org-a": "whsec-a" }));
  vi.stubEnv("EVENT_BUS", "eventbridge");
  vi.stubEnv("EVENT_BUS_NAME", "lifemap-bookings");
  const eventBridge = mockClient(EventBridgeClient);
  eventBridge.on(PutEventsCommand).resolves({ FailedEntryCount: 0, Entries: [{ EventId: "e1" }] });
  // the event bus is chosen when the app starts, so start it again with EventBridge
  const { req: hook } = await testApp(db);
  const { booking } = (await (await req("/api/bookings", { method: "POST", body: { adviserId, share, shareVersion: "share-v1" } }, a)).json()) as B;

  const send = (trigger: string, payload: Record<string, unknown>, secret = "whsec-direct", tenant = "lifemap-direct") => {
    const raw = JSON.stringify({ triggerEvent: trigger, createdAt: "2026-11-02T10:00:00.000Z", payload });
    return hook(`/api/webhooks/cal/${tenant}`, { method: "POST", body: JSON.parse(raw), headers: { "x-cal-signature-256": createHmac("sha256", secret).update(raw).digest("hex") } });
  };
  const created = { uid: "cal-1", startTime: "2026-11-10T10:00:00.000Z", endTime: "2026-11-10T10:45:00.000Z", metadata: { bookingId: booking.id } };

  expect((await send("BOOKING_CREATED", created, "wrong")).status).toBe(401);
  expect(await (await send("BOOKING_CREATED", created, "whsec-a", "org-a")).json()).toEqual({ ok: false }); // not that tenant's booking
  expect((await send("BOOKING_CREATED", created)).status).toBe(200);
  expect((await send("BOOKING_CREATED", created)).status).toBe(200); // a retry
  const [mine] = ((await (await req("/api/bookings", {}, a)).json()) as { bookings: B["booking"][] }).bookings;
  expect(mine).toMatchObject({ status: "booked", calUid: "cal-1", startsAt: "2026-11-10T10:00:00.000Z" });

  const status = async () => ((await (await req("/api/bookings", {}, a)).json()) as { bookings: B["booking"][] }).bookings.map((x) => x.status);
  expect(await (await send("MEETING_ENDED", { uid: "cal-1" })).json()).toEqual({ ok: true });
  expect(await status()).toEqual(["ended"]);
  // the no-show trigger carries bookingUid only; a late MEETING_ENDED or cancel never undoes it
  expect(await (await send("AFTER_GUESTS_CAL_VIDEO_NO_SHOW", { bookingUid: "cal-1" })).json()).toEqual({ ok: true });
  await send("BOOKING_CANCELLED", { uid: "cal-1" });
  expect(await status()).toEqual(["no_show"]);

  // a second booking, cancelled on Cal.com: the share is withdrawn
  const { booking: second } = (await (await req("/api/bookings", { method: "POST", body: { adviserId, share, shareVersion: "share-v1" } }, a)).json()) as B;
  await send("BOOKING_CREATED", { ...created, uid: "cal-2", metadata: { bookingId: second.id } });
  await send("BOOKING_CANCELLED", { uid: "cal-2" });
  expect(await status()).toEqual(["cancelled", "no_show"]);
  expect(await db.select({ trigger: bookingEvent.trigger }).from(bookingEvent).orderBy(bookingEvent.id)).toEqual(
    ["BOOKING_CREATED", "MEETING_ENDED", "AFTER_GUESTS_CAL_VIDEO_NO_SHOW", "BOOKING_CANCELLED", "BOOKING_CREATED", "BOOKING_CANCELLED"].map((trigger) => ({ trigger })),
  );
  expect(await db.select({ granted: consentEvent.granted, version: consentEvent.version }).from(consentEvent).orderBy(consentEvent.id))
    .toEqual([{ granted: true, version: "share-v1" }, { granted: true, version: "share-v1" }, { granted: false, version: "share-v1" }]);

  const entries = eventBridge.commandCalls(PutEventsCommand).map((c) => c.args[0].input.Entries![0]);
  expect(entries.map((e) => JSON.parse(e.Detail!).id).slice(0, 4)).toEqual(["cal-1:BOOKING_CREATED", "cal-1:BOOKING_CREATED", "cal-1:MEETING_ENDED", "cal-1:AFTER_GUESTS_CAL_VIDEO_NO_SHOW"]);
  expect(entries[0]).toMatchObject({ EventBusName: "lifemap-bookings", Source: "lifemap.bookings", DetailType: "lifemap.booking.BOOKING_CREATED" });
  expect(JSON.parse(entries[0].Detail!)).toMatchObject({
    specversion: "1.0", source: "lifemap/bookings", type: "lifemap.booking.BOOKING_CREATED",
    data: { tenant: "lifemap-direct", booking: booking.id, adviser: adviserId, startsAt: created.startTime, endsAt: created.endTime, idempotencyKey: "cal-1:BOOKING_CREATED" },
  });

  eventBridge.on(PutEventsCommand).resolves({ FailedEntryCount: 1, Entries: [{ ErrorCode: "InternalFailure" }] });
  expect((await send("BOOKING_NO_SHOW_UPDATED", { bookingUid: "cal-1" })).status).toBe(500); // Cal.com retries
  eventBridge.restore();
  vi.unstubAllEnvs();
});
