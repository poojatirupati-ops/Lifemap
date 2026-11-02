# Feature batch: shared rules
- Invoke the Skill tool with ponytail:ponytail and vercel-react-best-practices first. Libraries only, never hand-roll (see the last sections of app/REACT-PLAN.md). Do not over-test: one test per real behaviour you add.
- Type check with `npm run typecheck` in app/ or api/ (NEVER `npx tsc`: it picks the wrong TypeScript in this repo). Tests with `node_modules/.bin/vitest run <paths>` for the files you touch only.
- Touch only the files your prompt gives you. Other agents work in parallel on other files. If you need a change elsewhere, write it in your reply.
- The API dev server runs on :8787 against Postgres in Podman; the app on :5173; the CMS on :3000. Sign-in codes are in /tmp/lifemap-api.log. Sign out and clear cookies after any sign-in test.
- The pixel look must stay the original's. Keep `npm run size` from growing; delete what you replace.
- No commits, no deploys. Set your card(s) to review and reply with files changed, results, and requests for other owners.
- Verification budget (user): run the checks for what you changed once at the end. No repeated full-suite runs, no re-running to get green twice, no Lighthouse/screen reruns. If something still fails, report it instead of looping.
