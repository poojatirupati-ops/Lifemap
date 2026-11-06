# LifeMap

**The life you'd like, mapped out.** A life map that guides you, step by step.

LifeMap (by DigiPro.AI) is a customer-journey prototype: a short "what brings you here" start, six money questions, a personality reveal, then a plan builder (goals, timeline, finances), results, Explore (calculators, videos), and Experts.

## Use it on your phone or any device
Once GitHub Pages is switched on (see below) the app lives at:
**https://poojatirupati-ops.github.io/Lifemap/**

- **iPhone (Safari):** open the link, tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the link, tap the menu, then **Install app** / **Add to Home screen**.
- It works offline after the first visit (videos stream and need a connection).

### One-time setup: switch GitHub Pages on
1. Open **Settings > Pages** in this repository.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Open the **Actions** tab, and if the "Deploy LifeMap web app" run hasn't started, run it manually. After about a minute the address above works.

## What is in here
| Path | What |
|---|---|
| `LifeGoals-Customer-Journey-Prototype.html` | **The web app (edit this file only).** `build-site.py` turns it into the published `index.html` and adds the phone-install tags |
| `build-site.py`, `manifest.webmanifest`, `sw.js`, `icons/` | Make it installable on a phone and work offline |
| `media/` | Photos and the two pension videos (auto-enrolment, how your retirement plan works) |
| `deliverables/` | Excel workbook for the engineer (28 calculators), Word UI/UX spec, check reports |
| `docs/` | The journey spec with every decision (§10 to §26), reviews, copy audit, the pre-release checklist |
| `reference/` | Source material (journey book extract, earlier prototypes, screenshots) |
| `tests/` | The automated test scripts used to check the prototype against the workbook |
| `.claude/agents/` | The team roles used while building |

## Final deliverables (v2.7, 8 Oct 2026)
- `deliverables/LifeMap-Calculators-Complete.xlsx`: **the one workbook for both UI/UX and the developer** (47 sheets): the 28 calculators with formulas, the Make my plan engine, the Calculation register, the tax engine, Settings and lists, and the UI/UX screen guide (UI sheets with pictures of every screen).
- `deliverables/LifeGoals-Calculators.xlsx`: the same without the UI sheets (the sheets the checking tools run on).
- `deliverables/LifeGoals-Calculators-UIUX-Spec.docx`: the Word UI/UX spec (335 pages).
- `docs/pre-release-verify.md`: figures and rates a person must check on official pages before launch.
- `tools/`: `build_ui_sheets.py` (adds the UI sheets), `plan-vs-xlsx/` and `calc-vs-xlsx/` (prove the workbook matches the app), `finalize_workbook.py`.

## Before real customers use it
See `docs/pre-release-verify.md`. Rates and tax figures must be checked on official pages (Revenue, Central Bank, CSO, DSP). Nothing from Budget 2027 is used until it is final and official. The prototype gives guidance, not advice.

## Notes
- The `tests/` scripts were written for the build environment and use absolute paths; adjust the paths at the top of each script to run them elsewhere.
- The two pension videos are H.264 MP4 and have no captions yet. The first-home example video (`media/first-home-deposit-to-keys.mp4`, 0:53) has captions (`.vtt`) and a transcript, and an AI-generated presenter, so no adviser is named under it.

## Redesign (working version from 13 Oct 2026)
Public link: https://tejalsakpal66-tech.github.io/lifemap-redesign/ . Details in `docs/redesign-link.md`.

## Archive (rollback points)
`archive/v2.8-2026-10-10/` and the branch `archive-v2.8-final` hold a frozen copy of the final v2.8.2 version (10 Oct 2026). Never edit them. See `archive/v2.8-2026-10-10/ARCHIVE-README.md`. Older: `archive/v2.7-2026-10-08/` and the branch `archive-v2.7-final` hold a frozen copy of the final v2.7 version (8 Oct 2026). Never edit them. See `archive/v2.7-2026-10-08/ARCHIVE-README.md` to go back to it if an update goes wrong.

