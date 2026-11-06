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
| `videos` | title, topic (`kind`), the focus area it is tagged with (for focus areas that show tagged videos only), presenter, role, calculator, video (uploaded from the browser to Vimeo, below) or Vimeo URL, captions (.vtt upload), transcript, running time; with a Vimeo URL, `vimeoId`, `thumbnailUrl` and empty `duration` are filled from Vimeo oEmbed on save | `components/explore/videos.data.ts` |
| `topics` (Focus areas) | name, emoji, blurb, expert, category, picture, calculators, tagged videos only (Loans), order | `components/explore/explore.data.ts` |
| `explore-categories` | calculator groups | `components/explore/tools.data.ts` |
| `calculators` | name, intro question, emoji, category, optional help (rich text) | `components/explore/tools.data.ts` |
| `journeys` (Journeys) | a focus area's own page, Mortgages (Buying, Switching, Borrowing more) and Loans (Taking a loan, Credit cards, Several debts): calculator cards, story videos (with a thumbnail photo before filming), reading, live sessions | `components/mortgages/mortgages.data.ts` |
| `live-sessions` | when, title, expert, shown on Explore | `explore.data.ts`, `mortgages.data.ts` |
| `articles` | article / FAQ / link, card photo, body | mortgages reading lists (titles only so far) |
| `ask-answers` | key, question, answer (rich text) | `components/ask/topics.tsx` (general topics + advice guard) |
| `personality-types` | code A/B/E/C, name, strapline, strengths, watch-out | `domain/identity/personality.data.ts` |
| `legal-pages` | title, slug, `version` (= the app's `NOTICE_VERSION`), body | none in the app: a draft "Privacy notice" 2026-10 for legal to fill in |

Plus `users` (staff, Payload auth; no public sign-up: creating users needs a login), `media` (images and .vtt captions), `tenants` (one: LifeMap).

`appId` / `key` / `code` hold the id the app uses today (video `v9`, category `home`), so the app can switch without visual change. Videos keep `src` / `poster` (the app's current files) until each is on Vimeo.

Not in the CMS yet: money terms, risk/mismatch wording, statements. Payload's live preview needs the app to embed `@payloadcms/live-preview-react`; add it with C-02 if editors want it.

## Vimeo upload (V-01)
File bytes never pass through the CMS (Lambda or the Next server): videos go from the editor's browser straight to Vimeo, media files straight to S3. Code: `cms/src/vimeo.ts`, field `cms/src/components/VimeoUpload.tsx`; libraries `@vimeo/vimeo` (server) and `tus-js-client` (browser).

- In a video, **Video file** (admin field) takes a file. The browser sends only its name and size to `POST /api/videos/vimeo-upload` (staff only). The CMS calls Vimeo `POST /me/videos` with `upload.approach: 'tus'` and the size, privacy `view: 'disable'` (not on vimeo.com) and `embed: 'whitelist'`, adds each hostname in `CMS_CORS_ORIGINS` (the app's origins) as an embed domain, and returns the tus `upload_link`. `tus-js-client` then uploads the file from the browser to that link (resumable, progress shown).
- When the upload finishes, the form gets the new `vimeoId` and **Vimeo status** (sidebar) `Transcoding`; the editor saves (draft or publish). A draft with a new video keeps its own upload; the published video stays as it is until Publish.
- `afterChange` queues the `vimeoPoll` job (the jobs cron: `autoRun` in dev, `CmsJobs` on AWS). It checks Vimeo every minute, re-queuing itself, until `Ready` (then fills `duration` and `thumbnailUrl`) or `Failed`. It writes to the latest version: a pending draft stays a draft.
- Replacing: choosing another file uploads a new Vimeo video. On the next Publish, Vimeo videos uploaded here that the published version no longer uses (replaced since the previous publish, including draft-only uploads) are deleted on Vimeo. Restoring an older version whose video was replaced after it shows a deleted video: upload again.
- Deleting the video record deletes every Vimeo video uploaded for it (all versions). A pasted Vimeo URL is never deleted (saving a URL clears the status, which marks it as not ours).
- Without `VIMEO_ACCESS_TOKEN` the field says Vimeo is not configured and nothing is sent. A failed upload shows the error in the field; choose the file again to retry.

Media (images and `.vtt` captions only; videos are refused) uses `@payloadcms/storage-s3` with `clientUploads: true` in production: the admin asks the CMS for a presigned PUT URL (`/api/storage-s3-generate-signed-url`) and uploads to the `CmsMedia` bucket directly; its CORS rule (`CmsMediaCors` in `sst.config.ts`) allows PUT from the CMS origin only. The type is checked from the declared MIME type (a `mimeTypes` allow-list would make Payload download every upload back to sniff it). For images Payload still reads the first 1 MB from S3 to get width and height; Payload has no switch to skip that. Reads never touch the CMS either: `disablePayloadAccessControl: true` with a `generateFileURL` makes each file's `url` `${MEDIA_URL}/<filename>`, and SST sets `MEDIA_URL` to `<app origin>/media-cms`. The `ApiRouter` (the app's CloudFront) serves that path from the bucket with `routeBucket` (OAC; the bucket stays private, `access: "cloudfront"`), and the `DataKeyPolicy` lets only that distribution decrypt. Media is on the app's own origin, so captions (`.vtt`) and images need no CORS and CSP `'self'` covers them. Media is public to anyone with the URL (no Payload access check). In dev (no `S3_BUCKET`) files go to `cms/media/` through the dev server and URLs stay `/api/media/file/<filename>`.

Token: a Vimeo personal access token (Vimeo developer app > Generate token) with the `upload`, `edit` and `delete` scopes, on a plan that allows hiding videos from vimeo.com and domain-restricted embeds:

    npx sst secret set VimeoAccessToken <token> --stage <stage>

Test (Vimeo client mocked): `npm test` in `cms/`.


Add a `content({ slug, fields })` entry in `cms/src/collections/content.ts` and list it in `CONTENT` (it gets public-published read, drafts, scheduled publish and the tenant field). Then `npm run generate:types` and, for production, a migration (below).

## Publish
Edit in the admin, then Publish, or "Schedule publish" for a date. Drafts are never public. Scheduled jobs run every minute (`jobs.autoRun` in dev; on AWS the `CmsJobs` cron calls `/api/payload-jobs/run` with `CRON_SECRET`).

## How the app reads content (C-02)
Payload's REST API, no auth. Anonymous reads only ever return published documents (`?draft=true` is ignored without a login). CORS allows `CMS_CORS_ORIGINS` (dev `http://localhost:5173` and `vite preview` `http://localhost:4173`; on AWS the app origin).

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
    GET <app origin>/media-cms/<filename>                      # uploaded files on AWS: use the doc's absolute `url` (dev: /api/media/file/<filename> on the CMS)

When credit unions get their own content, filter with `where[tenant.slug][equals]=<slug>`. Rich text renders with `@payloadcms/richtext-lexical/react` (`RichText`) or `convertLexicalToHTML`.

## Deploy (SST, not deployed yet)
`sst.config.ts` adds: `CmsMedia` bucket (private, SSE-KMS, served at `/media-cms` on the app's Router), `Cms` (`sst.aws.Nextjs`, path `cms`, in the VPC, same RDS via `DatabaseUrl`, schema `cms`), `CmsJobs` cron, secrets `PayloadSecret`, `CmsCronSecret` and `VimeoAccessToken`. Output `cmsUrl`.

Before the first deploy:

    npx sst secret set PayloadSecret "$(openssl rand -base64 32)" --stage <stage>
    npx sst secret set CmsCronSecret "$(openssl rand -base64 32)" --stage <stage>
    cd cms && npm run payload migrate:create initial   # commit cms/src/migrations
    DATABASE_URL=... npm run payload migrate          # from inside the VPC (see api/README.md), before each deploy that changes the schema

Then create the first staff user with `SEED_STAFF_EMAIL`/`SEED_STAFF_PASSWORD` and `npm run seed`, or Payload's create-first-user screen (only offered while there are no users).
