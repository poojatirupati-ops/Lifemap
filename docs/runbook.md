# LifeMap runbook (production)

Region eu-west-1. Infrastructure: `sst.config.ts`. Deploys: `.github/workflows/deploy.yml` (README "Release"). Stages: `staging` (every push to main), `production` (published GitHub release, approved in the `production` environment).

Commands below need AWS credentials for the stage's account (`aws sso login` or similar) and run from the repo root.

## Alarms

All alarms go to the SNS topic `Alerts` (email set by `LIFEMAP_ALERT_EMAIL` in the GitHub environment). Dashboard: CloudWatch > Dashboards > `lifemap-<stage>`. Traces: CloudWatch > X-Ray traces (the Api runs with active tracing).

| Alarm | Means | First steps |
|---|---|---|
| `Api5xxRate` (>= 5% for 10 min) | Api failing requests | Api logs (`/aws/lambda/...Api...`, Powertools JSON: `level=ERROR`, `requestId`, `code`); X-Ray for the slow or failing segment. If it started with a deploy: roll back (below). |
| `ApiLatencyP95` (>= 3 s for 10 min) | Slow Api | X-Ray; `DbCpu`, `DbConnections`; RDS Performance Insights (top SQL). |
| `<fn>Errors`, `<fn>Throttles` (Api, Purge, CmsJobs, CmsServer) | Unhandled errors or concurrency limit | The function's logs. Throttles: check account concurrency (Lambda > Concurrency) and request an increase. |
| `PurgeErrors` | Daily retention purge failed (G5) | Purge logs; run it again from the console (Lambda > Test). Expired OTPs and sessions stay until it succeeds. |
| `DbCpu`, `DbConnections`, `DbFreeStorage` | RDS under pressure | Performance Insights. Storage: raise `storage` on `Db` in sst.config.ts and release. Connections: raise the instance class (and the alarm threshold). |
| `DbProxyErrors` | Proxy cannot reach Postgres | RDS instance status (rebooting, failing over, storage full); proxy secret matches the DB password (see "Rotate secrets"). |
| `BillingDeadLetter` (>= 1 message) | Billing failed a booking event 3 times | The message in the `BillingDeadLetter` queue (its CloudEvent `id` is the idempotency key). Fix billing, then move the messages back (SQS > BillingDeadLetter > Start DLQ redrive) or replay from the `BookingsArchive` (EventBridge > Archives > Start replay); billing dedupes on the id. |
| `SesBounceRate`, `SesComplaintRate` | SES reputation at risk (AWS reviews at 5% / 0.1%) | SES > Reputation metrics; look for a sign-up attack sending codes to bad addresses (WAF metrics `ApiAuthRateLimitPerIP`). |

## Roll back a release

SST has no "previous version" command: deploy the previous release again.

1. GitHub > Actions > Deploy > the run for the last good release > **Re-run all jobs** (it redeploys that commit; approve in the `production` environment).
2. Or from a laptop: `git checkout <last-good-tag> && LIFEMAP_EMAIL_SENDER=<sender> npx sst deploy --stage production`.

