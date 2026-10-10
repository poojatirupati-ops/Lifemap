# Archive: LifeMap v2.8.2 (10 Oct 2026)

A frozen copy of the final, fully checked version of the web app. **Do not edit anything in this folder.**

- Git branch: `archive-v2.8-final` (a frozen, never-edited copy of the whole repository at this version: app, media, both Excel workbooks, the Word spec, docs, tools and tests). Commit `089027c`.
- This folder holds the app itself (single HTML file), the phone-install files and the build script. The photos and videos are in `media/` on the archive branch.
- What is new since v2.7: date of birth with calendar-year cashflow, the 11-page plan report like v5 (searchable PDF, print path keeps colours), plan-until age 50 to 100, workbook v2.8 (48 sheets, Report spec sheet), refreshed Word spec.

## If an update goes wrong, go back to this version
1. Whole repository: `git checkout archive-v2.8-final` (look around) or `git revert`/`git reset` to it on a branch.
2. Just the app: copy `LifeGoals-Customer-Journey-Prototype.html` from this folder over the one in the repository root, then push; the web app republishes by itself.
3. To open it directly: build with `python3 build-site.py` from a folder that has `media/`, `icons/`, `manifest.webmanifest` and `sw.js`, or open the HTML file in a browser.

Checks at this version: all app test scripts 0 failures; workbook 70,419 formulas, 0 errors; plan engine 76/76 in the final run, 18/18 age edge cases, calculators 161/161 and 119 wording checks.
