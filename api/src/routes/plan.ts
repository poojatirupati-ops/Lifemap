import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";
import type { Db } from "../db";
import { planRow } from "../db/schema";
import type { Env } from "../guard";

// The prototype owns the shape of its state object, so the API stores it opaque (size-limited, per user).
const planSchema = z.record(z.string(), z.unknown());

const putBody = z.object({ version: z.number().int().min(0).max(2147483646), plan: planSchema });

/** GET /plan -> { version, plan } (version 0, plan null when nothing saved). PUT /plan { version, plan } where version is the one last read; stale = 409. */
export const planRoutes = (db: Db) => {
  const r = new Hono<Env>();
  const mine = (userId: string) => eq(planRow.userId, userId);

  r.get("/plan", async (c) => {
    const [row] = await db.select().from(planRow).where(mine(c.var.userId));
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
    const userId = c.var.userId;
    const next = version + 1;
    // Compare-and-set in one statement: insert only if no row (version 0), else update only if the stored version still matches.
    const [row] =
      version === 0
        ? await db.insert(planRow).values({ userId, version: next, data: plan }).onConflictDoNothing().returning({ version: planRow.version })
        : await db.update(planRow).set({ version: next, data: plan, updatedAt: new Date() })
            .where(and(mine(userId), eq(planRow.version, version))).returning({ version: planRow.version });
    if (row) return c.json({ version: row.version });
    const [cur] = await db.select({ version: planRow.version }).from(planRow).where(mine(userId));
    return c.json({ error: "stale version", version: cur?.version ?? 0 }, 409);
  });

  return r;
};
