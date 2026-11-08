import { APIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import { PostHog } from "posthog-node";
import { z } from "zod";
import type { Db } from "./db";
import { organization, ssoProvider } from "./db/schema";

/** The built-in tenant for independent users; seeded by migration 0003. */
export const DIRECT_ORG_ID = "lifemap-direct";

/** Feature flags and their code defaults. LifeMap staff override them per tenant in PostHog (group type "organization"); a flag PostHog does not return falls back here. To add one: add it here and to docs/tenancy.md. */
export const FEATURE_DEFAULTS = {
  ask: true, // "Ask" questions screen
  adviserBooking: false, // book / share with an adviser (gated on G-12)
  documentUpload: false, // real document upload (B9; mock today)
  analytics: true, // PostHog product analytics, still behind each user's consent
};
export type Feature = keyof typeof FEATURE_DEFAULTS;

// The whole tenant config, kept in organization.metadata (Better Auth's own column). Served publicly by GET /api/tenant, so strictly shaped.
export const tenantMetadata = z.strictObject({
  colors: z.record(z.string().regex(/^[a-z][a-zA-Z0-9-]{0,31}$/), z.string().regex(/^#[0-9a-fA-F]{3,8}$/)).optional(),
  // a partner's own figure per LifeMap standard: a rate or amount, a choice, or a list of three rates
  rates: z.record(z.string().max(64), z.union([z.number().finite(), z.string().max(64), z.array(z.number().finite()).max(3)])).optional(),
}).refine((c) => JSON.stringify(c).length <= 8192, "tenant config too large");
type TenantMetadata = z.infer<typeof tenantMetadata>;
type Org = typeof organization.$inferSelect;

const metadataOf = (org?: Pick<Org, "metadata">): TenantMetadata => (org?.metadata ? JSON.parse(org.metadata) : {});
// PostHog flags, evaluated locally (definitions polled with the personal API key; the last good copy is kept if PostHog is unreachable).
// Without POSTHOG_API_KEY (dev, tests) there is no client and the code defaults apply.
let posthog: { client: PostHog; ready: Promise<boolean> } | undefined;
const flagClient = () => {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return undefined;
  if (!posthog) {
    const client = new PostHog(key, { host: process.env.POSTHOG_HOST ?? "https://eu.i.posthog.com", personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY });
    posthog = { client, ready: client.waitForLocalEvaluationReady(3000) }; // only the first requests wait (cold start)
  }
  return posthog;
};

/** The tenant's flags: PostHog's value for the organization group where it has one, else the code default. */
// Dev only: FEATURE_OVERRIDES="documentUpload=true,adviserBooking=true" switches flags locally without PostHog; ignored in production.
const devOverrides = () =>
  process.env.NODE_ENV === "production"
    ? {}
    : Object.fromEntries(
        [...new URLSearchParams((process.env.FEATURE_OVERRIDES ?? "").replaceAll(",", "&"))].map(([k, v]) => [k, v === "true"]),
      );

export const features = async (orgId: string) => {
  const ph = flagClient();
  if (!ph) return { ...FEATURE_DEFAULTS, ...devOverrides() } as typeof FEATURE_DEFAULTS;
  await ph.ready;
  const flags = await ph.client.getAllFlags(orgId, { groups: { organization: orgId }, onlyEvaluateLocally: true, flagKeys: Object.keys(FEATURE_DEFAULTS) }).catch(() => ({}) as Record<string, unknown>);
  return Object.fromEntries(Object.entries(FEATURE_DEFAULTS).map(([k, v]) => [k, typeof flags[k] === "boolean" ? flags[k] : v])) as typeof FEATURE_DEFAULTS;
};
/** Is `flag` on for this tenant? Routes gate tenant features with this. */
export const isEnabled = async (org: Pick<Org, "id">, flag: Feature) => (await features(org.id))[flag];

export const tenantById = async (db: Db, id: string) => (await db.select().from(organization).where(eq(organization.id, id)))[0];

export const logo = z.string().max(2048).regex(/^https:\/\/[^\s"'<>]+$/).nullable();

/**
 * Validates a tenant config change and merges it over the stored one (top-level keys replace).
 * Used by the organization plugin's create/update hooks (tenant admins) and the platform-admin route (TenantService). Returns the metadata to store, if any.
 */
export const mergeTenantConfig = async (db: Db, orgId: string | undefined, change: { logo?: string | null; metadata?: unknown }) => {
  if (change.logo !== undefined && !logo.safeParse(change.logo).success) throw new APIError("BAD_REQUEST", { message: "Invalid logo URL" });
  if (change.metadata === undefined) return undefined;
  const parsed = tenantMetadata.safeParse(change.metadata);
  if (!parsed.success) throw new APIError("BAD_REQUEST", { message: "Invalid tenant config" });
  const current = metadataOf(orgId ? await tenantById(db, orgId) : undefined);
  return { ...current, ...parsed.data };
};

/** True when the tenant has an SSO provider whose domain is verified (the only kind the SSO plugin lets sign in). */
const hasSso = async (db: Db, orgId: string) =>
  (await db.select({ id: ssoProvider.id }).from(ssoProvider).where(and(eq(ssoProvider.organizationId, orgId), eq(ssoProvider.domainVerified, true))).limit(1)).length > 0;

/** Sign in with Google is configured (src/auth.ts); the app shows its button only then. */
export const googleEnabled = () => !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const publicConfig = async (db: Db, org: Org) => {
  const { colors = {}, rates = {} } = metadataOf(org);
  return { id: org.id, slug: org.slug, name: org.name, logo: org.logo, colors, features: await features(org.id), rates, sso: await hasSso(db, org.id), google: googleEnabled() };
};
