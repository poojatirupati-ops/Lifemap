import { and, eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import type { Auth } from "./auth";
import type { Db } from "./db";
import { member } from "./db/schema";
import { type Feature, isEnabled } from "./tenant";

/** userId and the session's active tenant (organization). Every data query filters by both. */
export type Env = { Variables: { userId: string; orgId: string; role?: string | null } };

const DOCS = ["/api/docs", "/api/openapi.json"];

// Deny by default: only GET /health, GET /api/tenant, /api/auth/* and the signed POST /api/webhooks/* are public (plus the API docs outside production); everything else needs a session in a tenant
// the user is still a member of (a removed member's session keeps its activeOrganizationId, however the membership went).
export const guard = (auth: Auth, db: Db): MiddlewareHandler<Env> => async (c, next) => {
  const { method, path } = c.req;
  if ((method === "GET" && (path === "/health" || path === "/api/health" || path === "/api/tenant")) || path === "/api/auth" || path.startsWith("/api/auth/")) return next();
  if (method === "POST" && path.startsWith("/api/webhooks/")) return next(); // each checks its own signature
  if (method === "GET" && DOCS.includes(path) && process.env.NODE_ENV !== "production") return next();
  const s = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!s) return c.json({ error: "unauthorized" }, 401);
  const orgId = s.session.activeOrganizationId;
  if (!orgId) return c.json({ error: "no active organization" }, 403);
  const [m] = await db.select({ id: member.id }).from(member).where(and(eq(member.userId, s.user.id), eq(member.organizationId, orgId))).limit(1);
  if (!m) return c.json({ error: "not a member of the active organization" }, 403);
  c.set("userId", s.user.id);
  c.set("orgId", orgId);
  c.set("role", s.user.role); // admin plugin: "admin" = platform staff
  return next();
};

/** Route middleware: 403 unless `flag` is on for the session's tenant. */
export const requireFeature = (flag: Feature): MiddlewareHandler<Env> => async (c, next) =>
  (await isEnabled({ id: c.var.orgId }, flag)) ? next() : c.json({ error: `${flag} is not enabled for this organization` }, 403);

/** Route middleware: 403 unless the caller is a platform admin (user.role "admin"). */
export const platformAdmin: MiddlewareHandler<Env> = async (c, next) => (c.var.role === "admin" ? next() : c.json({ error: "forbidden" }, 403));
