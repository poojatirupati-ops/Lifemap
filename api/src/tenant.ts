import { APIError } from "better-auth/api";
import { eq, sql } from "drizzle-orm";
import { Hono, type MiddlewareHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import type { Db } from "./db";
import { organization, user } from "./db/schema";
import type { Env } from "./guard";

/** The built-in tenant for independent users; seeded by migration 0003. */
export const DIRECT_ORG_ID = "lifemap-direct";

/** Feature flags and their global defaults. A tenant overrides any of them in metadata.features; missing keys fall back here. To add one: add it here and to docs/tenancy.md. */
export const FEATURE_DEFAULTS = {
  ask: true, // "Ask" questions screen
  adviserBooking: false, // book / share with an adviser (gated on G-12)
  documentUpload: false, // real document upload (B9; mock today)
};
export type Feature = keyof typeof FEATURE_DEFAULTS;

// The whole tenant config, kept in organization.metadata (Better Auth's own column). Served publicly by GET /api/tenant, so strictly shaped.
const tenantMetadata = z.strictObject({
  host: z.string().max(253).regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/).optional(),
  colors: z.record(z.string().regex(/^[a-z][a-zA-Z0-9-]{0,31}$/), z.string().regex(/^#[0-9a-fA-F]{3,8}$/)).optional(),
  features: z.strictObject(Object.fromEntries(Object.keys(FEATURE_DEFAULTS).map((k) => [k, z.boolean().optional()])) as Record<Feature, z.ZodOptional<z.ZodBoolean>>).optional(),
  rates: z.record(z.string().max(64), z.number().finite()).optional(),
}).refine((c) => JSON.stringify(c).length <= 8192, "tenant config too large");
type TenantMetadata = z.infer<typeof tenantMetadata>;
type Org = typeof organization.$inferSelect;

const metadataOf = (org?: Pick<Org, "metadata">): TenantMetadata => (org?.metadata ? JSON.parse(org.metadata) : {});
export const features = (org: Pick<Org, "metadata">) => ({ ...FEATURE_DEFAULTS, ...metadataOf(org).features });
/** Is `flag` on for this tenant? Routes gate tenant features with this. */
export const isEnabled = (org: Pick<Org, "metadata">, flag: Feature) => features(org)[flag];

/** Route middleware: 403 unless `flag` is on for the session's tenant. */
export const requireFeature = (db: Db, flag: Feature): MiddlewareHandler<Env> => async (c, next) =>
  isEnabled((await tenantById(db, c.var.orgId)) ?? { metadata: null }, flag) ? next() : c.json({ error: `${flag} is not enabled for this organization` }, 403);

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

const publicConfig = (org: Org) => {
  const { colors = {}, rates = {} } = metadataOf(org);
  return { id: org.id, slug: org.slug, name: org.name, logo: org.logo, colors, features: features(org), rates };
};

export const tenantRoutes = (db: Db) => {
  const r = new Hono<Env>();

  /** Public (no session): white-label config and resolved feature flags for the host the app is served on; LifeMap Direct when the host is no tenant's. */
  r.get("/tenant", async (c) =>
    c.json(publicConfig((await tenantForHost(db, hostOf(c.req.raw.headers))) ?? (await tenantById(db, DIRECT_ORG_ID)))));

  /** Platform admins (user.role "admin") change any tenant's config, host included, without being a member. Tenant admins use POST /api/auth/organization/update. */
  r.patch("/admin/organizations/:id/config", async (c) => {
    const [me] = await db.select({ role: user.role }).from(user).where(eq(user.id, c.var.userId));
    if (me?.role !== "admin") return c.json({ error: "forbidden" }, 403);
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
    return c.json(publicConfig(await tenantById(db, id)));
  });

  return r;
};