Migrations are not rolled back. They are additive by rule (deploy.yml runs them before the code, except on a stage's first deploy), so old code runs on the newer schema, including after a rollback. If a migration itself is wrong, write a new one and release it.

## Restore RDS from backup

Automated backups and point-in-time restore cover the last 35 days, encrypted with `DataKey`. Never restore over the live instance: restore to a new one, then copy back.

1. Before anything else, if the live database is reachable, save the erasure markers made since the restore point (they are lost otherwise):
   `psql "$DATABASE_URL" -c "\copy (select * from erased_user where erased_at > '<restore time>') to 'erased.csv' csv"`
   (`DATABASE_URL` and the tunnel: see "Connect to the database".)
2. Restore to a scratch instance in the same VPC (RDS console > Automated backups > Restore to point in time, or):
   ```
   aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier <Db instance id> \
     --target-db-instance-identifier lifemap-restore-<date> --restore-time <ISO time> \
     --db-subnet-group-name <Db subnet group> --vpc-security-group-ids <Db security group> --no-publicly-accessible
   ```
   The identifiers are on the live instance's Configuration and Connectivity tabs.
3. Repair data: `pg_dump` the needed tables or rows from the scratch instance and load them into the live one. Total loss: `pg_dump -Fc` the scratch instance and `pg_restore` it into the live instance (recreated by `npx sst deploy` if it was deleted).
4. Re-apply erasures. Load `erased.csv` into `erased_user` (`\copy erased_user from 'erased.csv' csv`), then delete anyone erased since the restore point:
   ```sql
   DELETE FROM "user" u USING erased_user e
     WHERE encode(sha256(convert_to(lower(u.email), 'UTF8')), 'hex') = e.email_hash;  -- cascades to plan, sessions, document rows, ...
   ```
   Restored OTP `verification` rows are long expired; the daily `Purge` deletes them.
   S3 documents are not restored (no versioning), so erased users' files stay gone. Known gaps: tenant-only erasures (membership removal) leave no marker, and if the live database is lost the markers after the restore point are lost too; check the support inbox for erasure requests in that window.
5. Delete the scratch instance (`aws rds delete-db-instance --db-instance-identifier lifemap-restore-<date> --skip-final-snapshot`).

### Restore drill log

Run the drill once per stage before launch, then yearly: steps 2, 3 (dump and count rows of `user`, `plan`, `document` on scratch vs live) and 5, and note the time taken.

| Date | Stage | Restore time | Duration | Result | By |
|---|---|---|---|---|---|
| not run yet | | | | Needs the AWS account (nothing has been deployed) | |

## Connect to the database

RDS is private. The VPC has a bastion (the NAT instance).

```
sudo npx sst tunnel install          # once per machine
npx sst tunnel --stage production    # leave running
npx sst shell --stage production -- bash -c 'psql "$(node -p "JSON.parse(process.env.SST_RESOURCE_DatabaseUrl).value")"'
```

IAM database auth is enabled on the instance for a future migration user (`CREATE USER migrator; GRANT rds_iam TO migrator;` plus `rds-db:connect` on the deploy role). Today migrations use the master credentials through `sst shell`; switching needs the drizzle and Payload configs to use an IAM token.

## Rotate secrets

Stage secrets live in SST (SSM, encrypted) and are read at deploy time, so every rotation is: set, then redeploy (re-run the latest Deploy run for that stage).

| Secret | Command | Effect |
|---|---|---|
| `DbPassword` (RDS master) | `npx sst secret set DbPassword "$(openssl rand -hex 24)" --stage <stage>` | Deploy changes the RDS password, the Proxy secret and `DatabaseUrl` together; expect a minute of DB errors during the deploy. |
| `BetterAuthSecret` | `npx sst secret set BetterAuthSecret "$(openssl rand -base64 32)" --stage <stage>` | Signs everyone out. |
| `PayloadSecret` | same, `openssl rand -hex 32` | Signs CMS editors out. |
| `CmsCronSecret` | same | None. |
| `PosthogProjectKey`, `PosthogPersonalApiKey` | rotate in PostHog first, then set | None. |
| `CalWebhookSecrets` | see "Cal.com webhooks" | Webhooks signed with the old secret get 401 (Cal.com retries them). |

Secrets Manager rotation is not used: the Proxy secret is written by SST from `DbPassword`, and an automatic rotation would leave `DatabaseUrl` stale. `DataKey` (KMS) rotates itself yearly.

## Cal.com webhooks

Adviser bookings (card C-CAL) are confirmed, moved and cancelled by Cal.com, which calls the Api. Each tenant's advisers sit in one Cal.com team (EU: app.cal.eu) with one team webhook:

1. Advisers: make each one a member of the tenant with role `adviser` (tenant admin: invite with that role), then the adviser sets their own Cal.com link and card with Better Auth's update-user: `POST /api/auth/update-user` `{ "calLink": "<user>/<event>", "adviserProfile": { "qualifications": "...", "languages": "...", "location": "...", "meetingMode": "..." } }`. They are listed on the Experts tab from then on.
2. In Cal.com: the team > Settings > Webhooks > New. Subscriber URL `<appUrl>/api/webhooks/cal/<organization id>`. Triggers: Booking requested, Booking rejected, Booking created, Booking rescheduled, Booking cancelled, Meeting ended, Booking no-show updated, After hosts / guests Cal Video no-show. Payload template: default. Secret: `openssl rand -hex 32`.
3. Store the secret in the stage's `CalWebhookSecrets` (JSON, one entry per tenant), then redeploy:
   `npx sst secret set CalWebhookSecrets '{"lifemap-direct":"<secret>","<org id>":"<secret>"}' --stage <stage>`
4. Check: Cal.com's "Ping test" must not get 401 (that means the secret or the organization id is wrong). A booking made through the app shows `booked` in `GET /api/bookings`.

The Api answers 401 to a bad signature, 200 to a delivery it recorded or does not track, 409 when the payload names a booking (`metadata.bookingId`) no tenant has yet, or a reschedule arrives before the one it follows, and 500 when publishing to the `Bookings` bus failed; Cal.com retries the last two (a retry never adds a second `booking_event` row, and publishes again only if the first delivery applied). The organizer of a requested, created or rescheduled booking must be the adviser whose `calLink` the booking was made with; otherwise the delivery is logged and not applied. Details: api/README.md. Rotate a secret: add it in Cal.com, set it in `CalWebhookSecrets`, redeploy.

## Personal data breach (GDPR Art. 33-34)

The clock starts when we become aware of a breach (personal data lost, changed, disclosed or accessed without authority, including by mistake).

1. **Contain** (hour 0): revoke the access (rotate the leaked secret above, disable the IAM user or role, block IPs in WAF, take the Api offline if needed by removing its function URL route). Do not delete logs or evidence.
2. **Record** (day 0): open an entry in the breach register: what happened, when found, data categories and approximate number of people and records, likely consequences, measures taken. Every breach is recorded, even ones not reported.
3. **Assess risk** (by hour 48, with the DPO): use CloudWatch logs (30 days), X-Ray, S3 and RDS events. Unless the breach is unlikely to result in a risk to people, it is notifiable.
4. **Notify the controller or the DPC** (within 72 hours of awareness):
   - Tenant data where the tenant organisation is the controller: tell that tenant without undue delay; they notify the DPC.
   - Where LifeMap is the controller: notify the Data Protection Commission with the web form at dataprotection.ie (breach notification). If some facts are not known yet, notify within 72 hours anyway and send the rest in phases. Explain any delay past 72 hours.
5. **Tell the people affected** without undue delay if the risk to them is high (Art. 34): plain language, what happened, likely consequences, what we did, what they can do, contact point.
6. **Close**: root cause, fix, update this runbook and the register.
