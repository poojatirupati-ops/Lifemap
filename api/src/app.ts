import { Hono } from "hono";
import { type SendOtp, createAuth, logOtp, mountAuth } from "./auth";
import { type Db, connect } from "./db";
import { type Env, guard } from "./guard";
import { meRoutes } from "./routes/me";
import { planRoutes } from "./routes/plan";

// Fail closed in production until an SES sender exists, so OTP codes never reach CloudWatch.
const sendOtp: SendOtp =
  process.env.NODE_ENV === "production"
    ? () => {
        throw new Error("OTP sender not configured: pass an SES sender");
      }
    : logOtp;

export const buildApp = (db: Db, send: SendOtp) => {
  const app = new Hono<Env>();
  const auth = createAuth(db, send);

  // Registered first so every route, including unknown paths, is denied without a session.
  app.use("*", guard(auth));

  app.get("/health", (c) => c.json({ ok: true }));

  // mountAuth takes a plain Hono; mount it as a sub-app so the guard above still runs first.
  const authRoutes = new Hono();
  mountAuth(authRoutes, auth);
  app.route("/", authRoutes);
  app.route("/api", planRoutes(db));
  app.route("/api", meRoutes(db, auth));
  return app;
};

export const app = buildApp(await connect(), sendOtp);
