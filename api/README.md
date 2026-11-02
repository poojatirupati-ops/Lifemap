# LifeMap API

Hono on AWS Lambda (function URL), eu-west-1 (GDPR data residency). Auth: Better Auth (email OTP + passkey, organization + admin + SSO plugins) on Postgres (see ../app/PLAN.md). Multi-tenancy: ../docs/tenancy.md.

## API docs (generated from the code)
- `GET /api/docs`: interactive reference (Scalar). `GET /api/openapi.json`: the OpenAPI 3.1 spec. Dev: http://localhost:8787/api/docs, no sign-in. Production: platform admins only (session + `user.role = 'admin'`), since the docs list tenant and admin routes.
- Nothing is hand-written: each route carries a `doc(...)` / `docPublic(...)` description (`src/openapi.ts`, hono-openapi) next to its handler, request bodies come from the zod schemas the route validates with, and `/api/auth/*` comes from Better Auth's openAPI plugin. A test fails if a mounted route is missing from the spec.
- Spec file for the app team: `npm run dev`, then `curl -s http://localhost:8787/api/openapi.json > openapi.json`.

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
    LIFEMAP_EMAIL_SENDER=<domain or address> npm run deploy -- --stage <stage>   # runs `sst deploy` from the repo root

Email (F1): production sends sign-in codes through SES (`sesOtp` in `src/auth.ts`, SESv2 `SendEmail`, plain text, no tracking) from the `Email` identity in sst.config.ts, with the tenant's name as the sender name. `lambda.ts` sets `OTP_SENDER=ses` and `OTP_FROM`; without them production fails closed. A new SES account is in the sandbox: request production access, and for a domain sender publish the DKIM records SST outputs. Dev logs the code with the email masked. Tenant invitations (organization plugin `sendInvitationEmail`, link `/?invitation=<id>`) go through the same sender (`sendMail`); dev logs the masked address and subject only. Booking invites come from Cal.com.

Captcha: Cloudflare Turnstile on OTP send and OTP sign-in is off by default. It is registered only when `CAPTCHA_ENABLED=true` and `TURNSTILE_SECRET_KEY` is set (the client then sends the widget token in `x-captcha-response`). Neither is set by sst.config.ts yet.

Migrations: the database is private, so run `npm run migrate` from inside the VPC, e.g. `npx sst tunnel` (needs `bastion: true` on the Vpc) or `npx sst shell` from a host that can reach it, with `DATABASE_URL` from `Resource.DatabaseUrl`. Run it before deploying code that needs the new schema.

`src/lambda.ts` (and `src/jobs/purge.ts`) copy the linked values into `DATABASE_URL` / `BETTER_AUTH_SECRET` and set `NODE_ENV=production` before the app loads. RDS Proxy keeps Lambda bursts from exhausting Postgres; the pool stays at 1 connection per Lambda instance.

## Document reading (provider contract)
`POST /api/documents/:id/read` with `{ "kind": "<kind>" }` sends the caller's document to a reader (`src/documents/reader.ts`) and stores `readStatus`, `readFields`, `readProvider` and `readAt` on the document row; `GET /api/documents/:id` returns them. `DOC_READER=example` (the default outside production) returns the app's example figures. Production uses `DOC_READER=http` with the SST secrets `DocReaderUrl` and `DocReaderApiKey` (`npx sst secret set DocReaderUrl "https://..." --stage <stage>`, same for the key); without them every read fails and nothing is stored but `failed`.

For the provider team. LifeMap calls:

    POST {DocReaderUrl}/read
    Authorization: Bearer {DocReaderApiKey}
    Content-Type: application/json

    {
      "documentId": "4f1c...",                 // LifeMap's id, for your logs
      "kind": "liab",                          // see the table below
      "contentType": "application/pdf",        // application/pdf, image/jpeg, image/png, image/heic or text/csv
      "url": "https://...amazonaws.com/...",   // presigned GET, valid 5 minutes: fetch the file within that window, do not keep the URL
      "organizationId": "lifemap-direct"       // the tenant
    }

