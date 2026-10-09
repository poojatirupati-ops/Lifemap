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
- Both videos are H.264 MP4 and have no captions yet.

## Archive (rollback point)
`archive/v2.7-2026-10-08/` and the branch `archive-v2.7-final` hold a frozen copy of the final v2.7 version (8 Oct 2026). Never edit them. See `archive/v2.7-2026-10-08/ARCHIVE-README.md` to go back to it if an update goes wrong.
