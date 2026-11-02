import { and, desc, eq, notInArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";
import type { Db } from "../db";
import { planRow, planVersion } from "../db/schema";
import type { Env } from "../guard";

// The prototype owns the shape of its state object, so the API stores it opaque (size-limited, per user).
const planSchema = z.record(z.string(), z.unknown());

const version = z.number().int().min(0).max(2147483646);
const note = z.string().trim().min(1).max(200);
// snapshot: set at the app's meaningful points (goals changed, plan confirmed); the saved plan is kept as a version with this note.
const putBody = z.object({ version, plan: planSchema, snapshot: note.optional() });
const restoreBody = z.object({ version });
const restoreParam = z.object({ id: z.coerce.number().int().positive().max(2147483647) });
const invalidRestore = (res: { success: boolean }, c: Context) => (res.success ? undefined : c.json({ error: "invalid restore" }, 400));

export const KEPT_VERSIONS = 50; // per user per tenant; older ones are dropped

/**
 * GET /plan -> { version, plan } (version 0, plan null when nothing saved). PUT /plan { version, plan, snapshot? } where version is the one last read; stale = 409. One plan per user per tenant.
 * GET /plan/versions -> { versions: [{ id, note, at }] } newest first. POST /plan/versions/:id/restore { version } -> { version, plan }; the plan it replaces is kept as a version first.
 */
export const planRoutes = (db: Db) => {
  const r = new Hono<Env>();
  const mine = (userId: string, orgId: string) => and(eq(planRow.userId, userId), eq(planRow.organizationId, orgId));
  const myVersions = (userId: string, orgId: string) => and(eq(planVersion.userId, userId), eq(planVersion.organizationId, orgId));
  type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
  const keep = async (tx: Tx, userId: string, orgId: string, note: string, data: never) => {
    await tx.insert(planVersion).values({ userId, organizationId: orgId, note, data });
    const newest = tx.select({ id: planVersion.id }).from(planVersion).where(myVersions(userId, orgId)).orderBy(desc(planVersion.id)).limit(KEPT_VERSIONS);
    await tx.delete(planVersion).where(and(myVersions(userId, orgId), notInArray(planVersion.id, newest)));
  };

  r.get("/plan", async (c) => {
    const [row] = await db.select().from(planRow).where(mine(c.var.userId, c.var.orgId));
    return c.json({ version: row?.version ?? 0, plan: row?.data ?? null });
  });

  // Never log the driver error: Drizzle's message carries the query params, i.e. the whole plan (PII). Log the code only.
  // Postgres class 22 = data exception (U+0000, lone surrogate: jsonb refuses them): the client's data, so 400, not 500.
  r.onError((e, c) => {
    const code = (e as { cause?: { code?: string } }).cause?.code;
    console.error("plan db error", code);
    return code?.startsWith("22") ? c.json({ error: "invalid plan" }, 400) : c.json({ error: "server error" }, 500);
  });

  r.put("/plan", bodyLimit({ maxSize: 1024 * 1024, onError: (c) => c.json({ error: "plan too large" }, 413) }), async (c) => {
    const text = await c.req.text();
    const raw = (() => { try { return JSON.parse(text); } catch { return null; } })();
    const body = putBody.safeParse(raw);
    if (!body.success) return c.json({ error: "invalid plan", issues: body.error.issues.map((i) => ({ path: i.path, message: i.message })) }, 400);
    const { version } = body.data;
    const plan = body.data.plan as never; // db column is typed as the legacy Plan; the real shape is the prototype's
    const { userId, orgId } = c.var;
    const next = version + 1;
    // Compare-and-set in one statement: insert only if no row (version 0), else update only if the stored version still matches. The snapshot commits with it.
    const row = await db.transaction(async (tx) => {
      const [saved] =
        version === 0
          ? await tx.insert(planRow).values({ userId, organizationId: orgId, version: next, data: plan }).onConflictDoNothing().returning({ version: planRow.version })
          : await tx.update(planRow).set({ version: next, data: plan, updatedAt: new Date() })
              .where(and(mine(userId, orgId), eq(planRow.version, version))).returning({ version: planRow.version });
      if (saved && body.data.snapshot) await keep(tx, userId, orgId, body.data.snapshot, plan);
      return saved;
    });
    if (row) return c.json({ version: row.version });
    const [cur] = await db.select({ version: planRow.version }).from(planRow).where(mine(userId, orgId));
    return c.json({ error: "stale version", version: cur?.version ?? 0 }, 409);
  });

  r.get("/plan/versions", async (c) =>
    c.json({ versions: await db.select({ id: planVersion.id, note: planVersion.note, at: planVersion.at }).from(planVersion)
      .where(myVersions(c.var.userId, c.var.orgId)).orderBy(desc(planVersion.id)) }));

  r.post("/plan/versions/:id/restore", zValidator("param", restoreParam, invalidRestore), zValidator("json", restoreBody, invalidRestore), async (c) => {
    const { id } = c.req.valid("param");
    const { userId, orgId } = c.var;
    const [snap] = await db.select({ note: planVersion.note, data: planVersion.data }).from(planVersion).where(and(myVersions(userId, orgId), eq(planVersion.id, id)));
    if (!snap) return c.json({ error: "not found" }, 404);
    const { version } = c.req.valid("json");
    const row = await db.transaction(async (tx) => {
      const [cur] = await tx.select({ data: planRow.data }).from(planRow).where(and(mine(userId, orgId), eq(planRow.version, version)));
      if (!cur) return undefined;
      const [saved] = await tx.update(planRow).set({ version: version + 1, data: snap.data as never, updatedAt: new Date() })
        .where(and(mine(userId, orgId), eq(planRow.version, version))).returning({ version: planRow.version });
      if (saved) await keep(tx, userId, orgId, `Before restoring "${snap.note}"`, cur.data as never); // nothing is lost by a restore
      return saved;
    });
    if (row) return c.json({ version: row.version, plan: snap.data });
    const [cur] = await db.select({ version: planRow.version }).from(planRow).where(mine(userId, orgId));
    return c.json({ error: "stale version", version: cur?.version ?? 0 }, 409);
  });

  return r;
};
