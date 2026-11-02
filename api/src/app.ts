import { S3Client } from "@aws-sdk/client-s3";
import { SESv2Client } from "@aws-sdk/client-sesv2";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { type SendOtp, createAuth, logOtp, mountAuth, sesOtp } from "./auth";
import { type Db, connect } from "./db";
import { type Files, devFiles, s3Files } from "./files";
import { type Env, guard } from "./guard";
import { documentRoutes } from "./routes/documents";
import { expertRoutes } from "./routes/experts";
import { meRoutes } from "./routes/me";
import { planRoutes } from "./routes/plan";
import { docPublic, mountDocs } from "./openapi";
import { count, logger, problem, tracer } from "./observe";
import { platformAdmin, tenantForHost, tenantRoutes } from "./tenant";

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
    ? sesOtp(tracer.captureAWSv3Client(new SESv2Client({ region: "eu-west-1" })), required("OTP_FROM"))
    : () => {
        throw new Error("OTP sender not configured: set OTP_SENDER=ses and OTP_FROM");
      };

// Documents: the private S3 bucket in production; a local folder (api/.dev-files) otherwise, so uploads work without AWS.
const files: Files = prod
  ? s3Files(tracer.captureAWSv3Client(new S3Client({ region: "eu-west-1" })), required("DOCUMENTS_BUCKET"))
  : devFiles(new URL("../.dev-files", import.meta.url).pathname);

export const buildApp = (db: Db, send: SendOtp, store: Files = files) => {
  const app = new Hono<Env>();
  const auth = createAuth(db, send, store);

  // Cross-origin callers: the app, the CMS, auth's trusted origins, and any tenant's own https host.
  const known = new Set([process.env.BETTER_AUTH_URL, process.env.CMS_URL, ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "").split(",")].filter((u): u is string => !!u && URL.canParse(u)).map((u) => new URL(u).origin));
  const trusted = async (origin: string) =>
    known.has(origin) || (origin.startsWith("https://") && URL.canParse(origin) && !!(await tenantForHost(db, new URL(origin).hostname)));

  // Business metrics, counted on success.
  const counted: Record<string, string> = { "PUT /api/plan": "planSaves", "POST /api/documents": "uploads", "POST /api/bookings": "bookings" };

  app.onError(problem);
  app.use(
    "*",
    requestId(),
    secureHeaders(),
    cors({ origin: async (o) => ((await trusted(o)) ? o : null), credentials: true }),
    async (c, next) => {
      const start = Date.now();
      await next();
      const { method, path } = c.req;
      const ok = c.res.status < 400;
      const metric = method === "POST" && path.startsWith("/api/auth/sign-in/") ? "signIns" : counted[`${method} ${path}`];
      if (ok && metric) count(metric);
      // Ids only: no query string, body, email or IP.
      logger.info("request", { requestId: c.get("requestId"), method, path, status: c.res.status, ms: Date.now() - start, userId: c.var.userId, orgId: c.var.orgId });
    },
    timeout(15_000), // under the Lambda's 20 s
  );

  // Registered before every route (after the headers, CORS and logging above) so every route, including unknown paths, is denied without a session.
  app.use("*", guard(auth));
  app.use(
    "*",
    except("/api/dev-files/*", bodyLimit({ maxSize: 1024 * 1024 })), // dev-files has its own 10 MB limit
    // Better Auth checks origins on its own routes.
    except("/api/auth/*", csrf({ origin: (o, c) => o === new URL(c.req.url).origin || trusted(o) })),
  );

  // The docs list tenant and admin routes: in production only platform admins get them (the guard has already required a session).
  if (prod) app.use("/api/docs", platformAdmin(db)).use("/api/openapi.json", platformAdmin(db));

  app.get("/health", docPublic({ tags: ["health"], summary: "Liveness", responses: { 200: { description: "`{ ok: true }`" } } }), (c) => c.json({ ok: true }));

  // mountAuth takes a plain Hono; mount it as a sub-app so the guard above still runs first.
  const authRoutes = new Hono();
  mountAuth(authRoutes, auth);
  app.route("/", authRoutes);
  app.route("/api", planRoutes(db));
  app.route("/api", meRoutes(db, auth, store));
  app.route("/api", documentRoutes(db, store));
  app.route("/api", expertRoutes(db));
  app.route("/api", tenantRoutes(db));
  mountDocs(app, auth);
  return app;
};

export const app = buildApp(await connect(), sendOtp);
