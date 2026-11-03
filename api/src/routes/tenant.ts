import type { INestApplicationContext } from "@nestjs/common";
import { APIError } from "better-auth/api";
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { resolver } from "hono-openapi";
import { z } from "zod";
import { type Env, platformAdmin } from "../guard";
import { doc, docPublic, errors } from "../openapi";
import { logo, tenantMetadata } from "../tenant";
import { TenantService } from "../tenant/tenant.service";

export const tenantRoutes = (nest: INestApplicationContext) => {
  const r = new Hono<Env>();
  const tenants = nest.get(TenantService);

  /** Public: white-label config and resolved feature flags for the session's active tenant; LifeMap Direct without a session or active tenant. */
  r.get("/tenant", docPublic({ tags: ["tenant"], summary: "Branding, resolved feature flags, rates and SSO availability for the active tenant", description: "The tenant is the session's active organization (set by SSO sign-in, accepting an invitation, or POST /api/auth/organization/set-active); LifeMap Direct without a session. There are no tenant domains: every tenant is served on LifeMap's own domain. `features` is resolved on the server: PostHog flags for the tenant (group type `organization`, set by LifeMap staff), else code defaults. The browser never calls PostHog for flags. `sso` is true when the tenant has at least one SSO provider with a verified domain. Not Better Auth's organization endpoints: they need a session and membership (this one serves LifeMap Direct signed out), and carry no flags or SSO state; `get-full-organization`, `list-members` and `list-invitations` are tenant-admin only.", responses: { 200: { description: "`{ id, slug, name, logo, colors, features, rates, sso }`; LifeMap Direct without an active tenant" } } }), async (c) =>
    c.json(await tenants.current(c.req.raw.headers)));

  /** Platform admins (user.role "admin") change any tenant's config without being a member. Tenant admins use POST /api/auth/organization/update. */
  r.patch("/admin/organizations/:id/config", doc({
    tags: ["admin"], summary: "Change any tenant's config (platform admins only)",
    description: "Top-level metadata keys (colors, rates) replace the stored ones. Feature flags are not here: LifeMap staff set them in PostHog. 403 unless user.role is admin.",
    // docs only: the handler validates through mergeTenantConfig
    requestBody: { required: true, content: { "application/json": { schema: resolver(z.object({ logo: logo.optional(), metadata: tenantMetadata.optional() })) } } },
    responses: { 200: { description: "The tenant's public config, as GET /api/tenant" }, 400: errors[400], 404: errors[404] },
  }), platformAdmin, async (c) => {
    const body = (await c.req.json().catch(() => null)) as { logo?: string | null; metadata?: unknown } | null;
    try {
      const config = await tenants.update(c.req.param("id"), body ?? {});
      return config ? c.json(config) : c.json({ error: "not found" }, 404);
    } catch (e) {
      if (e instanceof APIError) return c.json({ error: e.message }, e.statusCode as ContentfulStatusCode);
      throw e;
    }
  });

  return r;
};
