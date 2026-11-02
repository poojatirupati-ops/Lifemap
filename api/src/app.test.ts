import { sql } from "drizzle-orm";
import { expect, test } from "vitest";
import { app } from "./app";
import { testApp } from "./testing";

test("GET /health", async () => {
  const res = await app.request("/health");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

test("the OpenAPI spec lists every mounted route", async () => {
  const { app, req } = await testApp();
  const spec = (await (await req("/api/openapi.json")).json()) as { paths: Record<string, Record<string, unknown>> };
  const documented = new Set(Object.entries(spec.paths).flatMap(([p, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} ${p}`)));
  // Middleware is registered as ALL; /api/auth/* is Better Auth's catch-all, documented path by path by its openAPI plugin.
  const mounted = app.routes.filter((r) => r.method !== "ALL" && r.path !== "/api/auth/*").map((r) => `${r.method} ${r.path.replace(/:(\w+)/g, "{$1}")}`);
  expect([...new Set(mounted)].filter((r) => !documented.has(r))).toEqual([]);
  expect(documented).toContain("POST /api/auth/sign-in/email-otp");
});

test("security headers on every response, errors included", async () => {
  for (const path of ["/health", "/api/plan", "/nope"]) {
    const res = await app.request(path);
    expect(res.headers.get("x-content-type-options"), path).toBe("nosniff");
    expect(res.headers.get("strict-transport-security"), path).toBeTruthy();
    expect(res.headers.get("x-request-id"), path).toBeTruthy();
  }
});

test("a database failure returns problem+json with no stack trace or SQL", async () => {
  const { db, req, login } = await testApp();
  const cookie = await login("a@example.com");
  await db.execute(sql`drop table plan`);
  const res = await req("/api/plan", { method: "PUT", body: { version: 0, plan: { whyNote: "x" } } }, cookie);
  expect(res.status).toBe(500);
  expect(res.headers.get("content-type")).toBe("application/problem+json");
  expect(await res.text()).not.toMatch(/\bat \S+:\d+|insert|select|update|"plan"|whyNote/i);
});
