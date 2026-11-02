# Batch of 10 parallel agents: shared rules

Ten agents run at the same time in /Users/sahilpohare/Lifemap/app. Each owns the cards and files named in its own prompt. Everything below applies to all of them.

1. Invoke the Skill tool with `ponytail:ponytail` and `vercel-react-best-practices` (and `vercel-composition-patterns` for component APIs) before writing code. Follow both.
2. Read `app/REACT-PLAN.md`, especially "Code style", "Libraries" and "React best practices", then each of your cards in `app/board/`. A card in `status: changes` lists the reviewer's open issues at its end. Fix those first. Many of these cards were cut off by network failures, so inspect the current files before rewriting them.
3. Touch only your own files. If you need a change in a file another agent owns, do not make it. Write it down in your reply instead.
4. Do not rename fields in `src/state/types.ts`. The state renames and the UI-slice split happen in a later card (L-01). Write code against the current names.
5. Your work is done when:
   - `npx tsc -b` reports no errors in your files;
   - your cards' tests and the failing test files you own pass (`npx vitest run <paths>`; the full suite takes more than 10 minutes, so do not run it);
   - `node tools/visual-diff.mjs <screen>` passes for screens you changed, if the dev servers on :5173 and :8080 are up.
6. When your code is done, use the Agent tool to spawn ONE reviewer sub-agent. It reviews code quality only, using `ponytail:ponytail-review` together with `vercel-react-best-practices`. Fix what it finds, once. Then set each of your cards to `status: done`, or to `status: changes` with the open items listed.
7. Never commit, push or deploy. Sign out and clear cookies after any sign-in test.
8. Reply with: the cards you finished, the files you changed, the test results, and any requests for other owners.
