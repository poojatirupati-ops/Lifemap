import { serve } from "@hono/node-server";

// Dev defaults, set before auth is created. Never read in production paths (lambda.ts sets its own env).
process.env.BETTER_AUTH_URL ??= "http://localhost:5173";
process.env.BETTER_AUTH_SECRET ??= "dev-only-secret-dev-only-secret-0123456789";
process.env.BETTER_AUTH_TRUSTED_ORIGINS ??= "http://localhost:5173";

const { buildApp } = await import("./app");
const { logOtp } = await import("./auth");
const { connect } = await import("./db");

const app = buildApp(await connect(new URL("../.dev-db", import.meta.url).pathname), logOtp);
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`api on http://localhost:${port}`);
