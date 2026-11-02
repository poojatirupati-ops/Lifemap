import { expect, test } from "vitest";
import { connect } from "../db";
import { session, user, verification } from "../db/schema";
import { purge } from "./purge";

test("purge deletes expired verification rows and sessions, keeps live ones", async () => {
  const db = await connect();
  const past = new Date(Date.now() - 60_000);
  const future = new Date(Date.now() + 60_000);
  await db.insert(user).values({ id: "u1", name: "A", email: "a@example.com" });
  await db.insert(verification).values([
    { id: "v-old", identifier: "otp:a", value: "123456", expiresAt: past },
    { id: "v-live", identifier: "otp:b", value: "654321", expiresAt: future },
  ]);
  await db.insert(session).values([
    { id: "s-old", token: "t1", userId: "u1", expiresAt: past },
    { id: "s-live", token: "t2", userId: "u1", expiresAt: future },
  ]);

  expect(await purge(db)).toEqual({ verification: 1, session: 1 });
  expect((await db.select().from(verification)).map((r) => r.id)).toEqual(["v-live"]);
  expect((await db.select().from(session)).map((r) => r.id)).toEqual(["s-live"]);
  expect(await purge(db)).toEqual({ verification: 0, session: 0 });
});
