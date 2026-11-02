# React + TypeScript rewrite plan (direct rewrite, no bridge)
Decision: public/prototype.js is never loaded by the new app. The original ../LifeGoals-Customer-Journey-Prototype.html (served at :8080) is the reference for look, markup and logic. Stack: React + TS + Vite, Zustand (+immer) store, domain-driven layout, exact 1:1 design (pixel and DOM equality), login wall (public: Welcome, What brought you here, Discover, reveal).
Layout: src/state/{types,fresh,store}.ts (store holds s:State; update(fn) mutation-style via immer; normalize inside update) | src/domain/<context>/ pure TS, verified against the original script slice in node:vm | src/routes/ (file-system routes, TanStack Router Vite plugin; see Libraries) | src/components/<area>/ one component per file | src/hooks/useX.ts | src/sheets/*.sheet.tsx | src/auth/ | src/report/ | src/styles/ (the original CSS verbatim).
Rules: same DOM, class names, ids, aria, data-*; inline styles as style objects; no data-a dispatcher or bind(): each screen owns handlers (React events) and effects (hooks); inputs uncontrolled; hideEmoji and goalIcons applied at render time so the DOM equals the original's post-effect DOM.
Equality: R-01 captures state snapshots from :8080; R-04 builds tools/view-equal.mjs (same state into both apps, normalised DOM + pixel diff) and scenario replays (click/type steps, compare S and DOM after each step).
Cutover order: foundation R-01..R-06 (R-03 makes index.html independent of prototype.js) > public journey R-12, R-13 > sign-in R-14, R-15 > the rest in journey order R-16..R-32 > R-33 leftovers > R-34 deletes the legacy files. Until R-34 the app is a growing subset (placeholder for unconverted ids): do not demo the full journey before about R-23. The original keeps running at :8080 throughout.
Decision taken by default (flag if wrong): React keeps DOM nodes between renders, so element-level CSS animations that the original replays on every innerHTML render will not replay; use a key only where a replay is visible and intended.
Estimate: 34 cards, about 20-22M tokens base, 27-30M with rework. Risks: global mutable S (types from fixtures, immer store), the 1,200-line Results page (split R-20/21/23), timeline and rank drag (scenarios + real iOS check), report/print (renderer verbatim), focus/scroll, equality baseline must be the post-render DOM.

## Code style (user, overrides everything above that says "verbatim" or "port")
The first output read like transpiled prototype code: cryptic names, dense one-liners, too much code. From now on:
- Rewrite, do not transliterate. The original defines WHAT the app shows and does (look, copy, numbers, behaviour); HOW is idiomatic React + TypeScript. Never copy its code shape, variable names (S, lk, fld, cf, dv...), string-building or global-mutation style.
- Less code: derive instead of storing, data tables instead of branches, delete what no screen uses. If a function needs a comment to explain what a name means, rename it.
- Proper structure: src/domain/<context>/ pure functions with readable names and small typed inputs (not the whole State); src/state/ Zustand slices per context with named actions; src/screens/ thin; src/components/<area>/ one component per file; src/hooks/. A screen reads what it needs through selectors, never the whole state.
- Readability: Prettier (printWidth 100) is enforced (npm run format); one statement per line; descriptive names; functions short; types named after the domain (Goal, Plan, Assumption, Consent).
- Equality with the original is still checked by RESULTS (vm golden tests on outputs, view-equal/visual-diff on screens), never by mirroring code.
- Ponytail: no speculative abstraction, no wrappers, no config for one value.
Exact visual match still stands (CSS and class names stay the original's).

## Libraries (user: use libraries, do not hand-roll)
Use the established library before writing code for any of these. Headless libraries only, so markup, class names and CSS stay the original's.
| Need | Use |
|---|---|
| Auth | better-auth client (`better-auth/react`, emailOTP and passkey plugins), `useSession` |
| Server state, plan save/load, retries, 409 refetch | @tanstack/react-query (`useQuery`, `useMutation`) |
| Navigation, back button, deep links | File-system routing: TanStack Router with its Vite plugin (@tanstack/router-plugin/vite). One file per screen under src/routes/ (e.g. routes/index.tsx = Welcome, routes/discover/$step.tsx, routes/_app/plan.tsx with a _app layout for the tab bar, routes/_auth.tsx layout as the login wall via beforeLoad). Replaces pickScreen/go and src/screens |
| App state | zustand + immer (already chosen) |
| Forms and inputs | react-hook-form (uncontrolled, fits the original's inputs) + zod schemas (zod is already in api/) |
| Validation of API data and saved plans | zod |
| Dates, ages, DOB | date-fns |
| Drag (timeline, rank list) | @dnd-kit/core (+ @dnd-kit/sortable for rank) or @use-gesture/react for the timeline pointer drag |
| Sheets, dialogs, focus trap, Escape | @radix-ui/react-dialog (use asChild to keep the original markup) |
| Class names | clsx |
| PDF report | jspdf + html2canvas from npm, not a CDN |
| Number and currency formatting | Intl.NumberFormat (built in) |
| Tests | vitest, @testing-library/react, playwright-core (already installed) |
Not a library: the charts and the journey SVG stay hand-drawn SVG, because a chart library would change the look. A library that would change the visual output is out.

## React best practices (user: use the vercel:react-best-practices skill)
Writers and reviewers invoke the Skill tool with skill "vercel-react-best-practices" (project skill in .claude/skills/, installed with npx skills add vercel-labs/agent-skills; also vercel-composition-patterns for component APIs and web-design-guidelines for UI review) and apply it. This is a Vite SPA, so the server, RSC and Next.js-only rules (sections 3 and 6.5/6.6/6.8) do not apply; translate the rest:
- Bundle: no barrel imports (import date-fns, radix etc. by path); route-level code splitting comes from TanStack Router file routes (autoCodeSplitting); heavy parts (report/PDF, charts, calculators) with React.lazy instead of next/dynamic; preload on hover/focus where a tap is likely.
- Data: TanStack Query plays the SWR role (dedup, caching); keep it, do not add SWR. Independent requests with Promise.all, no awaits before cheap checks.
- Re-renders: derive during render (no state+effect copies), zustand selectors return primitives or use useShallow, no components defined inside components, functional setState, lazy useState init, useRef for transient drag/scroll values, interaction logic in event handlers not effects, useTransition/useDeferredValue for the what-if sliders and chart.
- Rendering: explicit ternaries (no `count && ...`), hoist static JSX/SVG, content-visibility for long lists, animate wrappers not SVG.
- JS: Map/Set for repeated lookups, toSorted/flatMap, hoisted RegExp, passive scroll/touch listeners, one shared listener per global event.
Reviewers list each violation by rule number.

## Size budget and file rule (user, overrides "one component per file")
- Budget: app source (src/ excluding legacy/ and prototype/) at most about 15,000 lines, down from 37,000. `npm run size` prints the count. Every card must leave the count lower, never higher.
- File rule relaxed: shared components keep their own file; a small component, hook or helper used in only one place lives in its parent's file. Merge files back where this applies.
- How to get there: delete duplicates (one shared helper/component), derive instead of storing, drive repeated forms and lists from data tables, delete dead code and one-use wrappers. The pixel check and golden tests must keep passing.

## NO HAND-ROLLED CODE (user, hard rule)
Before writing any non-trivial helper, search npm for a maintained library that does it and use it. Hand-written code is allowed only for LifeMap's own domain logic (financial rules, copy, screens). Known cases to replace:
- tools/visual-diff.mjs and tools/view-equal.mjs (custom Playwright + pixelmatch scripts): @playwright/test with expect(page).toHaveScreenshot() and its built-in diffing, baselines captured from the original prototype.
- The journey test (J-01): an @playwright/test spec, not a custom script.
- Screen switching, go(), pickScreen, the wall: TanStack Router (file routes, beforeLoad).
- Debounced plan saving and retry: TanStack Query (mutation retry) + TanStack Pacer (or use-debounce), no hand timers.
- Date maths: date-fns. Forms: react-hook-form + zod. Dialogs, focus traps: Radix. Drag: dnd-kit / @use-gesture. Class names: clsx. Number/currency: Intl.
- Line counting (npm run size): cloc.
Every agent reports any hand-written utility it kept, with the library it checked and why it did not fit.
