CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_org_user_unique" UNIQUE("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sso_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"issuer" text NOT NULL,
	"oidc_config" text,
	"saml_config" text,
	"user_id" text,
	"provider_id" text NOT NULL,
	"organization_id" text,
	"domain" text NOT NULL,
	"domain_verified" boolean,
	CONSTRAINT "sso_provider_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
ALTER TABLE "consent_event" DROP CONSTRAINT "consent_event_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notice_ack" DROP CONSTRAINT "notice_ack_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "plan" DROP CONSTRAINT "plan_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "consent_event_user_kind_idx";--> statement-breakpoint
ALTER TABLE "notice_ack" DROP CONSTRAINT "notice_ack_user_id_version_pk";--> statement-breakpoint
ALTER TABLE "plan" DROP CONSTRAINT "plan_pkey";--> statement-breakpoint
-- Hand-edited (drizzle-kit adds NOT NULL columns in one step): add nullable, backfill into LifeMap Direct, then NOT NULL and keys.
INSERT INTO "organization" ("id", "name", "slug") VALUES ('lifemap-direct', 'LifeMap', 'lifemap-direct');--> statement-breakpoint
INSERT INTO "member" ("id", "organization_id", "user_id", "role") SELECT 'm-' || "id", 'lifemap-direct', "id", 'customer' FROM "user";--> statement-breakpoint
ALTER TABLE "consent_event" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "notice_ack" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "organization_id" text;--> statement-breakpoint
UPDATE "consent_event" SET "organization_id" = 'lifemap-direct';--> statement-breakpoint
UPDATE "notice_ack" SET "organization_id" = 'lifemap-direct';--> statement-breakpoint
UPDATE "plan" SET "organization_id" = 'lifemap-direct';--> statement-breakpoint
ALTER TABLE "consent_event" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notice_ack" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notice_ack" ADD CONSTRAINT "notice_ack_user_id_organization_id_version_pk" PRIMARY KEY("user_id","organization_id","version");--> statement-breakpoint
ALTER TABLE "plan" ADD CONSTRAINT "plan_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id");--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
UPDATE "session" SET "active_organization_id" = 'lifemap-direct';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_user_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_host_unique" ON "organization" USING btree ((("metadata")::jsonb->>'host'));--> statement-breakpoint
ALTER TABLE "consent_event" ADD CONSTRAINT "consent_event_organization_id_user_id_member_organization_id_user_id_fk" FOREIGN KEY ("organization_id","user_id") REFERENCES "public"."member"("organization_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_ack" ADD CONSTRAINT "notice_ack_organization_id_user_id_member_organization_id_user_id_fk" FOREIGN KEY ("organization_id","user_id") REFERENCES "public"."member"("organization_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan" ADD CONSTRAINT "plan_organization_id_user_id_member_organization_id_user_id_fk" FOREIGN KEY ("organization_id","user_id") REFERENCES "public"."member"("organization_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consent_event_user_kind_idx" ON "consent_event" USING btree ("user_id","organization_id","kind","id");