## Release (API and CMS on AWS)
Workflows: `.github/workflows/ci.yml` (every pull request: `npm ci`, then `npx turbo run lint typecheck test build` on Node 24, which includes the app's Playwright screen suite) and `.github/workflows/deploy.yml` (push to `main` deploys stage `staging`; a published GitHub release deploys stage `production` after approval). Each deploy runs the checks, the API (Drizzle) and CMS (Payload) migrations through `sst tunnel`, `sst deploy`, then a smoke test (`/health`, CMS `/admin`). A stage's first deploy runs `sst deploy` before the migrations, since its database does not exist until then. Operations: `docs/runbook.md`.

### One-time setup
1. **AWS account(s)**, region eu-west-1. Best: one account for staging and one for production (AWS Organizations), so alarms, metrics and access stay apart.
2. **GitHub OIDC** in each account: IAM > Identity providers > add OpenID Connect, URL `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`.
3. **Deploy role** in each account, trusted only by that environment of this repository:
   ```json
   { "Version": "2012-10-17", "Statement": [{ "Effect": "Allow",
     "Principal": { "Federated": "arn:aws:iam::<account>:oidc-provider/token.actions.githubusercontent.com" },
     "Action": "sts:AssumeRoleWithWebIdentity",
     "Condition": { "StringEquals": {
       "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
       "token.actions.githubusercontent.com:sub": "repo:poojatirupati-ops/Lifemap:environment:production" } } }] }
   ```
   (`environment:staging` for the staging role.) Permissions: SST needs broad rights to create the stack; start with `AdministratorAccess` and narrow it later. No access keys are stored anywhere.
4. **GitHub environments** (Settings > Environments):
   - `staging`: deployment branches `main`. Variables: `AWS_ROLE_ARN`, `LIFEMAP_EMAIL_SENDER` (e.g. `staging.lifemap.ie`), `LIFEMAP_ALERT_EMAIL`.
   - `production`: required reviewers (the manual approval), deployment tags `v*`. Same three variables with production values.
   No GitHub secrets are needed.
5. **SST secrets per stage** (once, from a laptop with that account's credentials; `<stage>` = `staging` or `production`):
   ```
   npx sst secret set DbPassword "$(openssl rand -hex 24)" --stage <stage>
   npx sst secret set BetterAuthSecret "$(openssl rand -base64 32)" --stage <stage>
   npx sst secret set PayloadSecret "$(openssl rand -hex 32)" --stage <stage>
   npx sst secret set CmsCronSecret "$(openssl rand -hex 32)" --stage <stage>
   npx sst secret set PosthogProjectKey <key> --stage <stage>
   npx sst secret set PosthogPersonalApiKey <key> --stage <stage>
   npx sst secret set BetterAuthUrl https://<appUrl> --stage <stage>   # first deploy: deploy, read `appUrl`, set, redeploy
   ```
6. After the first deploy: confirm the SNS email subscription, request SES production access and publish the DKIM records (api/README.md), and run the restore drill (docs/runbook.md).

### Release steps
1. Merge to `main`; the Deploy run updates `staging`. Check it.
2. Dry run against production: `LIFEMAP_EMAIL_SENDER=<prod sender> npx sst diff --stage production` (production credentials). Read the plan: nothing in `Db`, `DataKey`, `Documents` or `CmsMedia` should be replaced or deleted.
3. Tag and publish a release: `gh release create v1.2.3 --generate-notes` (or GitHub > Releases > Draft a new release).
4. Approve the waiting `production` deployment in the Deploy run. It migrates, deploys and smoke-tests.
5. Problems: docs/runbook.md "Roll back a release".

Production is protected: `removal: retain` and `protect` (SST will not remove the stage), RDS deletion protection and a final snapshot, 35-day backups, KMS key `DataKey` with yearly rotation.
