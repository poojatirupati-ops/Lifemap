import { tmpdir } from "node:os";
import { devFiles } from "./files";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { expect, test } from "vitest";
import { app as realApp } from "./app";
import { createAuth } from "./auth";
import { pgliteDb } from "./db/devSetup";
import { member } from "./db/schema";
import { type Env, guard } from "./guard";

test("deny by default; signed-in user sees only own id; a removed member loses access at once", async () => {
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
  const db = await pgliteDb();
  const codes: Record<string, string> = {};
  const auth = createAuth(db, (e, otp) => void (codes[e] = otp), devFiles(tmpdir()));
  const app = new Hono<Env>();
  app.use("*", guard(auth, db));
  app.get("/health", (c) => c.json({ ok: true }));
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
  app.get("/api/stub", (c) => c.json({ userId: c.var.userId }));

  const login = async (email: string) => {
    const post = (path: string, body: unknown) =>
      app.request(path, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify(body),
      });
    await post("/api/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
    const res = await post("/api/auth/sign-in/email-otp", { email, otp: codes[email] });
    expect(res.status).toBe(200);
    return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  };

  expect((await app.request("/health")).status).toBe(200);
  for (const path of ["/api/stub", "/api/me", "/nope", "/health/x"])
    expect((await app.request(path)).status).toBe(401);
  expect((await app.request("/health", { method: "POST" })).status).toBe(401);

  // The real app must deny by default too, so dropping or reordering guard in app.ts fails here.
  expect((await realApp.request("/health")).status).toBe(200);
  expect((await realApp.request("/api/auth/ok")).status).toBe(200); // public: Better Auth's own handler
  expect((await realApp.request("/api/tenant")).status).toBe(200); // public: white-label config
  for (const [method, path] of [
    ["GET", "/api/me"], ["GET", "/api/plan"], ["PUT", "/api/plan"], ["POST", "/api/consents"],
    ["GET", "/nope"], ["GET", "/api/nope"], ["DELETE", "/api/plan"], ["POST", "/health"], ["GET", "/health/x"],
    ["GET", "/api/authx"], ["GET", "/api/auth-evil"], ["GET", "/"], ["POST", "/api/tenant"], ["GET", "/api/tenantx"],
    ["PATCH", "/api/admin/organizations/lifemap-direct/config"],
  ])
    expect((await realApp.request(path, { method })).status, `${method} ${path}`).toBe(401);

  const [a, b] = [await login("a@example.com"), await login("b@example.com")];
  const id = async (cookie: string) =>
    ((await (await app.request("/api/stub", { headers: { cookie } })).json()) as { userId: string }).userId;
  const [ia, ib] = [await id(a), await id(b)];
  expect(ia).toBeTruthy();
  expect(ia).not.toBe(ib);

  // removed from the active tenant (here straight in the table, as DELETE /api/me does): the session still names it, the guard refuses
  await db.delete(member).where(eq(member.userId, ia));
  expect((await app.request("/api/stub", { headers: { cookie: a } })).status).toBe(403);
  expect((await app.request("/api/stub", { headers: { cookie: b } })).status).toBe(200);
});
