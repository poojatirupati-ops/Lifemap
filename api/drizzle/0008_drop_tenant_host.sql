DROP INDEX "organization_host_unique";--> statement-breakpoint
UPDATE "organization" SET "metadata" = (("metadata")::jsonb - 'host')::text WHERE ("metadata")::jsonb ? 'host';
