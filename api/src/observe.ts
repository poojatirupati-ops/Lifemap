import { Logger } from "@aws-lambda-powertools/logger";
import { MetricUnit, Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";
import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

// Powertools: JSON logs, X-Ray (only active inside Lambda), CloudWatch EMF metrics (flushed per invocation in lambda.ts).
// PII rule: log ids, codes and paths only, never a request body, an email or a driver error message (Drizzle's carries query params).
export const logger = new Logger({ serviceName: "api" });
export const tracer = new Tracer({ serviceName: "api" });
export const metrics = new Metrics({ namespace: "LifeMap", serviceName: "api" });
export const count = (name: string) => metrics.addMetric(name, MetricUnit.Count, 1);

/** Postgres SQLSTATE of a pg or Drizzle-wrapped error. */
const pgCode = (e: unknown) => {
  const c = (e as { cause?: { code?: unknown }; code?: unknown }).cause?.code ?? (e as { code?: unknown }).code;
  return typeof c === "string" && /^[0-9A-Z]{5}$/.test(c) ? c : undefined;
};

/** The one error handler: RFC 9457 problem+json, no message, stack or SQL. Postgres class 22 (data exception, e.g. U+0000 in jsonb) is the client's data: 400. */
export const problem: ErrorHandler = (e, c) => {
  const code = pgCode(e);
  const status: ContentfulStatusCode = e instanceof HTTPException ? (e.status as ContentfulStatusCode) : code?.startsWith("22") ? 400 : 500;
  if (status >= 500) {
    count("errors");
    logger.error("request failed", { requestId: c.get("requestId"), error: e.name, code });
  }
  const title = status === 400 ? "Bad Request" : status >= 500 && !(e instanceof HTTPException) ? "Internal Server Error" : e.message || "Error";
  return c.body(JSON.stringify({ type: "about:blank", title, status }), status, { "content-type": "application/problem+json" });
};
