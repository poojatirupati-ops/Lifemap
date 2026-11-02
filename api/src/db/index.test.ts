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

test("migration 0003 backfills existing users and their records into LifeMap Direct", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { cpSync, mkdtempSync, readFileSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { sql } = await import("drizzle-orm");
  const all = new URL("../../drizzle", import.meta.url).pathname;
  const before = join(mkdtempSync(join(tmpdir(), "mig-")), "drizzle"); // the folder as it was before tenancy
  cpSync(all, before, { recursive: true });
  const journal = JSON.parse(readFileSync(join(before, "meta/_journal.json"), "utf8"));
  writeFileSync(join(before, "meta/_journal.json"), JSON.stringify({ ...journal, entries: journal.entries.slice(0, 3) }));

  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: before });
  await db.execute(sql`insert into "user" (id, name, email) values ('u1', 'A', 'a@example.com')`);
  await db.execute(sql`insert into plan (user_id, version, data) values ('u1', 3, '{"whyNote":"kept"}')`);
  await db.execute(sql`insert into consent_event (user_id, kind, granted, version) values ('u1', 'marketing', true, 'm1')`);
  await db.execute(sql`insert into notice_ack (user_id, version) values ('u1', 'n1')`);
  await db.execute(sql`insert into session (id, expires_at, token, user_id) values ('s1', now() + interval '1 day', 't', 'u1')`);
  await migrate(db, { migrationsFolder: all });

  const one = async (q: ReturnType<typeof sql>) => (await db.execute(q)).rows;
  expect(await one(sql`select organization_id, role from member where user_id = 'u1'`)).toEqual([{ organization_id: "lifemap-direct", role: "customer" }]);
  expect(await one(sql`select organization_id, version from plan`)).toEqual([{ organization_id: "lifemap-direct", version: 3 }]);
  expect(await one(sql`select organization_id from consent_event`)).toEqual([{ organization_id: "lifemap-direct" }]);
  expect(await one(sql`select organization_id from notice_ack`)).toEqual([{ organization_id: "lifemap-direct" }]);
  expect(await one(sql`select active_organization_id from session`)).toEqual([{ active_organization_id: "lifemap-direct" }]);
});
