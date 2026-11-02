import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { Hono } from "hono";
import { expect, test, vi } from "vitest";
import { tmpdir } from "node:os";
import { buildApp } from "../app";
import { createNest } from "../app.module";
import { logOtp } from "../auth";
import { devFiles } from "../files";
import type { Db } from "../db";
import { schema } from "../db";
import { pgliteDb } from "../db/devSetup";
import type { Env } from "../guard";
import { organization } from "../db/schema";
import { testApp } from "../testing";
import { planRoutes } from "./plan";

const plan0 = { whyNote: "", goals: [], ans: {}, retireAge: null };

test("plan API: auth, round trip, stale 409, invalid 400, per-user isolation", async () => {
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
  const db = await pgliteDb();
  const codes: Record<string, string> = {};
  const app = await buildApp(db, (e, otp) => void (codes[e] = otp));

  const json = (path: string, init: Omit<RequestInit, "body"> & { body?: unknown }) =>
    app.request(path, {
      ...init,
      headers: { "content-type": "application/json", origin: "http://localhost:3000", ...init.headers },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  const login = async (email: string) => {
    await json("/api/auth/email-otp/send-verification-otp", { method: "POST", body: { email, type: "sign-in" } });
    const res = await json("/api/auth/sign-in/email-otp", { method: "POST", body: { email, otp: codes[email] } });
    expect(res.status).toBe(200);
    return { cookie: res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") };
  };
  const get = (h: { cookie: string }) => json("/api/plan", { headers: h });
  const put = (h: { cookie: string }, body: unknown) => json("/api/plan", { method: "PUT", headers: h, body });

  // 401 anonymous
  expect((await json("/api/plan", {})).status).toBe(401);
  expect((await json("/api/plan", { method: "PUT", body: { version: 0, plan: plan0 } })).status).toBe(401);

  const [a, b] = [await login("a@example.com"), await login("b@example.com")];
  expect(await (await get(a)).json()).toEqual({ version: 0, plan: null });

  // round trip
  const planA = { ...plan0, whyNote: "retire early", dob: "1985-06-01" };
  expect(await (await put(a, { version: 0, plan: planA })).json()).toEqual({ version: 1 });
  expect(await (await get(a)).json()).toEqual({ version: 1, plan: planA });

  // stale version: 409 and the stored plan is untouched
  const stale = await put(a, { version: 0, plan: { ...planA, whyNote: "stale" } });
  expect(stale.status).toBe(409);
  expect(((await stale.json()) as { version: number }).version).toBe(1);
  expect(await (await put(a, { version: 5, plan: planA })).status).toBe(409);
  expect(((await (await get(a)).json()) as { plan: { whyNote: string } }).plan.whyNote).toBe("retire early");
  expect(await (await put(a, { version: 1, plan: { ...planA, whyNote: "v2" } })).json()).toEqual({ version: 2 });

  // invalid body: 400
  for (const body of [null, { version: 2 }, { version: 2, plan: [1] }, { version: "2", plan: planA }, { version: 3_000_000_000, plan: planA }, { version: 2, plan: { ...planA, whyNote: "a\u0000b" } }, { version: 2, plan: { ...planA, whyNote: "\ud800" } }, { version: 2, plan: { ...planA, ans: { "k\u0000": 1 } } }])
    expect((await put(a, body)).status, JSON.stringify(body).slice(0, 60)).toBe(400);
  expect((await json("/api/plan", { method: "PUT", headers: a, body: undefined })).status).toBe(400);

  // opaque: unknown keys kept; a literal backslash-u0000 typed by a customer is fine
  await put(a, { version: 2, plan: { ...planA, whyNote: "\\u0000", extra: "x" } });
  const kept = ((await (await get(a)).json()) as { plan: Record<string, unknown> }).plan;
  expect(kept.extra).toBe("x");
  expect(kept.whyNote).toBe("\\u0000");
  expect(await (await put(a, { version: 3, plan: { ...planA, whyNote: "v2" } })).json()).toEqual({ version: 4 });

  // concurrent writes with the same version: exactly one wins
  const race = await Promise.all([put(a, { version: 4, plan: planA }), put(a, { version: 4, plan: planA })]);
  expect(race.map((r) => r.status).sort()).toEqual([200, 409]);
  await put(a, { version: 5, plan: { ...planA, whyNote: "v2" } });

  // oversize body: 413
  expect((await put(a, { version: 6, plan: { ...planA, whyNote: "x".repeat(1_100_000) } })).status).toBe(413);

  // DB failure: generic 500, nothing from the plan reaches the log
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  const broken = new Hono<Env>();
  broken.use("*", async (c, next) => (c.set("userId", "u"), c.set("orgId", "o"), next()));
  broken.route("/", planRoutes(await createNest(drizzle(new PGlite(), { schema }) as unknown as Db, logOtp, devFiles(tmpdir())))); // no tables
  const bad = await broken.request("/plan", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: 0, plan: { ...planA, whyNote: "SECRET-NOTE" } }) });
  expect(bad.status).toBe(500);
  expect(JSON.stringify(spy.mock.calls)).not.toMatch(/SECRET-NOTE|a@example|1985-06-01/);
  spy.mockRestore();

  // user B: own empty plan, cannot see or overwrite A's, even naming A's version or a userId
  expect(await (await get(b)).json()).toEqual({ version: 0, plan: null });
  expect((await put(b, { version: 6, plan: plan0 })).status).toBe(409);
  expect((await put(b, { version: 0, userId: "x", plan: { ...plan0, whyNote: "B" } })).status).toBe(200);
  expect(((await (await get(a)).json()) as { plan: { whyNote: string }; version: number })).toMatchObject({ version: 6, plan: { whyNote: "v2" } });
  expect(((await (await get(b)).json()) as { plan: { whyNote: string } }).plan.whyNote).toBe("B");
});

