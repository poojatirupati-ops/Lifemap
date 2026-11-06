import { sql } from "drizzle-orm";
import { type AnyPgColumn, bigint, boolean, check, foreignKey, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

const stamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
};

// Tables/columns follow Better Auth's core schema (+ passkey, admin, organization and sso plugins).
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // admin plugin: role "admin" = LifeMap platform staff
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  // additionalFields (src/auth.ts), set by the adviser through updateUser: their Cal.com booking link and what their card shows
  calLink: text("cal_link"),
  adviserProfile: jsonb("adviser_profile").$type<{ qualifications: string; languages: string; location: string; meetingMode: string }>(),
  ...stamps,
});

// A tenant (organization plugin, its own columns only). Tenant config (colours, rates) is JSON in `metadata`, shaped by src/tenant.ts.
export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("customer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  // Tenant-owned rows reference this pair, so erasing a membership (or the user) cascades to that tenant's data.
  (t) => [unique("member_org_user_unique").on(t.organizationId, t.userId), index("member_user_idx").on(t.userId)],
);

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  inviterId: text("inviter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

// sso plugin: one identity provider per tenant (OIDC or SAML config stored as JSON text by the plugin).
export const ssoProvider = pgTable("sso_provider", {
  id: text("id").primaryKey(),
  issuer: text("issuer").notNull(),
  oidcConfig: text("oidc_config"),
  samlConfig: text("saml_config"),
  // who registered it; kept null on their erasure so the tenant's sign-in keeps working
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  providerId: text("provider_id").notNull().unique(),
  organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  domainVerified: boolean("domain_verified"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id").references(() => organization.id, { onDelete: "set null" }),
  impersonatedBy: text("impersonated_by"),
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

/** Tenant-owned rows hang off (organization_id, user_id) in `member`: no row without a membership; erasing the membership or the user cascades. */
const ownedBy = (t: { organizationId: AnyPgColumn; userId: AnyPgColumn }) =>
  foreignKey({ columns: [t.organizationId, t.userId], foreignColumns: [member.organizationId, member.userId] }).onDelete("cascade");
const owner = { organizationId: text("organization_id").notNull(), userId: text("user_id").notNull() };

// Append-only: one row per grant or withdrawal. Current state = latest row per kind. `version` = wording shown.
export const consentEvent = pgTable(
  "consent_event",
  {
    id: serial("id").primaryKey(),
    ...owner,
    kind: text("kind").notNull(), // e.g. "marketing"
    granted: boolean("granted").notNull(),
    version: text("version").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(), // what exactly the consent covers, e.g. adviser_share: { bookingId, adviserId, items }
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [ownedBy(t), index("consent_event_user_kind_idx").on(t.userId, t.organizationId, t.kind, t.id)],
);

// Privacy notice / terms acknowledgement (contract basis, not consent): first time each version was acknowledged, per tenant (each tenant has its own notice).
export const noticeAck = pgTable(
  "notice_ack",
  {
    ...owner,
    version: text("version").notNull(),
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [ownedBy(t), primaryKey({ columns: [t.userId, t.organizationId, t.version] })],
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

// One plan per user per tenant, keyed by the session's userId and active organization. `version` is the optimistic-lock counter.
export const planRow = pgTable(
  "plan",
  {
    ...owner,
    version: integer("version").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(), // the app owns the plan shape; the API stores it as-is
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [ownedBy(t), primaryKey({ columns: [t.userId, t.organizationId] })],
);

// Saved copies of the plan at the app's meaningful points (goals changed, plan confirmed), for history and restore. Capped per user per tenant (routes/plan.ts).
export const planVersion = pgTable(
  "plan_version",
  {
    id: serial("id").primaryKey(),
    ...owner,
    note: text("note").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [ownedBy(t), index("plan_version_owner_idx").on(t.userId, t.organizationId, t.id)],
);

// Uploaded statements and documents. The file lives in the private bucket at `key` (`<org>/<user>/<id>`); this row is the index used for listing, reads and erasure.
export const document = pgTable(
  "document",
  {
    id: text("id").primaryKey(),
    ...owner,
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // The last read (POST /api/documents/:id/read): done | failed, the figures under LifeMap keys, which reader, when.
    readStatus: text("read_status"),
    readFields: jsonb("read_fields").$type<{ key: string; value: number | string; confidence: number }[]>(),
    readProvider: text("read_provider"),
    readAt: timestamp("read_at"),
  },
  (t) => [ownedBy(t), index("document_owner_idx").on(t.userId, t.organizationId)],
);

/** pending until Cal.com's webhook books it; then cancelled, ended or no_show (CalService). */
const BOOKING_STATUSES = ["pending", "booked", "cancelled", "ended", "no_show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Adviser meetings, booked through Cal.com. `adviserId` = the adviser's user id (a member with role adviser). `share` = what the customer agreed to share;
// the consent itself is a consent_event (kind adviser_share). Created pending before the Cal.com embed opens; Cal.com's webhooks set the rest.
export const booking = pgTable(
  "booking",
  {
    id: text("id").primaryKey(),
    ...owner,
    adviserId: text("adviser_id").notNull(),
    share: jsonb("share").$type<Record<string, boolean>>().notNull(),
    status: text("status").$type<BookingStatus>().notNull().default("pending"),
    calUid: text("cal_uid"), // the Cal.com booking (a reschedule gives it a new uid)
    startsAt: timestamp("starts_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at"),
  },
  (t) => [
    ownedBy(t),
    index("booking_owner_idx").on(t.userId, t.organizationId),
    index("booking_cal_uid_idx").on(t.calUid),
    check("booking_status_check", sql.raw(`status in (${BOOKING_STATUSES.map((st) => `'${st}'`).join(", ")})`)),
  ],
);

// Cal.com webhook deliveries, one row per (cal uid, trigger): a retried delivery never adds a second row, and republishes only when `status` is set. Billing reads the published events, not this table.
export const bookingEvent = pgTable(
  "booking_event",
  {
    id: serial("id").primaryKey(),
    bookingId: text("booking_id").notNull().references(() => booking.id, { onDelete: "cascade" }),
    calUid: text("cal_uid").notNull(),
    trigger: text("trigger").notNull(), // BOOKING_NO_SHOW_UPDATED carries its flag and createdAt (":true:<createdAt>"), so each mark and unmark is its own delivery
    status: text("status").$type<BookingStatus>(), // the status this delivery set; null when the transition was rejected (nothing published)
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [unique("booking_event_cal_uid_trigger_unique").on(t.calUid, t.trigger), index("booking_event_booking_idx").on(t.bookingId)],
);
