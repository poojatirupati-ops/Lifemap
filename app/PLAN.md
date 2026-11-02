# LifeMap production app (Vite + React + TS PWA)
Prototype (design + behaviour spec): ../LifeGoals-Customer-Journey-Prototype.html. Spec: ../docs/journey-spec.md. Maths reference: ../deliverables/LifeMap-Calculators-Complete.xlsx.
Rules: ponytail (fewest files, no speculative abstractions), strict TS, generators for series/projections, rates as data, one test per non-trivial module, guidance not advice.
Board: board/*.md, one card per task. Status: todo, doing, review, changes, done. Each agent edits only its own card.
Waves: T1,B1 | T2,T4,B2,B4 | T3,B3 | T5,T6,T7,T8 | T9,B5 | R1 (bounded contexts) | D1 (impeccable design review). Backend lives in ../api (Hono + Better Auth + Drizzle/Postgres on Lambda, eu-west-1). Auth choice: Better Auth over Cognito (email OTP, passkeys, you own the user table next to plan data); revisit if you want zero auth ops.

## Domain-driven design (applied lightly, ponytail still rules)
Bounded contexts, one folder each under src/domain/ (and api/src/domain/ for server-side rules): discovery (answers, money personality, risk), goals (goal, timeline, retirement age), finances (balance sheet, income, expenses, protection, pension), planning (projection generator, rates, assumptions, what-if), identity (account, consent, session), plansync (versioned plan, conflict).
Rules: ubiquitous language from docs/journey-spec.md and the workbook (Goal, Plan, Assumption, Scenario, Consent); domain code is pure TS with no react, hono, fetch or storage imports; screens and API routes are thin adapters that call the domain; contexts talk through small exported types, never reach into each other's files. No repository/factory/service classes unless a second implementation exists.
Existing cards write to src/engine and src/state; card R1 moves them into these contexts once they are green.

## Component structure (user rule, overrides "fewest files" for UI)
One React component per file, named after the component (PascalCase.tsx). A screen is a thin composition file in src/screens/ that imports small components from src/components/<area>/ (or src/screens/<Name>/ folder with an index file only if it has 3+ parts). Hooks in their own files (useThing.ts). Data and copy in separate .data.ts files. No file over about 150 lines. Ponytail still applies to everything else: no wrappers, no abstractions for one use.

## UI definition of done (added after user feedback: the first build lacked prototype fidelity, animation, back navigation and responsiveness)
Every UI card must, beyond its own Done-when: (1) match the prototype's look for that screen (compare side by side with the prototype running on :8080 at 375px; same spacing, type, colour, imagery, copy); (2) carry the prototype's motion for it (screen enter, tab pop, button press, reveal/gauge/orbit effects) using CSS transitions/keyframes, with a prefers-reduced-motion fallback; (3) have a working back path (header back button, browser/hardware back, step back inside flows) and keep focus sensible; (4) be responsive: phone full-bleed with safe-area insets, centred app frame on tablet/desktop, no horizontal scroll at 320, 375, 768, 1280. Reviewers check these in a real browser, not by reading code.
Source of truth for look: the running prototype wins over spec text; spec text wins on behaviour, consent and copy rules.
1:1 rule: UI cards pass only when `node tools/visual-diff.mjs <screen>` is green (<= 0.5% pixels differ vs the prototype at 375px). Add each new screen to app/tools/visual-screens.json.
