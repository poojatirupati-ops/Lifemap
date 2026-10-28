import { expect } from "vitest";
import { buildApp } from "./app";
import { pgliteDb } from "./db/devSetup";

/** Test-only: a real app on in-memory Postgres; OTP codes land in `codes` instead of an email. */
export const testApp = async (db?: Awaited<ReturnType<typeof pgliteDb>>) => {
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
  db ??= await pgliteDb();
  const codes: Record<string, string> = {};
  const app = buildApp(db, (e, otp) => void (codes[e] = otp));
  const req = (path: string, init: Omit<RequestInit, "body"> & { body?: unknown } = {}, cookie = "") =>
    app.request(path, {
      ...init,
      headers: { "content-type": "application/json", origin: "http://localhost:3000", cookie, ...init.headers },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  const sendCode = (email: string) => req("/api/auth/email-otp/send-verification-otp", { method: "POST", body: { email, type: "sign-in" } });
  /** Signs in by email OTP; returns the session cookie. */
  const login = async (email: string) => {
    await sendCode(email);
    const res = await req("/api/auth/sign-in/email-otp", { method: "POST", body: { email, otp: codes[email] } });
    expect(res.status).toBe(200);
    return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  };
  return { db, app, codes, req, sendCode, login };
};
