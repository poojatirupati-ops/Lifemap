import type { MiddlewareHandler } from "hono";
import type { Auth } from "./auth";

/** userId and the session's active tenant (organization). Every data query filters by both. */
export type Env = { Variables: { userId: string; orgId: string } };

// Deny by default: only GET /health, GET /api/tenant and /api/auth/* are public; everything else needs a session in a tenant.
export const guard = (auth: Auth): MiddlewareHandler<Env> => async (c, next) => {
  const { method, path } = c.req;
  if ((method === "GET" && (path === "/health" || path === "/api/tenant")) || path === "/api/auth" || path.startsWith("/api/auth/")) return next();
  const s = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!s) return c.json({ error: "unauthorized" }, 401);
  if (!s.session.activeOrganizationId) return c.json({ error: "no active organization" }, 403);
  c.set("userId", s.user.id);
  c.set("orgId", s.session.activeOrganizationId);
  return next();
};
