-- Carry old one-row-per-grant consents over before dropping the table (version unknown: "legacy").
INSERT INTO "consent_event" ("user_id", "kind", "granted", "version", "at") SELECT "user_id", "kind", true, 'legacy', "granted_at" FROM "consent" WHERE "kind" = 'marketing';--> statement-breakpoint
INSERT INTO "notice_ack" ("user_id", "version", "at") SELECT "user_id", 'legacy', "granted_at" FROM "consent" WHERE "kind" = 'terms' ON CONFLICT DO NOTHING;--> statement-breakpoint
DROP TABLE "consent" CASCADE;