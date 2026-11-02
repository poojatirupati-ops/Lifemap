ALTER TABLE "document" ADD COLUMN "read_status" text;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "read_fields" jsonb;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "read_provider" text;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "read_at" timestamp;