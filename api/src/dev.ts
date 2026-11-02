import { serve } from "@hono/node-server";

// Dev defaults, set before auth is created. Never read in production paths (lambda.ts sets its own env).
process.env.BETTER_AUTH_URL ??= "http://localhost:5173";
process.env.BETTER_AUTH_SECRET ??= "dev-only-secret-dev-only-secret-0123456789";
process.env.BETTER_AUTH_TRUSTED_ORIGINS ??= "http://localhost:5173";

const { buildApp } = await import("./app");
const { logOtp } = await import("./auth");
const { connect, schema } = await import("./db");

const db = await connect(new URL("../.dev-db", import.meta.url).pathname);
if (process.env.DATABASE_URL) {
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  await migrate(db, { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
}
// The prototype's three sample advisers in LifeMap Direct, so the Experts tab can book locally. DEV_CAL_LINK: one of your own Cal.com events (e.g. you/15min).
const { member, user } = schema;
const calLink = process.env.DEV_CAL_LINK ?? "lifemap-dev/30min";
const advisers = [
  ["Niamh Byrne", "QFA, CFP®", "English, Irish", "Dublin 2", "Video or in person"],
  ["Ciarán Walsh", "QFA, APA", "English", "Cork", "Video"],
  ["Aisling Murphy", "CFP®, QFA", "English, Polish", "Galway", "Video or in person"],
];
for (const [i, [name, qualifications, languages, location, meetingMode]] of advisers.entries()) {
  const id = `dev-adviser-${i}`;
  await db.insert(user).values({ id, name, email: `${id}@lifemap.localhost`, emailVerified: true, calLink, adviserProfile: { qualifications, languages, location, meetingMode } })
    .onConflictDoUpdate({ target: user.id, set: { calLink } });
  await db.insert(member).values({ id: `m-${id}`, organizationId: "lifemap-direct", userId: id, role: "adviser" }).onConflictDoNothing();
}

const app = await buildApp(db, logOtp);
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`api on http://localhost:${port}`);
