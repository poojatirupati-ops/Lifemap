import type { MiddlewareHandler } from "hono";
import type { Auth } from "./auth";

export type Env = { Variables: { userId: string } };

// Deny by default: only GET /health and /api/auth/* are public; everything else needs a session.
export const guard = (auth: Auth): MiddlewareHandler<Env> => async (c, next) => {
  const { method, path } = c.req;
  if ((method === "GET" && path === "/health") || path === "/api/auth" || path.startsWith("/api/auth/")) return next();
  const s = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!s) return c.json({ error: "unauthorized" }, 401);
  c.set("userId", s.user.id);
  return next();
};
