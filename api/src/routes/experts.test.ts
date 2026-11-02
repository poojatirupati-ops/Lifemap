import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { mockClient } from "aws-sdk-client-mock";
import { expect, test, vi } from "vitest";
import { consentEvent, organization } from "../db/schema";
import { testApp } from "../testing";

// PostHog client stub: flags per organization group, used once POSTHOG_API_KEY is set.
const groups = vi.hoisted(() => ({}) as Record<string, Record<string, boolean>>);
vi.mock("posthog-node", () => ({ PostHog: class { waitForLocalEvaluationReady = async () => true; getAllFlags = async (_: string, o: { groups: { organization: string } }) => groups[o.groups.organization] ?? {}; } }));

const body = { adviserId: "niamh-byrne", slot: "2026-11-10T10:00", mode: "video", share: { report: true, finances: true, docs: false, moneyProfile: false }, shareVersion: "share-v1" };
type B = { booking: { id: string; status: string } };

test("bookings: create records the share consent, list, cancel records the withdrawal; other users and tenants get nothing; flag off = 403", async () => {
  const { db, req, login } = await testApp();
  await db.insert(organization).values({ id: "org-a", name: "CU A", slug: "cu-a", metadata: JSON.stringify({ host: "app.cu-a.example" }) });
  expect((await req("/api/bookings")).status).toBe(401);
  const a = await login("a@example.com");
  expect((await req("/api/bookings", { method: "POST", body }, a)).status).toBe(403); // off by default
  process.env.POSTHOG_API_KEY = "phc_test"; // flag on for LifeMap Direct only
  groups["lifemap-direct"] = { adviserBooking: true };
  expect((await req("/api/bookings", { method: "POST", body: { ...body, share: { report: true } } }, a)).status).toBe(400);

  const res = await req("/api/bookings", { method: "POST", body }, a);
  expect(res.status).toBe(201);
  const { booking } = (await res.json()) as B;
  expect(booking).toMatchObject({ adviserId: "niamh-byrne", status: "booked", share: body.share });
  expect(((await (await req("/api/bookings", {}, a)).json()) as { bookings: unknown[] }).bookings).toHaveLength(1);

  // another user, and the same person in another tenant: nothing listed, cannot cancel
  for (const other of [await login("b@example.com"), await login("a@example.com", { "x-forwarded-host": "app.cu-a.example" })]) {
    expect(((await (await req("/api/bookings", {}, other)).json()) as { bookings: unknown[] }).bookings).toEqual([]);
    expect((await req(`/api/bookings/${booking.id}/cancel`, { method: "POST" }, other)).status).toBe(404);
  }

  expect(((await (await req(`/api/bookings/${booking.id}/cancel`, { method: "POST" }, a)).json()) as B).booking.status).toBe("cancelled");
  await req(`/api/bookings/${booking.id}/cancel`, { method: "POST" }, a); // idempotent: no second withdrawal

  const detail = { bookingId: booking.id, adviserId: "niamh-byrne", items: body.share };
  expect(await db.select({ granted: consentEvent.granted, version: consentEvent.version, detail: consentEvent.detail, org: consentEvent.organizationId }).from(consentEvent).orderBy(consentEvent.id))
    .toEqual([{ granted: true, version: "share-v1", detail, org: "lifemap-direct" }, { granted: false, version: "share-v1", detail, org: "lifemap-direct" }]);
  expect(((await (await req("/api/me/export", {}, a)).json()) as { bookings: unknown[] }).bookings).toHaveLength(1);
});

test("booking confirmation email: to the user, from the tenant, with the slot", async () => {
  vi.stubEnv("OTP_SENDER", "ses");
  vi.stubEnv("OTP_FROM", "noreply@lifemap.example");
  vi.stubEnv("POSTHOG_API_KEY", "phc_test");
  groups["lifemap-direct"] = { adviserBooking: true };
  const ses = mockClient(SESv2Client);
  ses.on(SendEmailCommand).resolves({ MessageId: "m1" });
  const { req, login } = await testApp();
  expect((await req("/api/bookings", { method: "POST", body }, await login("a@example.com"))).status).toBe(201);
  const [mail] = ses.commandCalls(SendEmailCommand).map((c) => c.args[0].input);
  expect(mail.Destination).toEqual({ ToAddresses: ["a@example.com"] });
  expect(mail.FromEmailAddress).toMatch(/<noreply@lifemap\.example>$/);
  expect(mail.Content?.Simple?.Body?.Text?.Data).toContain("2026-11-10T10:00 (video)");
  ses.restore();
  vi.unstubAllEnvs();
});
