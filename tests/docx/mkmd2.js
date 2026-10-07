const r=require('./check.json'),m=require('./check-mut.json'),d=require('./data.json'),ex=require('./ex.json'),fs=require('fs');
const shots=Object.fromEntries(d.calcs.map(c=>[c.n,c.states.filter(x=>x.kind==='full').length]));
const rows=r.perCalc.map(([n,name,p,f])=>'| '+n+' | '+name+' | '+p+' | '+f+' | '+(shots[n]||'')+' |').join('\n');
const pc=k=>r.perCalc.find(x=>x[0]===k)[2];
const pages=fs.readFileSync('pdf/spec.txt','utf8').split('\f').length-1;
const mb=(fs.statSync('/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx').size/1e6).toFixed(1);
const md=`# UI/UX calculator spec: automated check (prototype b98e767, 6 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx (file name unchanged; the product is LifeMap). A4, **${pages} pages, ${mb} MB**, 28 calculators (C01 to C28), rebuilt from:
- prototype commit b98e767: journey-spec §14 to §22 (the §19 feedback items, the §20 copy pass, §21 Experts specialist boxes and illustrated Focus on one area tiles, §22 skippable Step 7 and the results banner)
- the workbook as committed (new sheets "Settings" and "Your lists", their named cells, the new guidance texts)

The screenshots are palette-quantised PNGs (256 colours, no dithering) to keep the file small; the text was not touched. I converted the docx to PDF with LibreOffice and looked at sample pages: 3.7 (Settings: standards table, partner override, admin view, workbook sheet), 4.8 (the item block, Liabilities, Protection, Pension, per-item upload), 4.9 (complete on save), 4.10 (workbook Your lists and the calculators that use it), 6.1 and 6.2 (months, goal order). Layout, tables and images are fine. LibreOffice's PDF font has no glyphs for a few newer emoji; they are in the .docx text.

## Result

**${r.pass} checks passed, ${r.fail.length} failed. Browser console errors: ${r.errors.length}.**

**Planted-error test.** I made a copy of the docx with 20 deliberate edits and ran the same check on it. It found all 20, which showed up as ${m.fail.length} failed checks. The 20 edits:
1. C01 result label
2. C11 result line
3. C01 unit
4. C04 result label
5. The credit-card guidance in Your assumptions ("23%" changed to "25%", every occurrence)
6. The "3.9% · Ireland now (CSO HICP flash, Sep 2026)" chip
7. The C07 result gate
8. An example-card sentence (Cash savings, "€9,000" changed to "€9,500")
9. The cover headline
10. The suggested-rate chip text (3.48% changed to 3.84%, every occurrence)
11. The Q8 answer "Straight up the motorway" (changed to "…motorways", every occurrence)
12. A Settings wording in 3.7.1 ("Irish pay has grown about 3%–4% a year recently (CSO)" changed to "2%–4%", every occurrence)
13. A protection field label ("Death-in-service: lump sum" changed to "Death in service: lump sum", every occurrence)
14. The ranking heading ("Which goal first?" changed to "Which goal comes first?", every occurrence)
15. A copy-pass wording: the Emergency fund months note ("use the same number." changed to "use the same value.", every occurrence)
16. A copy-pass wording: the Known limits row ("stay at the 2026 rates." changed to "stay at the 2027 rates.", every occurrence)
17. A specialist box blurb ("Life cover, income protection, serious illness" changed to "… income cover …", 2.5)
18. A Focus on one area tile blurb ("Budget, surplus and debt" changed to "Budget, spare cash and debt", 2.2)
19. The Step 7 button ("Use the standards for the rest" changed to "Use the standard for the rest", 3.5)
20. The results banner ("3 details missing" changed to "3 details left", 3.5.1)

## What is checked

A fresh headless Chromium run (390×844, scale 2), separate from the screenshot run, rebuilds every documented state for every calculator and compares the live DOM with the docx XML (gates, blank inputs and guidance, suggested-rate chips, "Assumptions this tool uses", inputs tables, screen values, result templates, limits and hints, choice chips, workbook output names and values). Shared parts: inflation chips, the rules register (${d.meta.RULES.length} keys), every Your assumptions input, Set by Government card, step 7, "What your plan assumes", Explore, statement cards and Add to my plan sheets.

**§15 and §16 (${pc('§15 / §16')} checks):** all ${ex.cards.filter(c=>c.link).length} reachable example cards (opened from their links, compared with section 4.4 by title and "shown on", Escape closes, focus returns, field and lists unchanged; the 7 old single-total cards must have no link); status tags; checklist rows; gates and worked-out lines; the cover, D1, Emergency fund tile.

**§17 to §19 (${pc('§17 / §19')} checks):**
- **Explore, emoji, Ask** (as last round): section order and the six Calculators rows; emoji in aria-hidden spans for all 28 titles; Ask hidden in onboarding and shown in the app.
- **Settings:** the live SETTINGS block has 37 standards and every one equals its row in 3.7.1 (name, standard as formatted, wording or chip label, source, as-at, guidance, verify flag); each equals the workbook Settings sheet (Set_{key}, Set_{key}_1 to _3 for the three-value rows, Set_{key}_Label, Set_{key}_Cautious); the 2 guidance figures, the fixed values (Ireland now 3.9%, the 23% card cap) and Partner_Name are in the workbook and 3.7.
- **Admin view:** its note, partner-name label and group summaries equal 3.7.3; it is marked "🔒 Admin view · not for customers" and sits in the jump list.
- **Partner override:** with a partner name and changed figures set live, the inflation help and chip, Emergency fund months guidance and chip, mortgage chip and the unchanged pay-rise guidance and loan chip equal the strings in 3.7.2; "Suggested by {partner}" appears only beside the changed figures; the "Changed by" tag and "Back to the LifeMap standards" link are in the doc; the block is reset afterwards.
- **Lists:** every add button, upload text and item field label (cards, loans, pensions, 5 policy types) is in 4.8; the Liabilities, Protection (lead-in, no generic upload, five add buttons, work-cover hint) and Pension screens match; the per-item upload (confirm screen, toast, "From …" row) equals 4.8.4; a saved section is Done even with blank fields and Missing reads "Missing · optional, counts as €0".
- **Workbook Your lists:** every named total (13 of them) is in 4.10 and the intro text matches; exactly C12, C13, C14, C21, C24 and C25 fall back to the totals (each cell, label and name equals the workbook formulas); C27 and C28 are not fed.
- **Emergency fund months:** calculator 3, goal 4, step 7 shows 4 (tag "Your choice"); one fresh run proves the goal value reaches the calculator; every string in 6.1 equals the live screen; the edge (typed in C11, later changed in the goal) is in the doc.
- **Goal order:** the Emergency fund is first by default, movable, reset restores it; heading, help, aria-labels, messages, version notes and the results order in 6.2 equal the live card.

**§21 and §22 (${pc('§21 / §22')} checks):** the six Focus on one area tiles (emoji, name, blurb and --art slot equal the live tiles in 2.2; the grid, honesty and contrast lines); the five specialist boxes on the Experts tab, C0 and C1 equal 2.5 and the old chip row is gone; Step 7 (3.5): the "Choose 3 things" card, counter, "Everything else" card, the standards button and its note, both buttons disabled before the 3 choices, no tick, the standards button leaves the 3 unchosen; Skip opens results with a banner; the 1 and 3 missing banner texts equal 3.5.1.

## Per calculator

| Cnn | Calculator | Checks passed | Failed | Screenshots |
|---|---|---|---|---|
${rows}

## Changed in this rebuild

- **§21 and §22:** new 2.2 (illustrated square tiles, art slots, scrim, reduced motion), new 2.5 (Talk to a specialist), rewritten 3.5 (Step 7: Choose 3 things, standards for the rest, Skip) and new 3.5.1 (results banner). Screenshots were recaptured and palette-quantised. All tile and box text is checked against the live prototype.

- **Copy pass (§20):** the doc follows the reworded prototype text: the step 7 and Your assumptions intros, the What your plan assumes intro and its "How the plan works" and "Known limits" rows, the Emergency fund months note (6.1 and Appendix A), the "For the rest we show a suggestion or the standard" line in Appendix A. The change list is in docs/copy-audit.md.
- The workbook README lines that were reworded are not quoted in this document, so nothing else moved. Page count and file size are unchanged (${pages} pages, ${mb} MB).

## Open points (Appendix B of the spec)

- Budget 2027: not applied yet; only once final and official, from its own effective date (§17).
- Settings: 14 of 37 standards and the Central Bank July 2026 rates are marked "verify before release".
- The admin view is a prototype screen; access and approval of partner figures belong to the production build.
- The cover-through-work hint (death-in-service "usually a multiple of your salary") should be checked with a protection expert.
- Emergency fund months in C11 keep a value typed there after the goal changes it (typing in a calculator wins; the plan uses the latest). Consider showing the plan-wide value again.
- The cover photo is a placeholder; re-check contrast when the licensed photo goes in.

## Failures

${r.fail.length ? r.fail.map(f=>'- '+f).join('\n') : 'None.'}
`;
fs.writeFileSync('/home/user/lifegoals-prototype/deliverables/uiux-spec-check.md', md); console.log('md', pages, mb, r.pass, r.fail.length, m.fail.length);
