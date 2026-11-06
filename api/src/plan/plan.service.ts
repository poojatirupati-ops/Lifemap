import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, notInArray } from "drizzle-orm";
import { DB, type Db } from "../db";
import { planRow, planVersion } from "../db/schema";

const KEPT_VERSIONS = 50; // per user per tenant; older ones are dropped

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
const mine = (userId: string, orgId: string) => and(eq(planRow.userId, userId), eq(planRow.organizationId, orgId));
const myVersions = (userId: string, orgId: string) => and(eq(planVersion.userId, userId), eq(planVersion.organizationId, orgId));

/** One plan per user per tenant, saved compare-and-set on `version`, with up to KEPT_VERSIONS noted versions. A stale write returns `{ stale }`, the current version. */
@Injectable()
export class PlanService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async get(userId: string, orgId: string) {
    const [row] = await this.db.select().from(planRow).where(mine(userId, orgId));
    return { version: row?.version ?? 0, plan: row?.data ?? null };
  }

  /** `plan` is the prototype's opaque state object; `snapshot` also keeps it as a version with that note. */
  async save(userId: string, orgId: string, version: number, plan: never, snapshot?: string) {
    const next = version + 1;
    // Compare-and-set in one statement: insert only if no row (version 0), else update only if the stored version still matches. The snapshot commits with it.
    const row = await this.db.transaction(async (tx) => {
      const [saved] =
        version === 0
          ? await tx.insert(planRow).values({ userId, organizationId: orgId, version: next, data: plan }).onConflictDoNothing().returning({ version: planRow.version })
          : await tx.update(planRow).set({ version: next, data: plan, updatedAt: new Date() })
              .where(and(mine(userId, orgId), eq(planRow.version, version))).returning({ version: planRow.version });
      if (saved && snapshot) await this.keep(tx, userId, orgId, snapshot, plan);
      return saved;
    });
    return row ? { version: row.version } : this.stale(userId, orgId);
  }

  versions = (userId: string, orgId: string) =>
    this.db.select({ id: planVersion.id, note: planVersion.note, at: planVersion.at }).from(planVersion).where(myVersions(userId, orgId)).orderBy(desc(planVersion.id));

  /** undefined when the version is not the caller's. The plan it replaces is kept as a version first. */
  async restore(userId: string, orgId: string, id: number, version: number) {
    const [snap] = await this.db.select({ note: planVersion.note, data: planVersion.data }).from(planVersion).where(and(myVersions(userId, orgId), eq(planVersion.id, id)));
    if (!snap) return undefined;
    const row = await this.db.transaction(async (tx) => {
      const [cur] = await tx.select({ data: planRow.data }).from(planRow).where(and(mine(userId, orgId), eq(planRow.version, version)));
      if (!cur) return undefined;
      const [saved] = await tx.update(planRow).set({ version: version + 1, data: snap.data as never, updatedAt: new Date() })
        .where(and(mine(userId, orgId), eq(planRow.version, version))).returning({ version: planRow.version });
      if (saved) await this.keep(tx, userId, orgId, `Before restoring "${snap.note}"`, cur.data as never); // nothing is lost by a restore
      return saved;
    });
    return row ? { version: row.version, plan: snap.data } : this.stale(userId, orgId);
  }

  private async stale(userId: string, orgId: string) {
    const [cur] = await this.db.select({ version: planRow.version }).from(planRow).where(mine(userId, orgId));
    return { stale: cur?.version ?? 0 };
  }

  private async keep(tx: Tx, userId: string, orgId: string, note: string, data: never) {
    await tx.insert(planVersion).values({ userId, organizationId: orgId, note, data });
    const newest = tx.select({ id: planVersion.id }).from(planVersion).where(myVersions(userId, orgId)).orderBy(desc(planVersion.id)).limit(KEPT_VERSIONS);
    await tx.delete(planVersion).where(and(myVersions(userId, orgId), notInArray(planVersion.id, newest)));
  }
}