test("plan versions: snapshot on save, list, restore keeps the replaced plan; other users and tenants get 404", async () => {
  const { db, req, login } = await testApp();
  await db.insert(organization).values({ id: "org-a", name: "CU A", slug: "cu-a" });
  expect((await req("/api/plan/versions")).status).toBe(401);
  const a = await login("a@example.com");
  const put = (version: number, whyNote: string, snapshot?: string) => req("/api/plan", { method: "PUT", body: { version, plan: { whyNote }, snapshot } }, a);
  await put(0, "first", "LifeMap confirmed");
  await put(1, "draft"); // no snapshot: not a version
  await put(2, "second", "Goals changed");

  type V = { id: number; note: string };
  const list = async (cookie: string) => ((await (await req("/api/plan/versions", {}, cookie)).json()) as { versions: V[] }).versions;
  const versions = await list(a);
  expect(versions.map((v) => v.note)).toEqual(["Goals changed", "LifeMap confirmed"]);
  const first = versions[1].id;
  const restore = (cookie: string, id: number | string, version: number) => req(`/api/plan/versions/${id}/restore`, { method: "POST", body: { version } }, cookie);

  expect((await restore(a, first, 1)).status).toBe(409); // stale
  expect(await (await restore(a, first, 3)).json()).toEqual({ version: 4, plan: { whyNote: "first" } });
  expect(await (await req("/api/plan", {}, a)).json()).toEqual({ version: 4, plan: { whyNote: "first" } });
  expect((await list(a))[0].note).toBe('Before restoring "LifeMap confirmed"');

  // another user, and the same person in another tenant, see nothing and cannot restore it
  const b = await login("b@example.com");
  const aOnA = await login("a@example.com", "org-a");
  for (const other of [b, aOnA]) {
    expect(await list(other)).toEqual([]);
    expect((await restore(other, first, 0)).status).toBe(404);
  }
});
