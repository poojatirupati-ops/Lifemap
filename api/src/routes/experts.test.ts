import { createHmac } from "node:crypto";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { mockClient } from "aws-sdk-client-mock";
import { eq, sql } from "drizzle-orm";
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
  for (const calLink of ["../evil", "team/acme/30min"]) // only `<user>/<event>`: a team link's organizer would never match
    expect((await t.req("/api/auth/update-user", { method: "POST", body: { calLink } }, adviser)).status).toBe(400);
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
  const first = ((await res.json()) as B).booking;
  expect(first).toMatchObject({ adviserId, status: "pending", share, calUid: null });
  // reopening the embed reuses the open pending booking; the consent is recorded again only when the share changed
  const again = async (b: typeof body) => ((await (await req("/api/bookings", { method: "POST", body: b }, a)).json()) as B).booking;
  expect((await again(body)).id).toBe(first.id);
  expect(await again({ ...body, share: { ...share, docs: true } })).toMatchObject({ id: first.id, share: { ...share, docs: true } });
  expect((await again({ ...body, share: { ...share, docs: true }, shareVersion: "share-v2" })).id).toBe(first.id); // new wording: consent again
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

  expect(await db.select({ granted: consentEvent.granted, version: consentEvent.version }).from(consentEvent).orderBy(consentEvent.id)).toEqual([{ granted: true, version: "share-v1" }, { granted: true, version: "share-v1" }, { granted: true, version: "share-v2" }]);
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
  const created = { uid: "cal-1", startTime: "2026-11-10T10:00:00.000Z", endTime: "2026-11-10T10:45:00.000Z", metadata: { bookingId: booking.id }, organizer: { username: "niamh" } };

  expect((await send("BOOKING_CREATED", created, "wrong")).status).toBe(401);
  expect(await (await send("BOOKING_CREATED", created, "whsec-a", "org-a")).json()).toEqual({ ok: false }); // another tenant's booking: ignored
  expect((await send("BOOKING_CREATED", { ...created, metadata: { bookingId: "not-yet" } })).status).toBe(409); // no tenant has it yet: Cal.com retries
  expect(await (await send("BOOKING_CREATED", { ...created, metadata: null })).json()).toEqual({ ok: false }); // no metadata, unknown uid: a foreign booking
  expect((await send("BOOKING_CREATED", created)).status).toBe(200);
  expect((await send("BOOKING_CREATED", created)).status).toBe(200); // a retry
  const [mine] = ((await (await req("/api/bookings", {}, a)).json()) as { bookings: B["booking"][] }).bookings;
  expect(mine).toMatchObject({ status: "booked", calUid: "cal-1", startsAt: "2026-11-10T10:00:00.000Z" });

  const status = async () => ((await (await req("/api/bookings", {}, a)).json()) as { bookings: B["booking"][] }).bookings.map((x) => x.status);
  expect(await (await send("MEETING_ENDED", { uid: "cal-1" })).json()).toEqual({ ok: true });
  expect(await status()).toEqual(["ended"]);
  // the no-show trigger carries bookingUid only; a late MEETING_ENDED or cancel never undoes it
  expect(await (await send("AFTER_GUESTS_CAL_VIDEO_NO_SHOW", { bookingUid: "cal-1" })).json()).toEqual({ ok: true });
  expect(await (await send("BOOKING_CANCELLED", { uid: "cal-1" })).json()).toEqual({ ok: false }); // recorded, not applied, not published
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
  expect(entries.map((e) => JSON.parse(e.Detail!).id)).toEqual(["cal-1:BOOKING_CREATED", "cal-1:BOOKING_CREATED", "cal-1:MEETING_ENDED", "cal-1:AFTER_GUESTS_CAL_VIDEO_NO_SHOW", "cal-2:BOOKING_CREATED", "cal-2:BOOKING_CANCELLED"]);
  expect(entries[0]).toMatchObject({ EventBusName: "lifemap-bookings", Source: "lifemap.bookings", DetailType: "lifemap.booking.BOOKING_CREATED" });
  expect(JSON.parse(entries[0].Detail!)).toMatchObject({
    specversion: "1.0", source: "lifemap/bookings", type: "lifemap.booking.BOOKING_CREATED",
    data: { tenant: "lifemap-direct", booking: booking.id, adviser: adviserId, status: "booked", startsAt: created.startTime, endsAt: created.endTime, idempotencyKey: "cal-1:BOOKING_CREATED" },
  });

  eventBridge.on(PutEventsCommand).resolves({ FailedEntryCount: 1, Entries: [{ ErrorCode: "InternalFailure" }] });
  expect((await send("BOOKING_NO_SHOW_UPDATED", { bookingUid: "cal-1", attendees: [{ noShow: false }] })).status).toBe(500); // Cal.com retries
  eventBridge.restore();
  vi.unstubAllEnvs();
});

