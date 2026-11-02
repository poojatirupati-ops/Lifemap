import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export { schema };
export type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Production: Postgres on DATABASE_URL (Lambda env, from an SST Secret); fails closed without it, never PGlite.
 * Tests: always PGlite. Local dev: the Podman Postgres when DATABASE_URL is set (compose.yaml), else PGlite in `dir`.
 * max:1 = one connection per Lambda instance; put RDS Proxy or a pooled serverless Postgres in front (README).
 */
export const connect = async (dir?: string): Promise<Db> => {
  const url = process.env.DATABASE_URL;
  const production = process.env.NODE_ENV === "production";
  if (production && !url) throw new Error("DATABASE_URL is required in production");
  if (process.env.NODE_ENV === "test" || !url) return (await import("./devSetup")).pgliteDb(dir);
  return drizzle({ client: new Pool({ connectionString: url, max: production ? 1 : 5 }), schema });
};
