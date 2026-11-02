import { tmpdir } from "node:os";
import { devFiles } from "./files";
import { afterEach, expect, test, vi } from "vitest";
import { OTP_SENDS_PER_EMAIL, createAuth, logOtp } from "./auth";
import { pgliteDb } from "./db/devSetup";
import { testApp } from "./testing";

afterEach(() => vi.unstubAllEnvs());

test("email OTP sign-up -> session -> protected route; 401 without", async () => {
  const { req, login } = await testApp();
  expect((await req("/api/me")).status).toBe(401);
  const cookie = await login("a@example.com");
  const me = await req("/api/me", {}, cookie);
  expect(me.status).toBe(200);
  expect(((await me.json()) as { user: { email: string } }).user.email).toBe("a@example.com");
});

test("per-email OTP limit holds across app instances (shared Postgres)", async () => {
  const one = await testApp();
  const two = await testApp(one.db); // a second Lambda instance on the same database
  const email = "bomb@example.com";
  for (let i = 0; i < OTP_SENDS_PER_EMAIL; i++) expect((await (i % 2 ? two : one).sendCode(email)).status).toBe(200);
  expect((await two.sendCode(email)).status).toBe(429);
  expect((await one.sendCode("BOMB@example.com")).status).toBe(429); // case does not dodge it
  expect((await one.sendCode("other@example.com")).status).toBe(200);
});

test("production: per-IP limit in the database, shared across instances", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_URL", "https://lifemap.example");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-test-secret-test-secret-123");
  const db = await pgliteDb();
  const [a, b] = [createAuth(db, () => {}, devFiles(tmpdir())), createAuth(db, () => {}, devFiles(tmpdir()))];
  const send = (auth: typeof a, n: number) =>
    auth.handler(new Request("https://lifemap.example/api/auth/email-otp/send-verification-otp", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://lifemap.example", "x-forwarded-for": "203.0.113.9" },
      body: JSON.stringify({ email: `u${n}@example.com`, type: "sign-in" }),
    }));
  // Better Auth's default for this path: 3 per minute per IP.
  expect([(await send(a, 1)).status, (await send(b, 2)).status, (await send(a, 3)).status]).toEqual([200, 200, 200]);
  expect((await send(b, 4)).status).toBe(429);
});

test("production without BETTER_AUTH_URL fails closed", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_URL", ""); // what sst passes when the deploy shell forgot it
  expect(() => createAuth({} as never, () => {}, devFiles(tmpdir()))).toThrow(/BETTER_AUTH_URL/);
});

test("dev OTP logger never prints a full email", () => {
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});
  for (const email of ["alice.smith@example.com", "ab@x.io", "a@b.co"]) logOtp(email, "123456");
  const out = JSON.stringify(spy.mock.calls);
  spy.mockRestore();
  expect(out).toContain("123456");
  for (const leak of ["alice.smith@", "lice.smith", "ab@x.io", "a@b.co"]) expect(out).not.toContain(leak);
});
