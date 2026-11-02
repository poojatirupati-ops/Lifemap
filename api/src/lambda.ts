import { Resource } from "sst";
import type { Context } from "aws-lambda";
import { handle } from "hono/aws-lambda";

// Resource is typed by `sst install`; cast so tsc passes without it.
const r = Resource as unknown as Record<string, { value: string }>;
// SST links secrets as Resource.*; auth and db read env. Bridge before app.ts loads.
process.env.NODE_ENV ??= "production";
process.env.DATABASE_URL = r.DatabaseUrl.value;
process.env.BETTER_AUTH_SECRET = r.BetterAuthSecret.value;
process.env.DOCUMENTS_BUCKET = (Resource as unknown as Record<string, { name: string }>).Documents.name;
// SES identity (sst.aws.Email): a domain or an address; codes go from noreply@<domain> for a domain.
const sender = (Resource as unknown as Record<string, { sender: string }>).Email.sender;
process.env.OTP_FROM = sender.includes("@") ? sender : `noreply@${sender}`;
process.env.OTP_SENDER = "ses";
// Feature flags (src/tenant.ts): PostHog EU, local evaluation with the personal API key.
process.env.POSTHOG_API_KEY = r.PosthogProjectKey.value;
process.env.POSTHOG_PERSONAL_API_KEY = r.PosthogPersonalApiKey.value;
process.env.POSTHOG_HOST = "https://eu.i.posthog.com";
// Document reader (src/documents/reader.ts): the provider over HTTP; production never uses the example reader.
process.env.DOC_READER = "http";
process.env.DOC_READER_URL = r.DocReaderUrl.value;
process.env.DOC_READER_API_KEY = r.DocReaderApiKey.value;
// Booking events (src/events/bus.ts): the EventBridge bus; Cal.com webhook secrets per tenant (JSON { "<organization id>": "<secret>" }, docs/runbook.md).
process.env.EVENT_BUS = "eventbridge";
process.env.EVENT_BUS_NAME = (Resource as unknown as Record<string, { name: string }>).Bookings.name;
process.env.CAL_WEBHOOK_SECRETS = r.CalWebhookSecrets.value;

const { app } = await import("./app");
const { logger, metrics, tracer } = await import("./observe");
const hono = handle(app);

// Powertools without middy: Lambda context on every log line, cold-start annotation/metric, metrics flushed per invocation.
export const handler = async (event: Parameters<typeof hono>[0], context: Context) => {
  logger.addContext(context);
  tracer.annotateColdStart();
  metrics.captureColdStartMetric();
  try {
    return await hono(event, context);
  } finally {
    metrics.publishStoredMetrics();
  }
};
