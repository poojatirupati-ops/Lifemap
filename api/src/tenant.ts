import { APIError } from "better-auth/api";
import { and, eq, sql } from "drizzle-orm";
import { Hono, type MiddlewareHandler } from "hono";
import { PostHog } from "posthog-node";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { resolver } from "hono-openapi";
import { z } from "zod";
import type { Db } from "./db";
import { organization, ssoProvider, user } from "./db/schema";
import type { Env } from "./guard";
import { doc, docPublic, errors } from "./openapi";

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
const tenantMetadata = z.strictObject({
  host: z.string().max(253).regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/).optional(),
  colors: z.record(z.string().regex(/^[a-z][a-zA-Z0-9-]{0,31}$/), z.string().regex(/^#[0-9a-fA-F]{3,8}$/)).optional(),
  rates: z.record(z.string().max(64), z.number().finite()).optional(),
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

/** Route middleware: 403 unless `flag` is on for the session's tenant. */
export const requireFeature = (_db: Db, flag: Feature): MiddlewareHandler<Env> => async (c, next) =>
  (await isEnabled({ id: c.var.orgId }, flag)) ? next() : c.json({ error: `${flag} is not enabled for this organization` }, 403);

/** Route middleware: 403 unless the caller is a platform admin (user.role "admin"). */
export const platformAdmin = (db: Db): MiddlewareHandler<Env> => async (c, next) => {
  const [me] = await db.select({ role: user.role }).from(user).where(eq(user.id, c.var.userId));
  return me?.role === "admin" ? next() : c.json({ error: "forbidden" }, 403);
};

/** The public hostname a request was made on. Behind the CDN, X-Forwarded-Host (the CDN must overwrite it, never pass the client's). */
export const hostOf = (headers?: Headers | null) =>
  (headers?.get("x-forwarded-host") ?? headers?.get("host") ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");

export const tenantForHost = async (db: Db, host: string) => {
  if (!host) return undefined;
  const [org] = await db.select().from(organization).where(sql`(${organization.metadata})::jsonb->>'host' = ${host}`);
  return org;
};
export const tenantById = async (db: Db, id: string) => (await db.select().from(organization).where(eq(organization.id, id)))[0];

const logo = z.string().max(2048).regex(/^https:\/\/[^\s"'<>]+$/).nullable();

/**
 * Validates a tenant config change and merges it over the stored one (top-level keys replace). Only platform admins set or change `host`.
 * Used by the organization plugin's create/update hooks (tenant admins) and the platform-admin route below. Returns the metadata to store, if any.
 */
export const mergeTenantConfig = async (db: Db, orgId: string | undefined, change: { logo?: string | null; metadata?: unknown }, platformAdmin: boolean) => {
  if (change.logo !== undefined && !logo.safeParse(change.logo).success) throw new APIError("BAD_REQUEST", { message: "Invalid logo URL" });
  if (change.metadata === undefined) return undefined;
  const parsed = tenantMetadata.safeParse(change.metadata);
  if (!parsed.success) throw new APIError("BAD_REQUEST", { message: "Invalid tenant config" });
  const current = metadataOf(orgId ? await tenantById(db, orgId) : undefined);
  const next = { ...current, ...parsed.data };
  if (next.host !== current.host) {
    if (!platformAdmin) throw new APIError("FORBIDDEN", { message: "Only platform admins set a tenant host" });
    if (next.host && (await tenantForHost(db, next.host))) throw new APIError("BAD_REQUEST", { message: "Host already used by another tenant" });
  }
  return next;
};

/** True when the tenant has an SSO provider whose domain is verified (the only kind the SSO plugin lets sign in). */
const hasSso = async (db: Db, orgId: string) =>
  (await db.select({ id: ssoProvider.id }).from(ssoProvider).where(and(eq(ssoProvider.organizationId, orgId), eq(ssoProvider.domainVerified, true))).limit(1)).length > 0;

const publicConfig = async (db: Db, org: Org) => {
  const { colors = {}, rates = {} } = metadataOf(org);
  return { id: org.id, slug: org.slug, name: org.name, logo: org.logo, colors, features: await features(org.id), rates, sso: await hasSso(db, org.id) };
};

export const tenantRoutes = (db: Db) => {
  const r = new Hono<Env>();

  /** Public (no session): white-label config and resolved feature flags for the host the app is served on; LifeMap Direct when the host is no tenant's. */
  r.get("/tenant", docPublic({ tags: ["tenant"], summary: "Branding, resolved feature flags, rates and SSO availability for the request host", description: "`features` is resolved on the server: PostHog flags for the tenant (group type `organization`, set by LifeMap staff), else code defaults. The browser never calls PostHog for flags. `sso` is true when the tenant has at least one SSO provider with a verified domain.", responses: { 200: { description: "`{ id, slug, name, logo, colors, features, rates, sso }`; LifeMap Direct when the host is no tenant's" } } }), async (c) =>
    c.json(await publicConfig(db, (await tenantForHost(db, hostOf(c.req.raw.headers))) ?? (await tenantById(db, DIRECT_ORG_ID)))));

  /** Platform admins (user.role "admin") change any tenant's config, host included, without being a member. Tenant admins use POST /api/auth/organization/update. */
  r.patch("/admin/organizations/:id/config", doc({
    tags: ["admin"], summary: "Change any tenant's config (platform admins only)",
    description: "Top-level metadata keys (host, colors, rates) replace the stored ones. Feature flags are not here: LifeMap staff set them in PostHog. 403 unless user.role is admin.",
    // docs only: the handler validates through mergeTenantConfig
    requestBody: { required: true, content: { "application/json": { schema: resolver(z.object({ logo: logo.optional(), metadata: tenantMetadata.optional() })) } } },
    responses: { 200: { description: "The tenant's public config, as GET /api/tenant" }, 400: errors[400], 404: errors[404] },
  }), platformAdmin(db), async (c) => {
    const id = c.req.param("id");
    if (!(await tenantById(db, id))) return c.json({ error: "not found" }, 404);
    const body = (await c.req.json().catch(() => null)) as { logo?: string | null; metadata?: unknown } | null;
    try {
      const metadata = await mergeTenantConfig(db, id, body ?? {}, true);
      await db.update(organization).set({
        ...(body?.logo !== undefined && { logo: body.logo }),
        ...(metadata && { metadata: JSON.stringify(metadata) }),
      }).where(eq(organization.id, id));
    } catch (e) {
      if (e instanceof APIError) return c.json({ error: e.message }, e.statusCode as ContentfulStatusCode);
      throw e;
    }
    return c.json(await publicConfig(db, await tenantById(db, id)));
  });

  return r;
};
