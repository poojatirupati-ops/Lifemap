import type { INestApplicationContext } from "@nestjs/common";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { Env } from "../guard";
import { problem } from "../observe";
import { doc, errors } from "../openapi";
import { PlanService } from "../plan/plan.service";

// The prototype owns the shape of its state object, so the API stores it opaque (size-limited, per user).
const planSchema = z.record(z.string(), z.unknown());

const version = z.number().int().min(0).max(2147483646);
const note = z.string().trim().min(1).max(200);
// snapshot: set at the app's meaningful points (goals changed, plan confirmed); the saved plan is kept as a version with this note.
const putBody = z.object({ version, plan: planSchema, snapshot: note.optional() });
const restoreBody = z.object({ version });
const restoreParam = z.object({ id: z.coerce.number().int().positive().max(2147483647) });
const invalidRestore = (res: { success: boolean }, c: Context) => (res.success ? undefined : c.json({ error: "invalid restore" }, 400));

/**
 * GET /plan -> { version, plan } (version 0, plan null when nothing saved). PUT /plan { version, plan, snapshot? } where version is the one last read; stale = 409. One plan per user per tenant.
 * GET /plan/versions -> { versions: [{ id, note, at }] } newest first. POST /plan/versions/:id/restore { version } -> { version, plan }; the plan it replaces is kept as a version first.
 */
export const planRoutes = (nest: INestApplicationContext) => {
  const r = new Hono<Env>();
  const plans = nest.get(PlanService);

  r.get("/plan", doc({ tags: ["plan"], summary: "The caller's plan in this tenant", responses: { 200: { description: "`{ version, plan }`; version 0 and plan null when nothing is saved" } } }), async (c) =>
    c.json(await plans.get(c.var.userId, c.var.orgId)));

  // Sub-app handler too, so the class-22 -> 400 mapping holds wherever these routes are mounted (src/observe.ts).
  r.onError(problem);

  r.put("/plan", doc({
    tags: ["plan"], summary: "Save the plan (compare-and-set on version)",
    description: "`version` is the one last read. `snapshot` also keeps the saved plan as a version with that note (newest 50 kept).",
    requestBody: { required: true, content: { "application/json": { schema: resolver(putBody) } } },
    responses: { 200: { description: "`{ version }` (the new version)" }, 400: errors[400], 409: errors[409], 413: errors[413] },
  }), bodyLimit({ maxSize: 1024 * 1024, onError: (c) => c.json({ error: "plan too large" }, 413) }), async (c) => {
    const text = await c.req.text();
    const raw = (() => { try { return JSON.parse(text); } catch { return null; } })();
    const body = putBody.safeParse(raw);
    if (!body.success) return c.json({ error: "invalid plan", issues: body.error.issues.map((i) => ({ path: i.path, message: i.message })) }, 400);
    // db column is typed as the legacy Plan; the real shape is the prototype's
    const saved = await plans.save(c.var.userId, c.var.orgId, body.data.version, body.data.plan as never, body.data.snapshot);
    return "stale" in saved ? c.json({ error: "stale version", version: saved.stale }, 409) : c.json(saved);
  });

  r.get("/plan/versions", doc({ tags: ["plan"], summary: "Saved plan versions", responses: { 200: { description: "`{ versions: [{ id, note, at }] }`, newest first" } } }), async (c) =>
    c.json({ versions: await plans.versions(c.var.userId, c.var.orgId) }));

  r.post("/plan/versions/:id/restore", doc({
    tags: ["plan"], summary: "Restore a saved version", description: "`version` is the current plan version. The plan it replaces is kept as a version first.",
    responses: { 200: { description: "`{ version, plan }`" }, 400: errors[400], 404: errors[404], 409: errors[409] },
  }), validator("param", restoreParam, invalidRestore), validator("json", restoreBody, invalidRestore), async (c) => {
    const restored = await plans.restore(c.var.userId, c.var.orgId, c.req.valid("param").id, c.req.valid("json").version);
    if (!restored) return c.json({ error: "not found" }, 404);
    return "stale" in restored ? c.json({ error: "stale version", version: restored.stale }, 409) : c.json(restored);
  });

  return r;
};