Reply within 12 seconds (LifeMap aborts after that and records the read as failed), HTTP 200:

    {
      "status": "done",                        // or "failed" when the document cannot be read
      "fields": [
        { "name": "mortgage_balance", "value": 203700, "confidence": 0.96 },
        { "name": "home_status", "value": "Own with mortgage", "confidence": 0.99 }
      ]
    }

`value` is a number (euros as plain numbers, percentages as 3.85, years and ages as whole numbers) or a string; `confidence` is 0 to 1 (under 0.8 the app asks the customer to check it). Any other status code, a reply that does not match this shape, or a confidence outside 0..1 is treated as a failed read. Unknown names are ignored. Names per kind (mapped to LifeMap keys by `PROVIDER_KEYS` in `src/documents/reader.ts`):

| kind | Document | Field names |
|---|---|---|
| income | Payslip, current-account statement | employment_status, gross_annual_income, monthly_spending, yearly_one_off_costs |
| assets | Savings, investment statements | cash_savings, investments_value |
| liab | Mortgage, credit-card, loan statements | home_status, mortgage_balance, mortgage_monthly_repayment, mortgage_years_remaining, mortgage_interest_rate, credit_card_balance, credit_card_monthly_repayment, loan_balance, loan_monthly_repayment |
| prot | Life, income protection, employer benefits, health policies | life_cover, income_protection, employer_cover, health_insurance ("Yes" / "No") |
| pension | Pension statement | pension_value, pension_total_monthly_contribution, pension_own_monthly_contribution |
| retire | Pension benefit statement | pension_value, pension_own_monthly_contribution, pension_employer_monthly_contribution, normal_retirement_age, projected_value_at_retirement, annual_charges_percent, prsi_years |
| home | Mortgage statement | mortgage_balance, mortgage_interest_rate, mortgage_monthly_repayment, mortgage_years_remaining, property_value |
| invest | Investment statement | investments_value, monthly_amount_invested, holdings_shares_percent, holdings_bonds_percent, holdings_cash_percent, annual_charges_percent |

LifeMap stores only the mapped fields (not your raw reply) and never logs the values.

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
| Plan versions (`plan_version`) | Newest 50 per user per tenant; erased with the account | `KEPT_VERSIONS` in `src/routes/plan.ts`; FK cascade |
| Uploaded documents (S3 `Documents`, `document` rows) | Until the user deletes them or erases (*DPO*: a shorter period, or delete after extraction once a real reader exists) | `DELETE /api/documents/:id`; erasure deletes the objects first, then the rows |
| Bookings, their Cal.com deliveries and share consents (`booking`, `booking_event`, `consent_event` kind `adviser_share`) | Life of the account (*DPO*) | FK cascade on erasure |
| Booking events (EventBridge archive `BookingsArchive`; ids and times only) | 90 days (*DPO*) | Archive retention |

## Tenancy (../docs/tenancy.md)
- Every session has an active tenant (Better Auth organization): the SSO provider's tenant, else LifeMap Direct (`lifemap-direct`); other tenants through an invitation or `organization/set-active`. There are no tenant domains. Plan, consents and notices are per user per tenant.
- `GET /api/tenant` (public): branding, resolved feature flags and rates for the session's active tenant (LifeMap Direct without one). `PATCH /api/admin/organizations/:id/config`: platform admins (`user.role = 'admin'`) only. The organization plugin's `get-full-organization`, `list-members` and `list-invitations` list a tenant's people, so they answer tenant admins only (customers are members too).
- First platform admin: `update "user" set role = 'admin' where email = '<staff email>';`

