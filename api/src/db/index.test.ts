import { Pool } from "pg";
import { afterEach, expect, test, vi } from "vitest";
import { connect } from ".";

afterEach(() => vi.unstubAllEnvs());

test("PGlite outside production, migrated and usable", async () => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DATABASE_URL", "postgres://must-not-be-used");
  const db = await connect();
  expect(db.$client).not.toBeInstanceOf(Pool);
  expect(await db.select().from((await import("./schema")).planRow)).toEqual([]);
});

test("production: throws without DATABASE_URL, never falls back to PGlite", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DATABASE_URL", "");
  await expect(connect()).rejects.toThrow(/DATABASE_URL/);
});

test("production: pg Pool on DATABASE_URL, one connection", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DATABASE_URL", "postgres://u:p@localhost:1/x");
  const pool = (await connect()).$client as Pool; // lazy: no connection is opened here
  expect(pool).toBeInstanceOf(Pool);
  expect(pool.options).toMatchObject({ connectionString: "postgres://u:p@localhost:1/x", max: 1 });
  await pool.end();
});
