# Archive: LifeMap v2.7 (8 Oct 2026)

A frozen copy of the final, fully checked version of the web app. **Do not edit anything in this folder.**

- Git tag: `v2.7-final` (restores everything: app, media, the complete Excel workbook, the Word spec, docs, tools and tests).
- This folder holds the app itself (single HTML file), the phone-install files and the build script. The photos and videos are in `media/` at the tag.

## If an update goes wrong, go back to this version
1. Whole repository: `git checkout v2.7-final` (look around) or `git revert`/`git reset` to it on a branch.
2. Just the app: copy `LifeGoals-Customer-Journey-Prototype.html` from this folder over the one in the repository root, then push; the web app republishes by itself.
3. To open it directly: build with `python3 build-site.py` from a folder that has `media/`, `icons/`, `manifest.webmanifest` and `sw.js`, or open the HTML file in a browser.

Checks at this version: all app test scripts 0 failures; workbook 70,402 formulas, 0 errors; plan engine 208/208 scenarios, calculators 161/161.
