import { createHash, randomUUID } from "node:crypto";
import { passkey } from "@better-auth/passkey";
import { sso } from "@better-auth/sso";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, emailOTP, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";
import { SendEmailCommand, type SESv2Client } from "@aws-sdk/client-sesv2";
import { eq, sql } from "drizzle-orm";
import type { Hono } from "hono";
import type { Db } from "./db";
import { schema } from "./db";
import { type Files, removeDocuments } from "./files";
import { DIRECT_ORG_ID, hostOf, mergeTenantConfig, tenantForHost } from "./tenant";
const { erasedUser, member, otpEmailLimit, ssoProvider, verification } = schema;

// Tenant roles (organization plugin). Only what is used now: tenant admins edit their tenant's branding; customers have no tenant permissions (their own data is reached by user id, not by role).
const ac = createAccessControl(defaultStatements);
export const tenantRoles = { admin: ac.newRole({ organization: ["update"] }), customer: ac.newRole({}) };

/** The provider's organization, if this auth request is an SSO sign-in (OIDC callback or SAML ACS carry :providerId). */
const ssoOrg = async (db: Db, providerId: unknown) => {
  if (typeof providerId !== "string") return undefined;
  const [p] = await db.select({ organizationId: ssoProvider.organizationId, domain: ssoProvider.domain }).from(ssoProvider).where(eq(ssoProvider.providerId, providerId));
  return p;
};

/** `tenant`: display name of the tenant the code was asked for on (organization name), for the From name and subject. */
export type SendOtp = (email: string, otp: string, tenant?: string) => void | Promise<void>;

// Dev sender: logs the code (never wire in production: codes would reach CloudWatch). Production uses sesOtp.
export const logOtp: SendOtp = (email, otp) => console.log(`[otp] ${email.replace(/^(.).*(@.*)$/, "$1***$2")}: ${otp}`);   // masked address: the dev log carries no full email

/** Production sender: SESv2 SendEmail from a verified identity (eu-west-1). Plain text, no tracking (no configuration set); never logs the code or address. */
export const sesOtp = (ses: SESv2Client, from: string): SendOtp => async (email, otp, tenant = "LifeMap") => {
  await ses.send(new SendEmailCommand({
    // RFC 2047 encoded display name: safe for any tenant name (accents, quotes) without header injection.
    FromEmailAddress: `=?UTF-8?B?${Buffer.from(tenant).toString("base64")}?= <${from}>`,
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: `Your ${tenant} sign-in code`, Charset: "UTF-8" },
        Body: { Text: { Data: `Your ${tenant} sign-in code is ${otp}\n\nIt expires in 5 minutes. If you did not ask for it, you can ignore this email.`, Charset: "UTF-8" } },
      },
    },
  }));
};

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

export const createAuth = (db: Db, sendOtp: SendOtp, files: Files) =>
  betterAuth({
    // BETTER_AUTH_SECRET is read from env. Trusted origins = baseURL's origin, plus BETTER_AUTH_TRUSTED_ORIGINS (comma list) if set.
    baseURL: baseURL(),
    database: drizzleAdapter(db, { provider: "pg", schema }),
    // Per-IP limits kept in Postgres, so they hold across Lambda instances. Off in dev/tests, where every request shares one IP-less bucket.
    rateLimit: { enabled: process.env.NODE_ENV === "production", storage: "database" },
    // A tenant's own host is trusted for requests made on it (hosts are set by platform admins only).
    trustedOrigins: async (req) => {
      const host = hostOf(req?.headers);
      return host && (await tenantForHost(db, host)) ? [`https://${host}`] : [];
    },
    user: {
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
          // Every new session lands in a tenant: the SSO provider's organization, else the tenant for this host, else LifeMap Direct.
          before: async (session, ctx) => {
            if (ctx?.path === "/admin/impersonate-user") return false; // platform staff get no customer data
            const fromSso = ctx?.path.startsWith("/sso/") ? (await ssoOrg(db, ctx.params?.providerId))?.organizationId : null;
            // The SSO plugin adds the membership right after, with the role from the provider mapping.
            if (fromSso) return { data: { activeOrganizationId: fromSso } };
            const orgId = (await tenantForHost(db, hostOf(ctx?.headers)))?.id ?? DIRECT_ORG_ID;
            await db.insert(member).values({ id: randomUUID(), organizationId: orgId, userId: session.userId, role: "customer" }).onConflictDoNothing();
            return { data: { activeOrganizationId: orgId } };
          },
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Providers belong to a tenant (the plugin then requires the caller to be that tenant's admin); no personal providers.
        if (ctx.path === "/sso/register" && !ctx.body?.organizationId)
          throw new APIError("FORBIDDEN", { message: "An SSO provider must belong to an organization" });
        // Per-email OTP limit, on in every environment: stops email-bombing and code cycling from many IPs.
        if (ctx.path !== "/email-otp/send-verification-otp") return;
        if ((await countOtpSend(db, String(ctx.body?.email ?? ""))) > OTP_SENDS_PER_EMAIL)
          throw new APIError("TOO_MANY_REQUESTS", { message: "Too many codes sent to this email. Try again in an hour." });
      }),
    },
    plugins: [
      emailOTP({ sendVerificationOTP: async ({ email, otp }, ctx) => void (await sendOtp(email, otp, (await tenantForHost(db, hostOf(ctx?.headers)))?.name)) }),
      passkey(),
      // Platform admins: user.role = "admin".
      admin(),
      organization({
        ac,
        roles: tenantRoles,
        creatorRole: "admin",
        allowUserToCreateOrganization: (user) => user.role === "admin",
        // Tenant config lives in the plugin's own `metadata`: validated and merged here; only platform admins touch `host`.
        organizationHooks: {
          beforeCreateOrganization: async ({ organization, user }) => {
            const metadata = await mergeTenantConfig(db, undefined, organization, user.role === "admin");
            return { data: { ...organization, ...(metadata && { metadata }) } };
          },
          beforeUpdateOrganization: async ({ organization, user, member }) => {
            const metadata = await mergeTenantConfig(db, member.organizationId, organization, user.role === "admin");
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
    ],
  });
export type Auth = ReturnType<typeof createAuth>;

/** Mount Better Auth at /api/auth/*. */
export const mountAuth = (app: Hono, auth: Auth) => {
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
};
