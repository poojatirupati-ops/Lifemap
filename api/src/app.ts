import { S3Client } from "@aws-sdk/client-s3";
import { SESv2Client } from "@aws-sdk/client-sesv2";
import { Hono } from "hono";
import { type SendOtp, createAuth, logOtp, mountAuth, sesOtp } from "./auth";
import { type Db, connect } from "./db";
import { type Files, devFiles, s3Files } from "./files";
import { type Env, guard } from "./guard";
import { documentRoutes } from "./routes/documents";
import { expertRoutes } from "./routes/experts";
import { meRoutes } from "./routes/me";
import { planRoutes } from "./routes/plan";
import { tenantRoutes } from "./tenant";

const prod = process.env.NODE_ENV === "production";
const required = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required in production`);
  return v;
};

// Production sends through SES only when OTP_SENDER=ses (set by lambda.ts), never chosen by NODE_ENV alone; anything else fails closed so codes never reach CloudWatch.
const sendOtp: SendOtp = !prod
  ? logOtp
  : process.env.OTP_SENDER === "ses"
    ? sesOtp(new SESv2Client({ region: "eu-west-1" }), required("OTP_FROM"))
    : () => {
        throw new Error("OTP sender not configured: set OTP_SENDER=ses and OTP_FROM");
      };

// Documents: the private S3 bucket in production; a local folder (api/.dev-files) otherwise, so uploads work without AWS.
const files: Files = prod
  ? s3Files(new S3Client({ region: "eu-west-1" }), required("DOCUMENTS_BUCKET"))
  : devFiles(new URL("../.dev-files", import.meta.url).pathname);

export const buildApp = (db: Db, send: SendOtp, store: Files = files) => {
  const app = new Hono<Env>();
  const auth = createAuth(db, send, store);

  // Registered first so every route, including unknown paths, is denied without a session.
  app.use("*", guard(auth));

  app.get("/health", (c) => c.json({ ok: true }));

  // mountAuth takes a plain Hono; mount it as a sub-app so the guard above still runs first.
  const authRoutes = new Hono();
  mountAuth(authRoutes, auth);
  app.route("/", authRoutes);
  app.route("/api", planRoutes(db));
  app.route("/api", meRoutes(db, auth, store));
  app.route("/api", documentRoutes(db, store));
  app.route("/api", expertRoutes(db));
  app.route("/api", tenantRoutes(db));
  return app;
};

export const app = buildApp(await connect(), sendOtp);
