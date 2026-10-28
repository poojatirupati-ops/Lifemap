# Coverage: spec to board cards

Spec: ../docs/journey-spec.md. Sections 12 to 29 are binding and override 1, 4 to 7, 10 where they conflict.
Done cards: T1 (shell, PWA), B1 (API scaffold), B2 (Better Auth), B4 (SST). In progress: T2 (rates), T4 (state).

## Deliberate departures (flag to Pooja)
1. **Login wall instead of "Skip for now" (sec 12.5).** Public and local-only (no account, nothing sent): Welcome, What brought you here, 6 Discover questions, reveal. Then sign-in / create account (email code, passkey, consents unticked). EVERYTHING else is behind authentication, in the app (route guard T27) and on the API (deny by default B6, per-user scoping, test B11). This replaces the email-only save and the "Secure your account" builder step (builder is 7 steps, not 8). It is stricter than xlsx MASTER C8 (optional email save); needs Pooja's yes.
2. **Mobile verification not built.** Mobile number is collected (B5) but no SMS code; the xlsx gate "email + phone verified before upload" is met with email verification only until an SMS provider card exists.
3. **Passkey not offered.** No card enrols a passkey after sign-in (spec P1), so B5 has no passkey button; authClient.signInWithPasskey stays unused until an enrol card exists.
4. **No magic-link resume.** Resume = sign in again (email code); the plan is saved per user (B3/B12) and the builder resumes at the saved step (T31).
4. **PDF = browser print to PDF** with print CSS (T55), not a PDF library. Ceiling: fidelity depends on the phone browser.
5. **No calendar (.ics) file** after booking; details on screen (T63, per sec 24.3).

## Matrix

| Spec | Screen / flow | Card(s) |
|---|---|---|
| 16, D0 | Welcome cover (photo, copy, 2 links) | T6 |
| 12.2, D1 | What brought you here | T6 |
| 12.3, 2, 13 | 6 Discover questions with tags and layman lines | T16 (data), T17 |
| 12.4, 2 | Money personality reveal with terms | T16, T18 |
| 12.5 | Save email or skip | replaced by sign-in wall (departure 1): B5 |
| P1, 12.7.5 | Create account, email code, passkey, consents unticked | B2 (done), T28, B5 |
| 17 | Ask hidden in onboarding, floating in app; help sheet | T27, T68 |
| 12.6, 7 | 5-tab shell Home/Explore/My Plan/Me/Experts, router, guard | T27 |
| auth | Session client, expiry, sign-out, returnTo | T28, T27, B5 |
| auth | API deny-by-default, per-user scoping, route coverage test | B6, B11 (each router has its own cross-user test) |
| auth | Carry pre-login answers into the account | B12 |
| 12.6 | Home (before and after plan) | T29 |
| 12.6 | My Plan empty state, timeline plus results | T30 |
| 12.7 | Plan builder stepper, save and resume | T31 |
| 12.7.1, 29 | About you, date of birth, partner invite or manual, dependants | T10, T32 |
| 4, 10.8, 23 | Goal picker, Emergency fund naming | T7 |
| 4, 27.1 | Goal rows, More details, Date has passed | T34, T10 |
| 4, 27.3 | Timeline drag, keyboard, lanes, retirement flag | T33, T11 |
| 12.7.4, 13, 3 | Money profile (13 questions total, asked once) | T16, T35 |
| 5, 15, 19 | Finances hub and 6 sections, example cards, + for loans/pensions/policies | T8, T38, T39-T43 |
| 5, D7 | Document upload with confidence check, fallback to Type it | B9, T44 |
| 14, 22, 27 | Required choices (retirement age, plan until, inflation, partner retirement), step 7 short, skip, missing banner | T12, T13, T45, T9 |
| 18, 19.6, 27.5 | Settings, market rates, partner override | T12 |
| 6, 12.8 | Results page (label, goals, found, what-if, future, end actions) | T14, T46, T47, T48, T49, T9 |
| 24.2, 26, 28 | What-if card order, live line, scenarios | T15, T47 |
| 29, 27.3 | Calendar-year cashflow, DOB ages, early retirement | T5, T10, T11 |
| 28 | Plan report PDF like v5 (11 pages) | T51, T56, T52, T53, T54, T55 |
| F8 | Plan history and versions, preferred plan | B7, T57 |
| 3, 13 | Me hub, profile result | T58, T35 |
| GDPR | Privacy, consents, export, delete my data | B8, T59 |
| 22.4 | My money checklist | T60 |
| 21, C1 | Experts tab, specialists always shown | T61, B10 |
| C0-C2 | Optional adviser questions, match, explicit share consent, fee disclosure | T62, B10 |
| C3-C4 | Pick a time, booked, what happens next | T63, B10 |
| 17, 21, 25 | Explore: what-ifs, Focus tiles with photos, tools | T64 |
| 17, 26 | 28 calculators: engines | T20-T25 (6 groups, 7/3/5/5/3/5) |
| 17, 26 | Calculator groups list and runner, example figures label | T65, T67 |
| 25 | Videos library, two real videos, captions honesty | T66 |
| 20, 17 | Plain copy ban list, brand, emoji aria-hidden, reduced motion | T26 (tests), D1 (review) |
| 27.2 | Number boxes: suffix never overlaps | T26 |
| offline | Offline banner, caches, sync no-op | T69, B12 |
| whole | Journey integration test | T70 |
| PLAN | Bounded-context restructure, design review | R1, D1 |

## Uncovered on purpose (later / out of scope)
- SMS/mobile verification, SMS and email confirmations for bookings (needs provider; email dev sender only).
- Open banking / bank connect (sec 10.3: no).
- AI Ask chat (static help sheet only, T68).
- Real adviser matching backend, real calendar, adviser portal and phases 7 to 9 (seeded experts in B10).
- Real OCR / document extraction engine (B9 is pluggable, default extracts nothing, never invents figures).
- Real partner accounts and shared plans (partner invite is a local mock, sec 10.4).
- Budget 2027 values (sec 17, 23: not used until final; only the note is shown).
- Settings admin view for partners (T12 is data and rules; no admin UI; customers never see it).
- Pre-fill from mortgage applications, AI intro videos (sec 19.10 roadmap).
- Pro-rating by birth month (sec 29: later).
- Staging deploy: nothing is deployed by any card.
- Magic-link resume, email-only save (departures 1 and 3).
- Rent, lone-parent and Home Carer tax credits: the engine applies them from Plan.about.cred (T5), but no screen sets it yet, so for real customers they never apply. A card (T32 or new) must add the chips before they count, and that card must also add `cred` to `planSchema.about` in api/src/routes/plan.ts (the schema is non-strict, so zod silently strips it on save otherwise).
