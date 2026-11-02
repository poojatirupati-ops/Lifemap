CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"adviser_id" text NOT NULL,
	"slot" text NOT NULL,
	"mode" text NOT NULL,
	"share" jsonb NOT NULL,
	"status" text DEFAULT 'booked' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"cancelled_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "consent_event" ADD COLUMN "detail" jsonb;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_organization_id_user_id_member_organization_id_user_id_fk" FOREIGN KEY ("organization_id","user_id") REFERENCES "public"."member"("organization_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_owner_idx" ON "booking" USING btree ("user_id","organization_id");