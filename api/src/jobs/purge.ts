import { lt } from "drizzle-orm";
import { Resource } from "sst";
import { connect, type Db } from "../db";
import { session, verification } from "../db/schema";

/** Retention (README): OTP/verification rows and sessions are deleted once expired. */
export const purge = async (db: Db, now = new Date()) => {
  const v = await db.delete(verification).where(lt(verification.expiresAt, now)).returning({ id: verification.id });
  const s = await db.delete(session).where(lt(session.expiresAt, now)).returning({ id: session.id });
  return { verification: v.length, session: s.length };
};

// Daily sst.aws.Cron entry point. Same env bridge as lambda.ts.
export const handler = async () => {
  process.env.NODE_ENV ??= "production";
  process.env.DATABASE_URL = (Resource as unknown as Record<string, { value: string }>).DatabaseUrl.value;
  console.log("purged", await purge(await connect())); // counts only, no PII
};
