import { getTableColumns, getTableName, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { expect, test, vi } from "vitest";
import { emailHash } from "../auth";
import { schema } from "../db";
import { testApp } from "../testing";

const plan = { whyNote: "retire early", goals: [] };

test("consents: append-only, withdrawal recorded, history and versions kept; notice is an acknowledgement", async () => {
  const { req, login } = await testApp();
  expect((await req("/api/consents", { method: "POST", body: { marketing: { granted: true, version: "m1" } } })).status).toBe(401);
  const a = await login("a@example.com");
  const post = (body: unknown) => req("/api/consents", { method: "POST", body }, a);

  for (const bad of [null, { marketing: true }, { marketing: { granted: "yes", version: "m1" } }, { marketing: { granted: true } }, { notice: "" }])
    expect((await post(bad)).status, JSON.stringify(bad)).toBe(400);

  await post({ notice: "n1", marketing: { granted: true, version: "m1" } });
  await post({ notice: "n1" }); // re-acknowledging keeps the first time
  await post({ analytics: { granted: true, version: "a1" } });
  const res = await post({ marketing: { granted: false, version: "m2" }, analytics: { granted: false, version: "a1" } });
  expect(res.status).toBe(200);
  const state = (await res.json()) as { consents: Record<"marketing" | "analytics", { granted: boolean; version: string }>; notice: { version: string } };
  expect(state.consents.marketing).toMatchObject({ granted: false, version: "m2" });
  expect(state.consents.analytics).toMatchObject({ granted: false, version: "a1" });
  expect(state.notice.version).toBe("n1");
  expect(await (await req("/api/consents", {}, a)).json()).toEqual(JSON.parse(JSON.stringify(state)));

  const exp = (await (await req("/api/me/export", {}, a)).json()) as { consents: unknown[]; notices: unknown[] };
  expect(exp.consents).toMatchObject([
    { kind: "marketing", granted: true, version: "m1" }, { kind: "analytics", granted: true, version: "a1" },
    { kind: "marketing", granted: false, version: "m2" }, { kind: "analytics", granted: false, version: "a1" },
  ]);
  expect(exp.notices).toHaveLength(1);
});

test("export: the caller's data only, as a JSON attachment; 401 anonymous", async () => {
  const { req, login } = await testApp();
  expect((await req("/api/me/export")).status).toBe(401);
  const [a, b] = [await login("a@example.com"), await login("b@example.com")];
  await req("/api/plan", { method: "PUT", body: { version: 0, plan } }, a);
  await req("/api/plan", { method: "PUT", body: { version: 0, plan: { whyNote: "B-SECRET" } } }, b);
  await req("/api/consents", { method: "POST", body: { notice: "n1", marketing: { granted: true, version: "m1" } } }, b);

  const res = await req("/api/me/export", {}, a);
  expect(res.status).toBe(200);
  expect(res.headers.get("content-disposition")).toMatch(/^attachment; filename="lifemap-my-data\.json"$/);
  expect(res.headers.get("cache-control")).toBe("no-store");
  const text = await res.text();
  expect(text).not.toMatch(/b@example|B-SECRET/);
  expect(text).not.toMatch(/"token"|publicKey/);
  const body = JSON.parse(text);
  expect(body.account.email).toBe("a@example.com");
  expect(body.plan).toMatchObject({ version: 1, data: plan });
  expect(body.consents).toEqual([]);
  expect(body.sessions.length).toBeGreaterThan(0);
});

test("DELETE /api/me erases every row for that user, their OTP rows, keeps a PII-free marker; others untouched", async () => {
  const { db, req, login, sendCode } = await testApp();
  expect((await req("/api/me", { method: "DELETE" })).status).toBe(401);
  const email = "del_me@example.com"; // `_` would be a LIKE wildcard
  const [a, b] = [await login(email), await login("delxme@example.com")];
  for (const cookie of [a, b]) {
    await req("/api/plan", { method: "PUT", body: { version: 0, plan } }, cookie);
    await req("/api/consents", { method: "POST", body: { notice: "n1", marketing: { granted: true, version: "m1" } } }, cookie);
  }
  await sendCode(email); // an unused OTP row, keyed by email only
  await sendCode("delxme@example.com");
  const userId = ((await (await req("/api/me", {}, a)).json()) as { user: { id: string } }).user.id;
  await db.insert(schema.passkey).values({ id: "pk", publicKey: "k", userId, credentialID: "c", counter: 0, deviceType: "singleDevice", backedUp: false });

  const res = await req("/api/me", { method: "DELETE" }, a);
  expect(res.status).toBe(200);
  expect(res.headers.get("clear-site-data")).toContain('"storage"');
  expect(res.headers.getSetCookie().join()).toMatch(/session_token=;/);

  // Every table with a user_id column has nothing left for that user.
  const tables = (Object.values(schema) as PgTable[]).filter((t) => "userId" in getTableColumns(t));
  expect(tables.length).toBeGreaterThanOrEqual(6);
  for (const t of tables) {
    const rows = await db.execute(sql`select 1 from ${t} where user_id = ${userId}`);
    expect(rows.rows, getTableName(t)).toEqual([]);
  }
  expect(await db.execute(sql`select 1 from "user" where id = ${userId}`).then((r) => r.rows)).toEqual([]);
  const left = (await db.select().from(schema.verification)).map((v) => v.identifier);
  expect(left.some((i) => i.includes(email))).toBe(false);
  expect(left.some((i) => i.includes("delxme@example.com"))).toBe(true);
  expect(await db.select().from(schema.otpEmailLimit).then((r) => r.map((x) => x.emailHash))).not.toContain(emailHash(email));

  // Marker: hash + time only, and it matches the Postgres expression used for restore (README).
  const markers = await db.select().from(schema.erasedUser);
  expect(markers).toEqual([{ emailHash: emailHash(email), erasedAt: expect.any(Date) }]);
  const pg = await db.execute(sql`select encode(sha256(convert_to(lower(${email}), 'UTF8')), 'hex') as h`);
  expect(pg.rows[0]).toEqual({ h: emailHash(email) });

  // The old cookie is dead; the other user still has everything.
  expect((await req("/api/plan", {}, a)).status).toBe(401);
  expect(await (await req("/api/plan", {}, b)).json()).toMatchObject({ version: 1, plan });
  expect(((await (await req("/api/consents", {}, b)).json()) as { notice: unknown }).notice).toBeTruthy();

  // A session older than a day must sign in again first (Better Auth freshAge): 400, nothing deleted.
  await db.execute(sql`update session set created_at = now() - interval '2 days'`);
  const stale = await req("/api/me", { method: "DELETE" }, b);
  expect(stale.status).toBe(400);
  expect(((await stale.json()) as { code: string }).code).toBe("SESSION_EXPIRED");
  expect((await req("/api/plan", {}, b)).status).toBe(200);
});

test("DELETE /api/me also erases the PostHog person, events and recordings by user id", async () => {
  const { req, login } = await testApp();
  const a = await login("ph@example.com");
  const userId = ((await (await req("/api/me", {}, a)).json()) as { user: { id: string } }).user.id;
  vi.stubEnv("POSTHOG_PERSONAL_API_KEY", "phx_test");
  const posthog = vi.fn(async () => new Response(null, { status: 202 }));
  vi.stubGlobal("fetch", posthog);
  try {
    expect((await req("/api/me", { method: "DELETE" }, a)).status).toBe(200);
  } finally {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  }
  expect(posthog).toHaveBeenCalledWith("https://eu.i.posthog.com/api/projects/@current/persons/bulk_delete/", expect.objectContaining({
    method: "POST",
    headers: expect.objectContaining({ authorization: "Bearer phx_test" }),
    body: JSON.stringify({ distinct_ids: [userId], delete_events: true, delete_recordings: true }),
  }));
});
