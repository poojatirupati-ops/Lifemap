import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Auth } from "../auth";
import type { Db } from "../db";
import { consentEvent, noticeAck, passkey, planRow, session, user } from "../db/schema";
import type { Env } from "../guard";

const version = z.string().min(1).max(64);
/** notice: privacy notice/terms version acknowledged (contract basis, not consent). marketing: optional consent, granted or withdrawn, with the wording version shown. */
const consentBody = z.object({
  notice: version.optional(),
  marketing: z.object({ granted: z.boolean(), version }).optional(),
});

/** /me (account), DELETE /me (erasure), /me/export (access + portability), /consents (append-only events). Session required (guard). */
export const meRoutes = (db: Db, auth: Auth) => {
  const r = new Hono<Env>();

  /** Current state: the latest event per kind, and the latest notice acknowledged. */
  const consentState = async (userId: string) => {
    const latest = await db.selectDistinctOn([consentEvent.kind], { kind: consentEvent.kind, granted: consentEvent.granted, version: consentEvent.version, at: consentEvent.at })
      .from(consentEvent).where(eq(consentEvent.userId, userId)).orderBy(consentEvent.kind, desc(consentEvent.id));
    const [notice] = await db.select({ version: noticeAck.version, at: noticeAck.at }).from(noticeAck)
      .where(eq(noticeAck.userId, userId)).orderBy(desc(noticeAck.at)).limit(1);
    return { consents: Object.fromEntries(latest.map(({ kind, ...rest }) => [kind, rest])), notice: notice ?? null };
  };

  r.get("/me", async (c) => {
    const [row] = await db.select().from(user).where(eq(user.id, c.var.userId));
    return c.json({ user: row });
  });

  // Better Auth's deleteUser: needs a session younger than a day (else 400 SESSION_EXPIRED: sign in again), runs eraseTraces, deletes the user (FK cascade), clears the cookie.
  r.delete("/me", async (c) => {
    const res = await auth.api.deleteUser({ headers: c.req.raw.headers, body: {}, asResponse: true });
    if (res.ok) res.headers.set("Clear-Site-Data", '"cache", "storage"');
    return res;
  });

  r.get("/me/export", async (c) => {
    const id = c.var.userId;
    const [[account], consents, notices, [plan], sessions, passkeys] = await Promise.all([
      db.select().from(user).where(eq(user.id, id)),
      db.select({ kind: consentEvent.kind, granted: consentEvent.granted, version: consentEvent.version, at: consentEvent.at })
        .from(consentEvent).where(eq(consentEvent.userId, id)).orderBy(consentEvent.id),
      db.select({ version: noticeAck.version, at: noticeAck.at }).from(noticeAck).where(eq(noticeAck.userId, id)).orderBy(noticeAck.at),
      db.select({ version: planRow.version, updatedAt: planRow.updatedAt, data: planRow.data }).from(planRow).where(eq(planRow.userId, id)),
      // no tokens or key material: metadata only
      db.select({ createdAt: session.createdAt, expiresAt: session.expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent })
        .from(session).where(eq(session.userId, id)),
      db.select({ name: passkey.name, deviceType: passkey.deviceType, backedUp: passkey.backedUp, aaguid: passkey.aaguid, createdAt: passkey.createdAt })
        .from(passkey).where(eq(passkey.userId, id)),
    ]);
    c.header("Content-Disposition", 'attachment; filename="lifemap-my-data.json"');
    c.header("Cache-Control", "no-store");
    return c.json({ exportedAt: new Date(), account, consents, notices, plan: plan ?? null, sessions, passkeys });
  });

  r.get("/consents", async (c) => c.json(await consentState(c.var.userId)));

  // Append-only: a withdrawal is a `granted: false` event; nothing is updated or removed.
  r.post("/consents", async (c) => {
    const body = consentBody.safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid consents" }, 400);
    const { notice, marketing } = body.data;
    const userId = c.var.userId;
    if (notice) await db.insert(noticeAck).values({ userId, version: notice }).onConflictDoNothing(); // first acknowledgement of a version is the one kept
    if (marketing) await db.insert(consentEvent).values({ userId, kind: "marketing", ...marketing });
    return c.json(await consentState(userId));
  });

  return r;
};
