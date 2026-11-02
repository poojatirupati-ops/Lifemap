import type { INestApplicationContext } from "@nestjs/common";
import type { MiddlewareHandler } from "hono";
import type { Auth } from "./auth";
import { type Feature, isEnabled } from "./tenant";
import { TenantService } from "./tenant/tenant.service";

/** userId and the session's active tenant (organization). Every data query filters by both. */
export type Env = { Variables: { userId: string; orgId: string } };

const DOCS = ["/api/docs", "/api/openapi.json"];

// Deny by default: only GET /health, GET /api/tenant, /api/auth/* and the signed POST /api/webhooks/* are public (plus the API docs outside production); everything else needs a session in a tenant.
export const guard = (auth: Auth): MiddlewareHandler<Env> => async (c, next) => {
  const { method, path } = c.req;
  if ((method === "GET" && (path === "/health" || path === "/api/health" || path === "/api/tenant")) || path === "/api/auth" || path.startsWith("/api/auth/")) return next();
  if (method === "POST" && path.startsWith("/api/webhooks/")) return next(); // each checks its own signature
  if (method === "GET" && DOCS.includes(path) && process.env.NODE_ENV !== "production") return next();
  const s = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!s) return c.json({ error: "unauthorized" }, 401);
  if (!s.session.activeOrganizationId) return c.json({ error: "no active organization" }, 403);
  c.set("userId", s.user.id);
  c.set("orgId", s.session.activeOrganizationId);
  return next();
};

/** Route middleware: 403 unless `flag` is on for the session's tenant. */
export const requireFeature = (flag: Feature): MiddlewareHandler<Env> => async (c, next) =>
  (await isEnabled({ id: c.var.orgId }, flag)) ? next() : c.json({ error: `${flag} is not enabled for this organization` }, 403);

/** Route middleware: 403 unless the caller is a platform admin (user.role "admin"). */
export const platformAdmin = (nest: INestApplicationContext): MiddlewareHandler<Env> => async (c, next) =>
  (await nest.get(TenantService).isPlatformAdmin(c.var.userId)) ? next() : c.json({ error: "forbidden" }, 403);
