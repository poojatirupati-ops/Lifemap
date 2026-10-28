CREATE TABLE "consent_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"granted" boolean NOT NULL,
	"version" text NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erased_user" (
	"email_hash" text PRIMARY KEY NOT NULL,
	"erased_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice_ack" (
	"user_id" text NOT NULL,
	"version" text NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notice_ack_user_id_version_pk" PRIMARY KEY("user_id","version")
);
--> statement-breakpoint
CREATE TABLE "otp_email_limit" (
	"email_hash" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_start" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "consent_event" ADD CONSTRAINT "consent_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_ack" ADD CONSTRAINT "notice_ack_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consent_event_user_kind_idx" ON "consent_event" USING btree ("user_id","kind","id");