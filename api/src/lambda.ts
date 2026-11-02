import { Resource } from "sst";
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

const { app } = await import("./app");
export const handler = handle(app);
