import { createHash } from "node:crypto";
import { passkey } from "@better-auth/passkey";
import { sso } from "@better-auth/sso";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, captcha, emailOTP, openAPI, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { eq, sql } from "drizzle-orm";
import type { Hono } from "hono";
import { z } from "zod";
import type { Db } from "./db";
import { schema } from "./db";
import { type Files, removeDocuments } from "./files";
import { DIRECT_ORG_ID, googleEnabled, mergeTenantConfig } from "./tenant";
const { erasedUser, otpEmailLimit, ssoProvider, verification } = schema;

// Tenant roles (organization plugin). Only what is used now: tenant admins edit their tenant's branding and invite people; customers have no tenant permissions (their own data is reached by user id, not by role).
// Advisers have none either: the role only lists them on the Experts tab (GET /api/advisers, with their calLink).
const ac = createAccessControl(defaultStatements);
const tenantRoles = { admin: ac.newRole({ organization: ["update"], invitation: ["create", "cancel"] }), customer: ac.newRole({}), adviser: ac.newRole({}) };

/** What an adviser's card shows (user.adviserProfile). */
export const adviserProfile = z.strictObject({
  qualifications: z.string().trim().max(120),
  languages: z.string().trim().max(120),
  location: z.string().trim().max(120),
  meetingMode: z.string().trim().max(60),
});

/** The provider's organization, if this auth request is an SSO sign-in (OIDC callback or SAML ACS carry :providerId). */
const ssoOrg = async (db: Db, providerId: unknown) => {
  if (typeof providerId !== "string") return undefined;
  const [p] = await db.select({ organizationId: ssoProvider.organizationId, domain: ssoProvider.domain }).from(ssoProvider).where(eq(ssoProvider.providerId, providerId));
  return p;
};

export type SendOtp = (email: string, otp: string) => void | Promise<void>;
/** Nest tokens: the Better Auth instance and the OTP sender (AuthModule). */
export const AUTH = "Auth";
export const SEND_OTP = "SendOtp";

const mask = (email: string) => email.replace(/^(.).*(@.*)$/, "$1***$2"); // the dev log carries no full email

// Dev sender: logs the code (never wire in production: codes would reach CloudWatch). Production uses mailOtp.
export const logOtp: SendOtp = (email, otp) => console.log(`[otp] ${mask(email)}: ${otp}`);

/** Plain-text email from `tenant` (the From display name). */
export type SendMail = (to: string, subject: string, body: string, tenant?: string) => Promise<void>;

/** SESv2 SendEmail from a verified identity (eu-west-1). Plain text, no tracking (no configuration set); never logs the address or body. */
const sesMail = (ses: SESv2Client, from: string): SendMail => async (to, subject, body, tenant = "LifeMap") => {
  await ses.send(new SendEmailCommand({
    // RFC 2047 encoded display name: safe for any tenant name (accents, quotes) without header injection.
    FromEmailAddress: `=?UTF-8?B?${Buffer.from(tenant).toString("base64")}?= <${from}>`,
    Destination: { ToAddresses: [to] },
    Content: { Simple: { Subject: { Data: subject, Charset: "UTF-8" }, Body: { Text: { Data: body, Charset: "UTF-8" } } } },
  }));
};

let ses: SESv2Client | undefined;
/** Notification emails (invitations): SES when lambda.ts set OTP_SENDER=ses, else the masked dev log (subject only). Read per call so tests can stub env. */
export const sendMail: SendMail = (to, subject, body, tenant) =>
  process.env.OTP_SENDER === "ses"
    ? sesMail((ses ??= new SESv2Client({ region: "eu-west-1" })), process.env.OTP_FROM ?? "")(to, subject, body, tenant)
    : process.env.NODE_ENV === "production"
      ? Promise.reject(new Error("mail sender not configured: set OTP_SENDER=ses and OTP_FROM")) // fail closed
      : Promise.resolve(console.log(`[mail] ${mask(to)}: ${subject}`));

/** Production OTP sender, through sendMail. From LifeMap: a code is asked for before any tenant is known. */
export const mailOtp: SendOtp = (email, otp) =>
  sendMail(email, "Your LifeMap sign-in code", `Your LifeMap sign-in code is ${otp}\n\nIt expires in 5 minutes. If you did not ask for it, you can ignore this email.`);

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
const eraseTraces = async (db: Db, files: Files, user: { id: string; email: string }) => {
  const { email } = user;
  // Marker first: if anything below fails, a re-run or a restore still erases.
  await db.insert(erasedUser).values({ emailHash: emailHash(email) })
    .onConflictDoUpdate({ target: erasedUser.emailHash, set: { erasedAt: sql`now()` } });
  // OTP rows are keyed `<type>-otp-<email>` with no foreign key. right() avoids LIKE wildcards (`_` is common in emails).
  const tail = `-otp-${email.toLowerCase()}`;
  await db.delete(verification).where(sql`right(${verification.identifier}, ${tail.length}) = ${tail}`);
  await db.delete(otpEmailLimit).where(eq(otpEmailLimit.emailHash, emailHash(email)));
  await removeDocuments(db, files, eq(schema.document.userId, user.id)); // objects first: the rows go with the user's cascade
};