test("Cal.com webhook state machine: confirmation, adviser check, reschedules by current uid only, no revival, no-show mark and unmark, publish only what applied", async () => {
  const { db, req, a, adviserId } = await setUp();
  vi.stubEnv("CAL_WEBHOOK_SECRETS", JSON.stringify({ "lifemap-direct": "whsec" }));
  vi.stubEnv("EVENT_BUS", "eventbridge");
  vi.stubEnv("EVENT_BUS_NAME", "lifemap-bookings");
  const eventBridge = mockClient(EventBridgeClient);
  eventBridge.on(PutEventsCommand).resolves({ FailedEntryCount: 0, Entries: [{ EventId: "e1" }] });
  const { req: hook } = await testApp(db);
  const send = (trigger: string, payload: Record<string, unknown>, createdAt = "2026-11-02T10:00:00.000Z") => {
    const raw = JSON.stringify({ triggerEvent: trigger, createdAt, payload });
    return hook("/api/webhooks/cal/lifemap-direct", { method: "POST", body: JSON.parse(raw), headers: { "x-cal-signature-256": createHmac("sha256", "whsec").update(raw).digest("hex") } });
  };
  const ok = async (trigger: string, payload: Record<string, unknown>, at?: string) => ((await (await send(trigger, payload, at)).json()) as { ok: boolean }).ok;
  const create = async () => ((await (await req("/api/bookings", { method: "POST", body: { adviserId, share, shareVersion: "share-v1" } }, a)).json()) as B).booking;
  const get = async (id: string) => ((await (await req("/api/bookings", {}, a)).json()) as { bookings: B["booking"][] }).bookings.find((b) => b.id === id)!;
  const by = (id: string, uid: string, extra: Record<string, unknown> = {}) => ({ uid, metadata: { bookingId: id }, organizer: { username: "niamh" }, startTime: "2026-11-10T10:00:00.000Z", ...extra });

  // needs the adviser's confirmation: pending with a cal_uid, then booked
  const x = await create();
  expect(await ok("BOOKING_REQUESTED", by(x.id, "r1"))).toBe(true);
  expect(await get(x.id)).toMatchObject({ status: "pending", calUid: "r1" });
  expect(await ok("BOOKING_CREATED", by(x.id, "r1"))).toBe(true);
  expect(await get(x.id)).toMatchObject({ status: "booked", calUid: "r1" });

  // reschedules out of order: the later one answers 409 (nothing recorded) and applies on Cal.com's retry, once the one it follows has landed
  const day = (d: number) => `2026-11-1${d}T10:00:00.000Z`;
  expect((await send("BOOKING_RESCHEDULED", by(x.id, "r3", { rescheduleUid: "r2", startTime: day(2) }))).status).toBe(409);
  expect(await db.select().from(bookingEvent).where(eq(bookingEvent.calUid, "r3"))).toEqual([]);
  expect(await ok("BOOKING_RESCHEDULED", by(x.id, "r2", { rescheduleUid: "r1", startTime: day(1) }))).toBe(true);
  expect(await ok("BOOKING_RESCHEDULED", by(x.id, "r3", { rescheduleUid: "r2", startTime: day(2) }))).toBe(true);
  expect(await ok("BOOKING_RESCHEDULED", by(x.id, "r4", { rescheduleUid: "r3", organizer: { username: "mallory" } }))).toBe(false); // not the adviser
  expect(await ok("BOOKING_CANCELLED", { uid: "r1", metadata: { bookingId: x.id } })).toBe(false); // an old Cal.com booking
  expect(await get(x.id)).toMatchObject({ status: "booked", calUid: "r3", startsAt: day(2) });
  // cancelled stays cancelled: a late create or reschedule does not revive it
  expect(await ok("BOOKING_CANCELLED", { uid: "r3", metadata: { bookingId: x.id } })).toBe(true);
  expect(await ok("BOOKING_RESCHEDULED", by(x.id, "r5", { rescheduleUid: "r3" }))).toBe(false);
  expect(await ok("BOOKING_CREATED", by(x.id, "r3"))).toBe(false);
  expect(await get(x.id)).toMatchObject({ status: "cancelled", calUid: "r3" });

  // the organizer must be the booking's adviser (their Cal.com username)
  const y = await create();
  expect(await ok("BOOKING_CREATED", by(y.id, "y1", { organizer: { username: "mallory" } }))).toBe(false);
  expect(await get(y.id)).toMatchObject({ status: "pending", calUid: null });
  expect(await ok("BOOKING_CREATED", by(y.id, "y2"))).toBe(true);

  // no-show: mark, unmark (back to booked: the meeting never ended), a retry of the unmark republishes, and a later mark applies again
  const t = (m: number) => `2026-11-10T11:0${m}:00.000Z`;
  expect(await ok("BOOKING_NO_SHOW_UPDATED", { bookingUid: "y2", attendees: [{ noShow: true }] }, t(1))).toBe(true);
  expect((await get(y.id)).status).toBe("no_show");
  expect(await ok("BOOKING_NO_SHOW_UPDATED", { bookingUid: "y2", attendees: [{ noShow: false }], noShowHost: false }, t(2))).toBe(true);
  expect((await get(y.id)).status).toBe("booked");
  expect(await ok("BOOKING_NO_SHOW_UPDATED", { bookingUid: "y2", attendees: [{ noShow: false }], noShowHost: false }, t(2))).toBe(true);
  expect(await ok("BOOKING_NO_SHOW_UPDATED", { bookingUid: "y2", noShowHost: true }, t(3))).toBe(true);
  expect((await get(y.id)).status).toBe("no_show");
  expect(await ok("BOOKING_NO_SHOW_UPDATED", { bookingUid: "y2" }, t(4))).toBe(false); // no flag: ignored

  // the adviser declines a requested booking: cancelled, the share withdrawn
  const z = await create();
  expect(await ok("BOOKING_REQUESTED", by(z.id, "z1"))).toBe(true);
  expect(await ok("BOOKING_REJECTED", { uid: "z1", metadata: { bookingId: z.id } })).toBe(true);
  expect(await get(z.id)).toMatchObject({ status: "cancelled", calUid: "z1" });
  expect(await db.select({ granted: consentEvent.granted }).from(consentEvent).where(sql`${consentEvent.detail}->>'bookingId' = ${z.id}`).orderBy(consentEvent.id)).toEqual([{ granted: true }, { granted: false }]);

  // the uid-only triggers of a booking we do not have: foreign, 200
  expect((await send("MEETING_ENDED", { uid: "elsewhere" })).status).toBe(200);
  expect(await db.select({ trigger: bookingEvent.trigger, status: bookingEvent.status }).from(bookingEvent).where(eq(bookingEvent.calUid, "y2")).orderBy(bookingEvent.id)).toEqual([
    { trigger: "BOOKING_CREATED", status: "booked" },
    { trigger: `BOOKING_NO_SHOW_UPDATED:true:${t(1)}`, status: "no_show" },
    { trigger: `BOOKING_NO_SHOW_UPDATED:false:${t(2)}`, status: "booked" },
    { trigger: `BOOKING_NO_SHOW_UPDATED:true:${t(3)}`, status: "no_show" },
  ]);
  // only applied transitions (and the retry of one) are published, each with the status it set
  const events = eventBridge.commandCalls(PutEventsCommand).map((c) => JSON.parse(c.args[0].input.Entries![0].Detail!) as { id: string; data: { status: string } });
  expect(events.map((e) => [e.id, e.data.status])).toEqual([
    ["r1:BOOKING_REQUESTED", "pending"], ["r1:BOOKING_CREATED", "booked"], ["r2:BOOKING_RESCHEDULED", "booked"], ["r3:BOOKING_RESCHEDULED", "booked"], ["r3:BOOKING_CANCELLED", "cancelled"],
    ["y2:BOOKING_CREATED", "booked"], [`y2:BOOKING_NO_SHOW_UPDATED:true:${t(1)}`, "no_show"], [`y2:BOOKING_NO_SHOW_UPDATED:false:${t(2)}`, "booked"],
    [`y2:BOOKING_NO_SHOW_UPDATED:false:${t(2)}`, "booked"], [`y2:BOOKING_NO_SHOW_UPDATED:true:${t(3)}`, "no_show"],
    ["z1:BOOKING_REQUESTED", "pending"], ["z1:BOOKING_REJECTED", "cancelled"],
  ]);
  eventBridge.restore();
  vi.unstubAllEnvs();
});