## Personal data endpoints (session required; scoped to the active tenant)
- `GET /api/me/export`: JSON attachment of the account, consent history, notice acknowledgements, saved plan and its versions, document list, bookings, and session and passkey metadata.
- `GET /api/consents` (current state: latest event per kind, latest notice acknowledged) and `POST /api/consents` with `{ notice?: "<notice version>", marketing?: { granted, version } }`. Consent events are append-only; `granted: false` is a withdrawal. The notice acknowledgement is the contract-basis "I have read the notice" record, not consent.
- `DELETE /api/me`: if the user is also in another tenant, removes only this tenant's membership (cascading to its plan, consents, notices), same one-day freshness rule. Otherwise Better Auth `deleteUser` (also at `POST /api/auth/delete-user`). Needs a session under a day old, else 400 `SESSION_EXPIRED` (sign in again). Writes an `erased_user` marker (sha256 of the lower-cased email + time, no PII), deletes the email's OTP `verification` rows and OTP counter, the stored document objects, then the `user` row, which cascades to sessions, accounts, passkeys, consent events, notice acknowledgements, the plan and its versions, document rows and bookings. The tenant-only path also deletes that tenant's document objects first.

## Plan history, documents, bookings (session required; the caller's records in the active tenant; others get 404)
- `PUT /api/plan` takes an optional `snapshot: "<note>"` (e.g. "Goals changed", "LifeMap confirmed"): the saved plan is also kept as a version.
- `GET /api/plan/versions` -> `{ versions: [{ id, note, at }] }` newest first. `POST /api/plan/versions/:id/restore` `{ version }` (the current plan version; stale = 409) -> `{ version, plan }`; the replaced plan is kept as a version first.
- Documents (flag `documentUpload` gates POST): `POST /api/documents` `{ name, contentType: pdf|jpeg|png|heic|csv, size <= 10 MB }` -> 201 `{ document, upload: { url, method: "PUT", headers } }`; the app PUTs the file bytes to `upload.url` with `upload.headers` within 5 minutes. `GET /api/documents`, `GET /api/documents/:id` -> `{ document, url }` (5-minute read URL), `DELETE /api/documents/:id`. Production: private bucket, keys `<org>/<user>/<id>`. Dev: files under `api/.dev-files`, served at `/api/dev-files/...` with the same scoping.
- Advisers: `GET /api/advisers` -> the tenant's members with role `adviser` and a Cal.com link (`user.calLink`, `user.adviserProfile`, set by the adviser with `POST /api/auth/update-user`). Dev seeds the prototype's three sample advisers in LifeMap Direct (`src/dev.ts`; `DEV_CAL_LINK` = one of your Cal.com events).
- Bookings (flag `adviserBooking` gates POST), through Cal.com: `POST /api/bookings` `{ adviserId, share: { report, finances, docs, moneyProfile }, shareVersion }` -> 201 `{ booking }` (status `pending`) and a `consent_event` (kind `adviser_share`, detail = booking, adviser and exactly what is shared). The app then opens the adviser's Cal.com embed carrying the booking id. `GET /api/bookings`. Cancelling happens on Cal.com's cancel page.
- Cal.com webhook: `POST /api/webhooks/cal/:organizationId` (no session; `x-cal-signature-256` with the tenant's secret from `CAL_WEBHOOK_SECRETS`) sets `status` (`booked`, `cancelled`, `ended` on MEETING_ENDED, `no_show` on the no-show triggers; a later trigger never undoes these), `cal_uid` and `starts_at`, records the share withdrawal on a cancel, adds a `booking_event` row (unique per Cal.com uid and trigger), then publishes a CloudEvent (`src/events/bus.ts`: `EVENT_BUS=memory` outside production logs it, `eventbridge` publishes to the `Bookings` bus). 500 when publishing fails, so Cal.com retries. Setup: docs/runbook.md "Cal.com webhooks".

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

## Local Postgres with Podman
`podman compose up -d` at the repo root starts Postgres 17 (databases `lifemap` and `cms`). Run the API against it with `DATABASE_URL=postgres://lifemap:lifemap-dev@localhost:5432/lifemap npm run dev` (migrations apply on start). Without DATABASE_URL, dev falls back to PGlite in .dev-db. Tests always use in-memory PGlite.

## Feature flags in local dev
Without PostHog keys, flags use the code defaults. Override them locally with `FEATURE_OVERRIDES="documentUpload=true,adviserBooking=true"` when starting the dev server (ignored in production).
