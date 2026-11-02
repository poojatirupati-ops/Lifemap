# LifeMap CMS (Payload 3)

`cms/` is a Payload CMS 3 app (Next.js, made with `create-payload-app`, blank template) for the copy and media the app shows. Only the LifeMap team logs in. Financial rules, rates and calculator maths stay in the app code.

Packages: `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical` (Lexical editor), `@payloadcms/storage-s3`, `@payloadcms/plugin-multi-tenant`.

## Run locally
Node `^22.23.4` or `>=24.22.1` (Payload's engines; e.g. `/opt/homebrew/opt/node@26/bin` on PATH).

    podman compose up -d          # repo root: Postgres 17 from compose.yaml, database `cms`
    cd cms
    cp .env.example .env          # set PAYLOAD_SECRET to a random string
    npm install --workspaces=false   # cms keeps its own node_modules and lock, like app/ and api/
    npm run seed                  # imports the app's current copy, creates the dev staff user from .env
    npm run dev                   # http://localhost:3000/admin  (staff@lifemap.test / lifemap-staff-dev)
    npm run typecheck

In dev Payload pushes the schema itself (no migrations); everything lives in the `cms` schema. Uploads go to `cms/media/` (gitignored). `npm run seed` wipes and re-imports the content collections (not users), so run it only on a fresh or dev database.

## Collections
Admin group "Content" (all with drafts, versions (50 per doc) and scheduled publish):

| Slug | What | App source it was seeded from |
|---|---|---|
| `videos` | title, topic (`kind`), presenter, role, calculator, Vimeo URL, captions (.vtt upload), transcript, running time; `vimeoId`, `thumbnailUrl` and empty `duration` filled from Vimeo oEmbed on save | `components/explore/videos.data.ts` |
| `topics` (Focus areas) | name, emoji, blurb, expert, category, picture, calculators, order | `components/explore/explore.data.ts` |
| `explore-categories` | calculator groups | `components/explore/tools.data.ts` |
| `calculators` | name, intro question, emoji, category, optional help (rich text) | `components/explore/tools.data.ts` |
| `journeys` (Journeys) | Mortgages page (Buying, Switching, Borrowing more): calculator cards, story videos, reading, live sessions | `components/mortgages/mortgages.data.ts` |
| `live-sessions` | when, title, expert, shown on Explore | `explore.data.ts`, `mortgages.data.ts` |
| `articles` | article / FAQ / link, body | mortgages reading lists (titles only so far) |
| `ask-answers` | key, question, answer (rich text) | `components/ask/topics.tsx` (general topics + advice guard) |
| `personality-types` | code A/B/E/C, name, strapline, strengths, watch-out | `domain/identity/personality.data.ts` |
| `legal-pages` | title, slug, `version` (= the app's `NOTICE_VERSION`), body | none in the app: a draft "Privacy notice" 2026-10 for legal to fill in |

Plus `users` (staff, Payload auth; no public sign-up: creating users needs a login), `media` (images and .vtt), `tenants` (one: LifeMap).

`appId` / `key` / `code` hold the id the app uses today (video `v9`, category `home`), so the app can switch without visual change. Videos keep `src` / `poster` (the app's current files) until each is uploaded to Vimeo; then paste the Vimeo URL and those two can go.

Not in the CMS yet: money terms, risk/mismatch wording, statements. Payload's live preview needs the app to embed `@payloadcms/live-preview-react`; add it with C-02 if editors want it.

## Add a collection
Add a `content({ slug, fields })` entry in `cms/src/collections/content.ts` and list it in `CONTENT` (it gets public-published read, drafts, scheduled publish and the tenant field). Then `npm run generate:types` and, for production, a migration (below).

## Publish
Edit in the admin, then Publish, or "Schedule publish" for a date. Drafts are never public. Scheduled jobs run every minute (`jobs.autoRun` in dev; on AWS the `CmsJobs` cron calls `/api/payload-jobs/run` with `CRON_SECRET`).

## How the app reads content (C-02)
Payload's REST API, no auth. Anonymous reads only ever return published documents (`?draft=true` is ignored without a login). CORS allows `CMS_CORS_ORIGINS` (dev `http://localhost:5173`; on AWS the app origin).

    GET /api/videos?limit=100&depth=1                          # depth=1 expands the captions file (url)
    GET /api/topics?sort=order&depth=1                         # with category and calculators
    GET /api/explore-categories?limit=100
    GET /api/calculators?limit=100
    GET /api/journeys?sort=order&depth=2                       # cards, stories (+ video), reading, live
    GET /api/live-sessions?where[onExplore][equals]=true
    GET /api/ask-answers?sort=order&limit=100                  # answer is Lexical JSON
    GET /api/personality-types
    GET /api/legal-pages?where[slug][equals]=privacy-notice
    GET /api/videos?where[appId][equals]=v9                    # one record by the app's id
    GET /api/media/file/<filename>                             # uploaded files

When credit unions get their own content, filter with `where[tenant.slug][equals]=<slug>`. Rich text renders with `@payloadcms/richtext-lexical/react` (`RichText`) or `convertLexicalToHTML`.

## Deploy (SST, not deployed yet)
`sst.config.ts` adds: `CmsMedia` bucket (private, SSE-KMS), `Cms` (`sst.aws.Nextjs`, path `cms`, in the VPC, same RDS via `DatabaseUrl`, schema `cms`), `CmsJobs` cron, secrets `PayloadSecret` and `CmsCronSecret`. Output `cmsUrl`.

Before the first deploy:

    npx sst secret set PayloadSecret "$(openssl rand -base64 32)" --stage <stage>
    npx sst secret set CmsCronSecret "$(openssl rand -base64 32)" --stage <stage>
    cd cms && npm run payload migrate:create initial   # commit cms/src/migrations
    DATABASE_URL=... npm run payload migrate          # from inside the VPC (see api/README.md), before each deploy that changes the schema

Then create the first staff user with `SEED_STAFF_EMAIL`/`SEED_STAFF_PASSWORD` and `npm run seed`, or Payload's create-first-user screen (only offered while there are no users).
