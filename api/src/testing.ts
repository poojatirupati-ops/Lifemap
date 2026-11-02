import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect } from "vitest";
import { buildApp } from "./app";
import { pgliteDb } from "./db/devSetup";
import { member } from "./db/schema";
import { type Files, devFiles } from "./files";

/** Test-only: a real app on in-memory Postgres; OTP codes land in `codes` instead of an email; documents in a fresh temp folder unless `files` is given. */
export const testApp = async (db?: Awaited<ReturnType<typeof pgliteDb>>, files: Files = devFiles(mkdtempSync(join(tmpdir(), "lifemap-files-")))) => {
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
  db ??= await pgliteDb();
  const codes: Record<string, string> = {};
  const app = await buildApp(db, (e, otp) => void (codes[e] = otp), files);
  const req = (path: string, init: Omit<RequestInit, "body"> & { body?: unknown } = {}, cookie = "") =>
    app.request(path, {
      ...init,
      headers: { "content-type": "application/json", origin: "http://localhost:3000", cookie, ...init.headers },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  const sendCode = (email: string) => req("/api/auth/email-otp/send-verification-otp", { method: "POST", body: { email, type: "sign-in" } });
  /** Signs in by email OTP (lands in LifeMap Direct); with `orgId`, then joins that tenant as customer and makes it active. Returns the session cookie. */
  const login = async (email: string, orgId?: string) => {
    await sendCode(email);
    const res = await req("/api/auth/sign-in/email-otp", { method: "POST", body: { email, otp: codes[email] } });
    expect(res.status).toBe(200);
    const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    if (orgId) {
      const { user } = (await res.json()) as { user: { id: string } };
      await db.insert(member).values({ id: randomUUID(), organizationId: orgId, userId: user.id, role: "customer" }).onConflictDoNothing();
      expect((await req("/api/auth/organization/set-active", { method: "POST", body: { organizationId: orgId } }, cookie)).status).toBe(200);
    }
    return cookie;
  };
  return { db, app, codes, req, sendCode, login, files };
};
