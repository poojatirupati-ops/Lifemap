import { and, desc, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Auth } from "../auth";
import type { Db } from "../db";
import { booking, consentEvent, document, member, noticeAck, organization, passkey, planRow, planVersion, session, user } from "../db/schema";
import { type Files, removeDocuments } from "../files";
import type { Env } from "../guard";

const version = z.string().min(1).max(64);
/** notice: privacy notice/terms version acknowledged (contract basis, not consent). marketing: optional consent, granted or withdrawn, with the wording version shown. */
const consentBody = z.object({
  notice: version.optional(),
  marketing: z.object({ granted: z.boolean(), version }).optional(),
});

/** /me (account), DELETE /me (erasure), /me/export (access + portability), /consents (append-only events). Session required (guard); records are the caller's in the session's tenant. */
export const meRoutes = (db: Db, auth: Auth, files: Files) => {
  const r = new Hono<Env>();
  const consentsOf = (userId: string, orgId: string) => and(eq(consentEvent.userId, userId), eq(consentEvent.organizationId, orgId));
  const noticesOf = (userId: string, orgId: string) => and(eq(noticeAck.userId, userId), eq(noticeAck.organizationId, orgId));

  /** Current state: the latest event per kind, and the latest notice acknowledged. */
  const consentState = async (userId: string, orgId: string) => {
    const latest = await db.selectDistinctOn([consentEvent.kind], { kind: consentEvent.kind, granted: consentEvent.granted, version: consentEvent.version, at: consentEvent.at })
      .from(consentEvent).where(consentsOf(userId, orgId)).orderBy(consentEvent.kind, desc(consentEvent.id));
    const [notice] = await db.select({ version: noticeAck.version, at: noticeAck.at }).from(noticeAck)
      .where(noticesOf(userId, orgId)).orderBy(desc(noticeAck.at)).limit(1);
    return { consents: Object.fromEntries(latest.map(({ kind, ...rest }) => [kind, rest])), notice: notice ?? null };
  };

  r.get("/me", async (c) => {
    const [row] = await db.select().from(user).where(eq(user.id, c.var.userId));
    return c.json({ user: row });
  });

  // Erasure within the tenant. Only tenant: Better Auth's deleteUser (needs a session younger than a day, else 400 SESSION_EXPIRED; runs eraseTraces; deletes the user, FK cascade; clears the cookie).
  // Also a member elsewhere: delete this tenant's membership, which cascades to its plan, consents and notices; the account stays for the other tenants.
  r.delete("/me", async (c) => {
    const { userId, orgId } = c.var;
    const [elsewhere] = await db.select({ id: member.id }).from(member).where(and(eq(member.userId, userId), ne(member.organizationId, orgId))).limit(1);
    if (!elsewhere) {
      const res = await auth.api.deleteUser({ headers: c.req.raw.headers, body: {}, asResponse: true });
      if (res.ok) res.headers.set("Clear-Site-Data", '"cache", "storage"');
      return res;
    }
    const s = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!s || Date.now() - s.session.createdAt.getTime() > 24 * 60 * 60 * 1000) // same freshness rule as deleteUser
      return c.json({ code: "SESSION_EXPIRED", message: "Session expired. Re-authenticate to perform this action." }, 400);
    await removeDocuments(db, files, and(eq(document.userId, userId), eq(document.organizationId, orgId))); // stored objects first; the rows cascade anyway
    await db.delete(member).where(and(eq(member.userId, userId), eq(member.organizationId, orgId)));
    await db.update(session).set({ activeOrganizationId: null }).where(and(eq(session.userId, userId), eq(session.activeOrganizationId, orgId)));
    c.header("Clear-Site-Data", '"cache", "storage"');
    return c.json({ success: true, scope: "organization" });
  });

  // Account, sessions and passkeys are the person's own identity; consents, notices, plan (and its versions), documents and bookings are this tenant's records only.
  r.get("/me/export", async (c) => {
    const { userId: id, orgId } = c.var;
    const [[account], [tenant], consents, notices, [plan], sessions, passkeys, planVersions, documents, bookings] = await Promise.all([
      db.select().from(user).where(eq(user.id, id)),
      db.select({ id: organization.id, name: organization.name }).from(organization).where(eq(organization.id, orgId)),
      db.select({ kind: consentEvent.kind, granted: consentEvent.granted, version: consentEvent.version, detail: consentEvent.detail, at: consentEvent.at })
        .from(consentEvent).where(consentsOf(id, orgId)).orderBy(consentEvent.id),
      db.select({ version: noticeAck.version, at: noticeAck.at }).from(noticeAck).where(noticesOf(id, orgId)).orderBy(noticeAck.at),
      db.select({ version: planRow.version, updatedAt: planRow.updatedAt, data: planRow.data }).from(planRow)
        .where(and(eq(planRow.userId, id), eq(planRow.organizationId, orgId))),
      // no tokens or key material: metadata only
      db.select({ createdAt: session.createdAt, expiresAt: session.expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent })
        .from(session).where(eq(session.userId, id)),
      db.select({ name: passkey.name, deviceType: passkey.deviceType, backedUp: passkey.backedUp, aaguid: passkey.aaguid, createdAt: passkey.createdAt })
        .from(passkey).where(eq(passkey.userId, id)),
      db.select({ note: planVersion.note, at: planVersion.at, data: planVersion.data }).from(planVersion)
        .where(and(eq(planVersion.userId, id), eq(planVersion.organizationId, orgId))).orderBy(planVersion.id),
      // file contents are fetched with GET /api/documents/:id
      db.select({ id: document.id, name: document.name, contentType: document.contentType, size: document.size, createdAt: document.createdAt }).from(document)
        .where(and(eq(document.userId, id), eq(document.organizationId, orgId))),
      db.select({ adviserId: booking.adviserId, slot: booking.slot, mode: booking.mode, share: booking.share, status: booking.status, createdAt: booking.createdAt, cancelledAt: booking.cancelledAt })
        .from(booking).where(and(eq(booking.userId, id), eq(booking.organizationId, orgId))),
    ]);
    c.header("Content-Disposition", 'attachment; filename="lifemap-my-data.json"');
    c.header("Cache-Control", "no-store");
    return c.json({ exportedAt: new Date(), account, organization: tenant, consents, notices, plan: plan ?? null, planVersions, documents, bookings, sessions, passkeys });
  });

  r.get("/consents", async (c) => c.json(await consentState(c.var.userId, c.var.orgId)));

  // Append-only: a withdrawal is a `granted: false` event; nothing is updated or removed.
  r.post("/consents", async (c) => {
    const body = consentBody.safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid consents" }, 400);
    const { notice, marketing } = body.data;
    const { userId, orgId: organizationId } = c.var;
    if (notice) await db.insert(noticeAck).values({ userId, organizationId, version: notice }).onConflictDoNothing(); // first acknowledgement of a version is the one kept
    if (marketing) await db.insert(consentEvent).values({ userId, organizationId, kind: "marketing", ...marketing });
    return c.json(await consentState(userId, organizationId));
  });

  return r;
};
