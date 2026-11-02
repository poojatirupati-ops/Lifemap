import type { INestApplicationContext } from "@nestjs/common";
import { Hono } from "hono";
import { resolver } from "hono-openapi";
import { z } from "zod";
import type { Env } from "../guard";
import { MeService } from "../me/me.service";
import { doc, errors } from "../openapi";

const version = z.string().min(1).max(64);
/** notice: privacy notice/terms version acknowledged (contract basis, not consent). marketing, analytics (PostHog): optional consents, granted or withdrawn, with the wording version shown. */
const consentBody = z.object({
  notice: version.optional(),
  marketing: z.object({ granted: z.boolean(), version }).optional(),
  analytics: z.object({ granted: z.boolean(), version }).optional(),
});

/** /me (account), DELETE /me (erasure), /me/export (access + portability), /consents (append-only events). Session required (guard); records are the caller's in the session's tenant. */
export const meRoutes = (nest: INestApplicationContext) => {
  const r = new Hono<Env>();
  const me = nest.get(MeService);

  r.get("/me", doc({ tags: ["me"], summary: "The caller's account", responses: { 200: { description: "`{ user }`" } } }), async (c) => c.json({ user: await me.account(c.var.userId) }));

  r.delete("/me", doc({
    tags: ["me"], summary: "Erase my data in this tenant",
    description: "Only tenant: the whole account is erased (Better Auth deleteUser). Also in other tenants: only this tenant's membership and its data. Needs a session under a day old.",
    responses: { 200: { description: "`{ success: true }` (plus `scope: \"organization\"` for the tenant-only path); sets Clear-Site-Data" }, 400: { description: "`SESSION_EXPIRED`: sign in again" } },
  }), async (c) => {
    const erased = await me.erase(c.req.raw.headers, c.var.userId, c.var.orgId);
    if (erased instanceof Response) {
      if (erased.ok) erased.headers.set("Clear-Site-Data", '"cache", "storage"');
      return erased;
    }
    if (!erased) return c.json({ code: "SESSION_EXPIRED", message: "Session expired. Re-authenticate to perform this action." }, 400);
    c.header("Clear-Site-Data", '"cache", "storage"');
    return c.json({ success: true, scope: erased });
  });

  r.get("/me/export", doc({ tags: ["me"], summary: "Export my data (JSON attachment)", responses: { 200: { description: "Account, consents, notices, plan and versions, documents, bookings, sessions and passkeys (this tenant's records only)" } } }), async (c) => {
    const data = await me.export(c.var.userId, c.var.orgId);
    c.header("Content-Disposition", 'attachment; filename="lifemap-my-data.json"');
    c.header("Cache-Control", "no-store");
    return c.json(data);
  });

  r.get("/consents", doc({ tags: ["consents"], summary: "Current consent state", responses: { 200: { description: "`{ consents: { <kind>: { granted, version, at } }, notice }`" } } }), async (c) => c.json(await me.consents(c.var.userId, c.var.orgId)));

  r.post("/consents", doc({
    tags: ["consents"], summary: "Record a notice acknowledgement and/or a marketing or analytics consent event (append-only)",
    requestBody: { required: true, content: { "application/json": { schema: resolver(consentBody) } } },
    responses: { 200: { description: "The new consent state, as GET /api/consents" }, 400: errors[400] },
  }), async (c) => {
    const body = consentBody.safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid consents" }, 400);
    return c.json(await me.recordConsents(c.var.userId, c.var.orgId, body.data));
  });

  return r;
};