/** The public https origin of app + API. Fails closed in production: without it Better Auth would trust whatever Host a request claims. */
const baseURL = () => {
  const url = process.env.BETTER_AUTH_URL;
  if (!url && process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_URL is required in production");
  return url || undefined;
};

/** Passkeys are bound to one domain (rpID): BETTER_AUTH_URL's host, LifeMap's only domain (every tenant is served on it). Accepted origins are that origin plus BETTER_AUTH_TRUSTED_ORIGINS. */
const passkeyOptions = () => {
  const url = baseURL();
  if (!url) return {}; // dev/tests without BETTER_AUTH_URL: the plugin's localhost default
  const origins = [url, ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "").split(",")].filter((u) => URL.canParse(u.trim())).map((u) => new URL(u.trim()).origin);
  // rpName is the name shown by the OS passkey sheet. The plugin takes one static name, so it is the platform's, not each tenant's.
  return { rpID: new URL(url).hostname, rpName: "LifeMap", origin: [...new Set(origins)] };
};

// Organization endpoints that list a tenant's people (names, emails). Every customer is a member, so the plugin's member-only check would let any customer read every other customer: tenant admins only.
const PEOPLE = ["/organization/get-full-organization", "/organization/list-members", "/organization/list-invitations"];

export const createAuth = (db: Db, sendOtp: SendOtp, files: Files) => {
  const auth = betterAuth({
    // BETTER_AUTH_SECRET is read from env. Trusted origins = baseURL's origin, plus BETTER_AUTH_TRUSTED_ORIGINS (comma list) if set.
    baseURL: baseURL(),
    database: drizzleAdapter(db, { provider: "pg", schema }),
    // Per-IP limits kept in Postgres, so they hold across Lambda instances. Off in dev/tests, where every request shares one IP-less bucket.
    // The emailOTP plugin's own rules already cap OTP send and sign-in at 3 per minute per IP; the per-email cap is the hook below.
    rateLimit: { enabled: process.env.NODE_ENV === "production", storage: "database" },
    // Session lifetime (Better Auth defaults, stated): 7 days, refreshed daily; deleteUser needs a session under freshAge (me.ts reads it).
    // Sign out everywhere: Better Auth's own /revoke-sessions and /revoke-other-sessions.
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, freshAge: 60 * 60 * 24 },
    // Secure (and __Secure- prefixed) cookies in production even if a request arrives over http; httpOnly + SameSite=Lax are Better Auth defaults.
    advanced: { useSecureCookies: process.env.NODE_ENV === "production" },
    // The openAPI plugin's own HTTP endpoints are off: its schema is served only through GET /api/openapi.json (platform admins in production).
    disabledPaths: ["/open-api/generate-schema"],
    // Sign in with Google: on only when both keys are set (lambda.ts reads them from SST secrets). Google-verified emails link to an existing account
    // with the same email (Better Auth's default account linking), so a customer who first signed in with a code keeps one account and one plan.
    // Google's tokens are never used after sign-in; kept encrypted (BETTER_AUTH_SECRET) rather than in plain text.
    account: { encryptOAuthTokens: true },
    socialProviders: googleEnabled() ? { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, prompt: "select_account" } } : {},
    user: {
      // An adviser's own Cal.com link (`<user>/<event>`) and card, set with updateUser; listed only for members with role adviser.
      additionalFields: {
        calLink: { type: "string", required: false, input: true, validator: { input: z.string().regex(/^[\w-]+\/[\w-]+$/).max(200) } },
        adviserProfile: { type: "json", required: false, input: true, validator: { input: adviserProfile } },
      },
      deleteUser: { enabled: true, beforeDelete: (user) => eraseTraces(db, files, user) },
      // A tenant's identity provider only admits emails on that tenant's domain(s): on sign-up, account link and every sign-in.
      validateUserInfo: async ({ user, source }) => {
        if (!source.sso) return;
        const p = await ssoOrg(db, source.sso.providerId);
        const domain = String(user.email ?? "").toLowerCase().split("@")[1];
        if (!p || !p.domain.toLowerCase().split(",").map((d) => d.trim()).includes(domain)) return { error: "email_domain_not_allowed" };
      },
    },
    databaseHooks: {
      session: {
        create: {
          // Every new session lands in a tenant: the SSO provider's organization, else LifeMap Direct. Other tenants: accept an invitation or organization/set-active.
          before: async (session, ctx) => {
            if (ctx?.path === "/admin/impersonate-user") return false; // platform staff get no customer data
            const fromSso = ctx?.path.startsWith("/sso/") ? (await ssoOrg(db, ctx.params?.providerId))?.organizationId : null;
            // The SSO plugin adds the membership right after, with the role from the provider mapping.
            if (fromSso) return { data: { activeOrganizationId: fromSso } };
            // Already a member (or a concurrent first sign-in just added them): nothing to do.
            await auth.api.addMember({ body: { userId: session.userId, organizationId: DIRECT_ORG_ID, role: "customer" } }).catch((e) => {
              const alreadyMember = e instanceof APIError && e.body?.code === "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION";
              const uniqueViolation = (e as { cause?: { code?: string }; code?: string }).cause?.code === "23505" || (e as { code?: string }).code === "23505";
              if (!alreadyMember && !uniqueViolation) throw e;
            });
            return { data: { activeOrganizationId: DIRECT_ORG_ID } };
          },
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Providers belong to a tenant (the plugin then requires the caller to be that tenant's admin); no personal providers.
        if (ctx.path === "/sso/register" && !ctx.body?.organizationId)
          throw new APIError("FORBIDDEN", { message: "An SSO provider must belong to an organization" });
        if (PEOPLE.includes(ctx.path)) {
          if (ctx.query?.organizationSlug) throw new APIError("BAD_REQUEST", { message: "Use organizationId" }); // the permission check below resolves ids only
          const { success } = await auth.api.hasPermission({ headers: ctx.headers ?? new Headers(), body: { organizationId: ctx.query?.organizationId, permissions: { invitation: ["create"] } } });
          if (!success) throw new APIError("FORBIDDEN", { message: "Only tenant admins can list members and invitations" });
          return;
        }
        // Per-email OTP limit, on in every environment: stops email-bombing and code cycling from many IPs.
        // Better Auth gap: its rateLimit (customRules, customStorage) always keys on IP + path, never on the request body, so it cannot count per email.
        if (ctx.path !== "/email-otp/send-verification-otp") return;
        if ((await countOtpSend(db, String(ctx.body?.email ?? ""))) > OTP_SENDS_PER_EMAIL)
          throw new APIError("TOO_MANY_REQUESTS", { message: "Too many codes sent to this email. Try again in an hour." });
      }),
    },
    plugins: [
      emailOTP({ sendVerificationOTP: async ({ email, otp }) => void (await sendOtp(email, otp)) }),
      passkey(passkeyOptions()),
      // Platform admins: user.role = "admin".
      admin(),
      organization({
        ac,
        roles: tenantRoles,
        creatorRole: "admin",
        // The app opens the invitation from ?invitation=<id> (accept via /api/auth/organization/accept-invitation).
        sendInvitationEmail: ({ id, email, organization: org }) =>
          sendMail(email, `You're invited to ${org.name}`, `You have been invited to join ${org.name} on LifeMap.\n\nAccept: ${baseURL() ?? ""}/?invitation=${id}\n\nIf you were not expecting this, you can ignore this email.`, org.name),
        allowUserToCreateOrganization: (user) => user.role === "admin",
        // Tenant config lives in the plugin's own `metadata`: validated and merged here.
        organizationHooks: {
          beforeCreateOrganization: async ({ organization }) => {
            const metadata = await mergeTenantConfig(db, undefined, organization);
            return { data: { ...organization, ...(metadata && { metadata }) } };
          },
          beforeUpdateOrganization: async ({ organization, member }) => {
            const metadata = await mergeTenantConfig(db, member.organizationId, organization);
            return { data: { ...organization, ...(metadata && { metadata }) } };
          },
        },
      }),
      sso({
        domainVerification: { enabled: true },
        organizationProvisioning: {
          // Admin only when the IdP says so through the provider's mapping (oidcConfig.mapping.extraFields.lifemapRole); everyone else is a customer.
          // The plugin's type only lists its default role names; "customer" is one of ours.
          getRole: async ({ userInfo }) => (userInfo.lifemapRole === "admin" ? "admin" : "customer") as "member",
        },
      }),
      openAPI({ disableDefaultReference: true }),
      // Bot check (Cloudflare Turnstile) on OTP send and OTP sign-in: off unless CAPTCHA_ENABLED=true and TURNSTILE_SECRET_KEY is set. The client sends the widget token in x-captcha-response.
      ...(process.env.CAPTCHA_ENABLED === "true" && process.env.TURNSTILE_SECRET_KEY
        ? [captcha({ provider: "cloudflare-turnstile", secretKey: process.env.TURNSTILE_SECRET_KEY, endpoints: ["/email-otp/send-verification-otp", "/sign-in/email-otp"] })]
        : []),
    ],
  });
  return auth;
};
export type Auth = ReturnType<typeof createAuth>;

/** Mount Better Auth at /api/auth/*. */
export const mountAuth = (app: Hono, auth: Auth) => {
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
};
