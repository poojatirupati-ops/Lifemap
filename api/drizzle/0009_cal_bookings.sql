CREATE TABLE "booking_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"cal_uid" text NOT NULL,
	"trigger" text NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "booking_event_cal_uid_trigger_unique" UNIQUE("cal_uid","trigger")
);
--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "cal_uid" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "starts_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "cal_link" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "adviser_profile" jsonb;--> statement-breakpoint
ALTER TABLE "booking_event" ADD CONSTRAINT "booking_event_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_event_booking_idx" ON "booking_event" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_cal_uid_idx" ON "booking" USING btree ("cal_uid");