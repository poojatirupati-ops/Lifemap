import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from ".";
import { schema } from ".";

/** In-process Postgres (in memory, or persisted when dir is given), migrated with the same drizzle/ files production uses. Dev and tests only. */
export const pgliteDb = async (dir?: string): Promise<Db> => {
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: new URL("../../drizzle", import.meta.url).pathname });
  return db as unknown as Db;
};
