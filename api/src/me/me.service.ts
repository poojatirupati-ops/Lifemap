import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, ne } from "drizzle-orm";
import { AUTH, type Auth } from "../auth";
import { DB, type Db } from "../db";
import { booking, consentEvent, document, member, noticeAck, organization, passkey, planRow, planVersion, session, user } from "../db/schema";
import { FILES, type Files, removeDocuments } from "../files";

/** Erases the user's PostHog person, events and recordings (distinct id = user id). Without POSTHOG_PERSONAL_API_KEY (dev, tests) there is nothing to erase. A failure is logged, never blocks the erasure here. */
const erasePosthogPerson = async (userId: string) => {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!key) return;
  const host = process.env.POSTHOG_HOST ?? "https://eu.i.posthog.com";
  const res = await fetch(`${host}/api/projects/@current/persons/bulk_delete/`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ distinct_ids: [userId], delete_events: true, delete_recordings: true }),
  }).catch((e: unknown) => e);
  if (!(res instanceof Response && res.ok)) console.error("posthog person erasure failed; erase by hand", { userId, status: res instanceof Response ? res.status : String(res) });
};

const consentsOf = (userId: string, orgId: string) => and(eq(consentEvent.userId, userId), eq(consentEvent.organizationId, orgId));
const noticesOf = (userId: string, orgId: string) => and(eq(noticeAck.userId, userId), eq(noticeAck.organizationId, orgId));

/** The caller's account, erasure, export and consents; records are the caller's in the session's tenant. */
@Injectable()
export class MeService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(AUTH) private readonly auth: Auth, @Inject(FILES) private readonly files: Files) {}

  account = async (userId: string) => (await this.db.select().from(user).where(eq(user.id, userId)))[0];

  /**
   * Erasure within the tenant. Only tenant: Better Auth's deleteUser (needs a session younger than a day, else 400 SESSION_EXPIRED; runs eraseTraces; deletes the user, FK cascade; clears the cookie), returned as its Response.
   * Also a member elsewhere: delete this tenant's membership, which cascades to its plan, consents and notices; the account stays for the other tenants. Returns "organization", or undefined when the session is not fresh.
   */
  async erase(headers: Headers, userId: string, orgId: string) {
    const [elsewhere] = await this.db.select({ id: member.id }).from(member).where(and(eq(member.userId, userId), ne(member.organizationId, orgId))).limit(1);
    if (!elsewhere) {
      const res = await this.auth.api.deleteUser({ headers, body: {}, asResponse: true });
      if (res.ok) await erasePosthogPerson(userId);
      return res;
    }
    const s = await this.auth.api.getSession({ headers });
    if (!s || Date.now() - s.session.createdAt.getTime() > this.auth.options.session.freshAge * 1000) return undefined; // same freshness rule as deleteUser
    await removeDocuments(this.db, this.files, and(eq(document.userId, userId), eq(document.organizationId, orgId))); // stored objects first; the rows cascade anyway
    await this.db.delete(member).where(and(eq(member.userId, userId), eq(member.organizationId, orgId)));
    await this.db.update(session).set({ activeOrganizationId: null }).where(and(eq(session.userId, userId), eq(session.activeOrganizationId, orgId)));
    await erasePosthogPerson(userId); // One PostHog person per user, so leaving one tenant erases its analytics in the others too
    return "organization" as const;
  }

  // Account, sessions and passkeys are the person's own identity; consents, notices, plan (and its versions), documents and bookings are this tenant's records only.
  async export(id: string, orgId: string) {
    const db = this.db;
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
      db.select({ adviserId: booking.adviserId, share: booking.share, status: booking.status, startsAt: booking.startsAt, createdAt: booking.createdAt, cancelledAt: booking.cancelledAt })
        .from(booking).where(and(eq(booking.userId, id), eq(booking.organizationId, orgId))),
    ]);
    return { exportedAt: new Date(), account, organization: tenant, consents, notices, plan: plan ?? null, planVersions, documents, bookings, sessions, passkeys };
  }

  /** Current state: the latest event per kind, and the latest notice acknowledged. */
  async consents(userId: string, orgId: string) {
    const latest = await this.db.selectDistinctOn([consentEvent.kind], { kind: consentEvent.kind, granted: consentEvent.granted, version: consentEvent.version, at: consentEvent.at })
      .from(consentEvent).where(consentsOf(userId, orgId)).orderBy(consentEvent.kind, desc(consentEvent.id));
    const [notice] = await this.db.select({ version: noticeAck.version, at: noticeAck.at }).from(noticeAck)
      .where(noticesOf(userId, orgId)).orderBy(desc(noticeAck.at)).limit(1);
    return { consents: Object.fromEntries(latest.map(({ kind, ...rest }) => [kind, rest])), notice: notice ?? null };
  }

  /** Append-only: a withdrawal is a `granted: false` event; nothing is updated or removed. Returns the new state. */
  async recordConsents(userId: string, organizationId: string, { notice, marketing, analytics }: { notice?: string; marketing?: { granted: boolean; version: string }; analytics?: { granted: boolean; version: string } }) {
    if (notice) await this.db.insert(noticeAck).values({ userId, organizationId, version: notice }).onConflictDoNothing(); // first acknowledgement of a version is the one kept
    if (marketing) await this.db.insert(consentEvent).values({ userId, organizationId, kind: "marketing", ...marketing });
    if (analytics) await this.db.insert(consentEvent).values({ userId, organizationId, kind: "analytics", ...analytics });
    return this.consents(userId, organizationId);
  }
}