test("a booking with another adviser cancels the caller's other open pending bookings and withdraws their shares", async () => {
  const { db, req, login, a, adviserId } = await setUp();
  const sean = await login("sean@example.com");
  await req("/api/auth/update-user", { method: "POST", body: { calLink: "sean/30min" } }, sean);
  const [{ id: seanId }] = await db.select({ id: user.id }).from(user).where(eq(user.email, "sean@example.com"));
  await db.update(member).set({ role: "adviser" }).where(eq(member.userId, seanId));
  const book = async (adviser: string) => ((await (await req("/api/bookings", { method: "POST", body: { adviserId: adviser, share, shareVersion: "share-v1" } }, a)).json()) as B).booking;

  const first = await book(adviserId);
  const second = await book(seanId);
  expect(second.id).not.toBe(first.id);
  expect((await book(seanId)).id).toBe(second.id); // same adviser: reused
  const bookings = ((await (await req("/api/bookings", {}, a)).json()) as { bookings: B["booking"][] }).bookings;
  expect(Object.fromEntries(bookings.map((b) => [b.id, b.status]))).toEqual({ [first.id]: "cancelled", [second.id]: "pending" });
  const shares = await db.select({ granted: consentEvent.granted, detail: consentEvent.detail }).from(consentEvent).orderBy(consentEvent.id);
  expect(shares.map((c) => [(c.detail as { bookingId: string }).bookingId, c.granted])).toEqual([[first.id, true], [first.id, false], [second.id, true]]);
});
