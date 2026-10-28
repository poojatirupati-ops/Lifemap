import { createHash } from "node:crypto";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { eq, sql } from "drizzle-orm";
import type { Hono } from "hono";
import type { Db } from "./db";
import { schema } from "./db";
const { erasedUser, otpEmailLimit, verification } = schema;

export type SendOtp = (email: string, otp: string) => void | Promise<void>;

// Dev sender: logs the code (never wire in production: codes would reach CloudWatch). Swap for SES (SendEmailCommand) by passing a different SendOtp.
export const logOtp: SendOtp = (email, otp) => console.log(`[otp] ${email.replace(/^(.).*(@.*)$/, "$1***$2")}: ${otp}`);   // masked address: the dev log carries no full email

/** sha256 of the lower-cased email: the only form an erased or rate-limited address is kept in. Same as Postgres `encode(sha256(convert_to(lower(email),'UTF8')),'hex')`. */
export const emailHash = (email: string) => createHash("sha256").update(email.toLowerCase()).digest("hex");

export const OTP_SENDS_PER_EMAIL = 5; // per hour, across all Lambda instances (the counter is in Postgres)

/** Counts one OTP send for this email in a fixed one-hour window, atomically; returns the count including this one. */
const countOtpSend = async (db: Db, email: string) => {
  const stale = sql`${otpEmailLimit.windowStart} < now() - interval '1 hour'`;
  const [row] = await db.insert(otpEmailLimit).values({ emailHash: emailHash(email), count: 1, windowStart: sql`now()` })
    .onConflictDoUpdate({
      target: otpEmailLimit.emailHash,
      set: {
        count: sql`case when ${stale} then 1 else ${otpEmailLimit.count} + 1 end`,
        windowStart: sql`case when ${stale} then now() else ${otpEmailLimit.windowStart} end`,
      },
    })
    .returning({ count: otpEmailLimit.count });
  return row.count;
};

/** Runs before Better Auth deletes the user row (which cascades to sessions, passkeys, consents, plan): what the cascade cannot reach. */
const eraseTraces = async (db: Db, email: string) => {
  // Marker first: if anything below fails, a re-run or a restore still erases.
  await db.insert(erasedUser).values({ emailHash: emailHash(email) })
    .onConflictDoUpdate({ target: erasedUser.emailHash, set: { erasedAt: sql`now()` } });
  // OTP rows are keyed `<type>-otp-<email>` with no foreign key. right() avoids LIKE wildcards (`_` is common in emails).
  const tail = `-otp-${email.toLowerCase()}`;
  await db.delete(verification).where(sql`right(${verification.identifier}, ${tail.length}) = ${tail}`);
  await db.delete(otpEmailLimit).where(eq(otpEmailLimit.emailHash, emailHash(email)));
};

/** The public https origin of app + API. Fails closed in production: without it Better Auth would trust whatever Host a request claims. */
const baseURL = () => {
  const url = process.env.BETTER_AUTH_URL;
  if (!url && process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_URL is required in production");
  return url || undefined;
};

export const createAuth = (db: Db, sendOtp: SendOtp) =>
  betterAuth({
    // BETTER_AUTH_SECRET is read from env. Trusted origins = baseURL's origin, plus BETTER_AUTH_TRUSTED_ORIGINS (comma list) if set.
    baseURL: baseURL(),
    database: drizzleAdapter(db, { provider: "pg", schema }),
    // Per-IP limits kept in Postgres, so they hold across Lambda instances. Off in dev/tests, where every request shares one IP-less bucket.
    rateLimit: { enabled: process.env.NODE_ENV === "production", storage: "database" },
    user: { deleteUser: { enabled: true, beforeDelete: (user) => eraseTraces(db, user.email) } },
    hooks: {
      // Per-email OTP limit, on in every environment: stops email-bombing and code cycling from many IPs.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/email-otp/send-verification-otp") return;
        if ((await countOtpSend(db, String(ctx.body?.email ?? ""))) > OTP_SENDS_PER_EMAIL)
          throw new APIError("TOO_MANY_REQUESTS", { message: "Too many codes sent to this email. Try again in an hour." });
      }),
    },
    plugins: [
      emailOTP({ sendVerificationOTP: async ({ email, otp }) => void (await sendOtp(email, otp)) }),
      passkey(),
    ],
  });
export type Auth = ReturnType<typeof createAuth>;

/** Mount Better Auth at /api/auth/*. */
export const mountAuth = (app: Hono, auth: Auth) => {
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
};
