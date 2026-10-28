import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export { schema };
export type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Production: Postgres on DATABASE_URL (Lambda env, from an SST Secret); fails closed without it, never PGlite.
 * Anywhere else (tests, local dev): PGlite, in memory or persisted in `dir`.
 * max:1 = one connection per Lambda instance; put RDS Proxy or a pooled serverless Postgres in front (README).
 */
export const connect = async (dir?: string): Promise<Db> => {
  if (process.env.NODE_ENV !== "production") return (await import("./devSetup")).pgliteDb(dir);
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required in production");
  return drizzle({ client: new Pool({ connectionString: url, max: 1 }), schema });
};
