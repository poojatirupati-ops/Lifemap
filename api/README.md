# LifeMap API

Hono on AWS Lambda (function URL), eu-west-1 (GDPR data residency). Auth: Better Auth (email OTP + passkey, organization + admin + SSO plugins) on Postgres (see ../app/PLAN.md). Multi-tenancy: ../docs/tenancy.md.

## Database
`connect()` in `src/db/index.ts` picks the database:
- `NODE_ENV=production`: real Postgres via `pg` on `DATABASE_URL`, pool `max: 1`. Missing `DATABASE_URL` throws at cold start; it never falls back to PGlite.
- anything else (tests, `npm run dev`): PGlite in process (in memory for tests, persisted to `api/.dev-db` for dev).

Both are built from the same SQL migrations in `drizzle/`, generated from `src/db/schema.ts`.

## Run locally
    cd api && npm install
    npm run dev      # http://localhost:8787/health (PORT env overrides); OTP codes print to the console with the email masked
    npm test         # vitest, PGlite in memory
    npm run build    # tsc --noEmit

If `npm run dev` fails with "relation already exists", `.dev-db` predates migrations: delete it (`rm -rf .dev-db`, dev data only).

## Schema changes and migrations
    # edit src/db/schema.ts, then:
    npm run db:generate                          # writes drizzle/NNNN_*.sql; commit it
    DATABASE_URL="postgres://..." npm run migrate   # applies pending migrations to that Postgres

Tests and dev apply the migrations automatically. Run `migrate` against production before deploying code that needs the new schema.

## Deploy (SST, config in ../sst.config.ts)
Nothing is deployed by tests or dev. Resources (eu-west-1): a VPC (private subnets, EC2 NAT), RDS Postgres `Db` behind RDS Proxy, the `Api` function (URL) and the daily `Purge` cron, both in the VPC.

Database (G6): RDS Postgres, private (no public access), storage encrypted at rest (AWS-managed KMS key; snapshots inherit it), `rds.force_ssl=1`, automated backups with point-in-time restore kept **35 days**. `DATABASE_URL` is built by SST from the database (linked as `Resource.DatabaseUrl`, encrypted in the bundle) with `sslmode=verify-full`; `NODE_EXTRA_CA_CERTS=/var/runtime/ca-cert.pem` lets Node verify the RDS/Proxy certificate. No connection string is set by hand.

With AWS credentials for the target account:

    npx sst secret set BetterAuthSecret "$(openssl rand -base64 32)" --stage <stage>
    npx sst secret set BetterAuthUrl "https://<api-url>" --stage <stage>   # public https origin; first deploy: deploy, read `url`, set, redeploy
    npm run deploy -- --stage <stage>                                      # runs `sst deploy` from the repo root

Migrations: the database is private, so run `npm run migrate` from inside the VPC, e.g. `npx sst tunnel` (needs `bastion: true` on the Vpc) or `npx sst shell` from a host that can reach it, with `DATABASE_URL` from `Resource.DatabaseUrl`. Run it before deploying code that needs the new schema.

`src/lambda.ts` (and `src/jobs/purge.ts`) copy the linked values into `DATABASE_URL` / `BETTER_AUTH_SECRET` and set `NODE_ENV=production` before the app loads. RDS Proxy keeps Lambda bursts from exhausting Postgres; the pool stays at 1 connection per Lambda instance.

## Retention (G5)
Periods marked *DPO* are proposals to be confirmed by the DPO / legal before launch.

| Data | Kept | How |
|---|---|---|
| Account (`user`, `account`, `passkey`) and plan | Until the user erases it, or 24 months inactive (*DPO*) | Account deletion (G1); inactive-account purge not built yet |
| OTP / `verification` rows | Deleted once expired | Daily `Purge` cron (`src/jobs/purge.ts`) |
| `session` rows (IP, user agent) | Deleted once expired | Daily `Purge` cron |
| Consent events (`consent_event`, `notice_ack`) | Life of the account; proof beyond erasure for 6 years (*DPO*) | Today they cascade with `user` on erasure, so the +6 years needs a PII-free copy (API work) |
| CloudWatch logs (API, cron) | 30 days | `logging.retention` in sst.config.ts |
| Database backups / PITR | 35 days | RDS `backupRetentionPeriod` |

## Tenancy (../docs/tenancy.md)
- Every session has an active tenant (Better Auth organization): the host's tenant (`metadata.host`), else LifeMap Direct (`lifemap-direct`). Plan, consents and notices are per user per tenant.
- `GET /api/tenant` (public): branding, resolved feature flags and rates for the request host. `PATCH /api/admin/organizations/:id/config`: platform admins (`user.role = 'admin'`) only.
- First platform admin: `update "user" set role = 'admin' where email = '<staff email>';`

## Personal data endpoints (session required; scoped to the active tenant)
- `GET /api/me/export`: JSON attachment of the account, consent history, notice acknowledgements, saved plan, and session and passkey metadata.
- `GET /api/consents` (current state: latest event per kind, latest notice acknowledged) and `POST /api/consents` with `{ notice?: "<notice version>", marketing?: { granted, version } }`. Consent events are append-only; `granted: false` is a withdrawal. The notice acknowledgement is the contract-basis "I have read the notice" record, not consent.
- `DELETE /api/me`: if the user is also in another tenant, removes only this tenant's membership (cascading to its plan, consents, notices), same one-day freshness rule. Otherwise Better Auth `deleteUser` (also at `POST /api/auth/delete-user`). Needs a session under a day old, else 400 `SESSION_EXPIRED` (sign in again). Writes an `erased_user` marker (sha256 of the lower-cased email + time, no PII), deletes the email's OTP `verification` rows and OTP counter, then the `user` row, which cascades to sessions, accounts, passkeys, consent events, notice acknowledgements and the plan.

## Auth origins and rate limits
- `BETTER_AUTH_URL` (public https origin of app + API) is required in production: the app throws at cold start without it. Its origin is trusted; add more with `BETTER_AUTH_TRUSTED_ORIGINS` (comma list).
- Per-IP limits (Better Auth defaults, production only) are stored in the `rate_limit` table, so they hold across Lambda instances.
- Per-email OTP limit: 5 sends per hour per address, every environment (`otp_email_limit`, keyed by email hash); the 6th gets 429.

## Restoring a backup after erasures
A restore brings back users erased after the backup was taken. Save the live marker list first, restore, then re-apply it before the database takes traffic:

    psql "$LIVE_DATABASE_URL" -c "\copy erased_user TO 'erased.csv' CSV"
    # ... restore the snapshot / PITR ...
    psql "$DATABASE_URL" <<'SQL'
    CREATE TEMP TABLE e (LIKE erased_user);
    \copy e FROM 'erased.csv' CSV
    INSERT INTO erased_user SELECT * FROM e ON CONFLICT (email_hash) DO UPDATE SET erased_at = GREATEST(erased_user.erased_at, EXCLUDED.erased_at);
    -- same hash as emailHash() in src/auth.ts; the created_at check spares someone who signed up again after erasure
    DELETE FROM verification v USING erased_user x
      WHERE x.email_hash = encode(sha256(convert_to(lower(substring(v.identifier from '-otp-(.*)$')), 'UTF8')), 'hex');
    DELETE FROM "user" u USING erased_user x
      WHERE x.email_hash = encode(sha256(convert_to(lower(u.email), 'UTF8')), 'hex') AND u.created_at < x.erased_at;
    SQL
    rm erased.csv
