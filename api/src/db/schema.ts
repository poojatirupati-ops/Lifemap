import { bigint, boolean, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { Plan } from "../../../app/src/state/types";

const stamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
};

// Tables/columns follow Better Auth's core schema (+ passkey plugin).
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...stamps,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  ...stamps,
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  ...stamps,
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...stamps,
});

export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_id").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  aaguid: text("aaguid"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Append-only: one row per grant or withdrawal. Current state = latest row per kind. `version` = wording shown.
export const consentEvent = pgTable(
  "consent_event",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // e.g. "marketing"
    granted: boolean("granted").notNull(),
    version: text("version").notNull(),
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [index("consent_event_user_kind_idx").on(t.userId, t.kind, t.id)],
);

// Privacy notice / terms acknowledgement (contract basis, not consent): first time each version was acknowledged.
export const noticeAck = pgTable(
  "notice_ack",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.version] })],
);

// Erased accounts, no PII: sha256(lower(email)) and when. Re-applied after a backup restore (README).
export const erasedUser = pgTable("erased_user", {
  emailHash: text("email_hash").primaryKey(),
  erasedAt: timestamp("erased_at").notNull().defaultNow(),
});

// Better Auth's database rate-limit store (shared by all Lambda instances).
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

// Per-email OTP send counter (fixed window), keyed by sha256(lower(email)).
export const otpEmailLimit = pgTable("otp_email_limit", {
  emailHash: text("email_hash").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start").notNull(),
});

// One plan per user, keyed by the session userId. `version` is the optimistic-lock counter.
export const planRow = pgTable("plan", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  data: jsonb("data").$type<Plan>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
