s=open('b-body.js').read()
def cut(start_marker, end_marker, new):
    global s
    a=s.index(start_marker); b=s.index(end_marker)
    assert a<b; s=s[:a]+new+s[b:]
# ---- 7.5 / 7.6
cut("  push(H2('7.5 Skip never ends","  push(H2('7.7 Investment standard", r'''  push(H2('7.5 The results gate: "To see your results we need N things" (journey-spec §27.7)'));
  push(P('Only four choices can block the plan: retirement age, plan-until age, inflation and, for a partner whose income is counted, the partner\'s retirement age (§27.4). When one is missing the app shows **one calm card** that says exactly what and where, never a generic "Choose your … to see this" wall and never a "Use the standards for the rest" button (both were removed from the plan). Everything else is set for the customer (7.15).', { size: 18 }));
  push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Card', 'Title "' + Z.gate.res.title + '" · "' + Z.gate.res.p + '" (sample customer with a working partner and nothing chosen). Singular: "To see your results we need 1 thing" with "Only you can choose this, so we never fill it in for you."'],
    ['Rows', Z.gate.res.rows.map(r => '"' + r.name + '" with the button "' + r.btn + '" (aria-label "' + r.aria + '")').join(' · ') + '. Without a working partner there are three rows: "' + Z.gate.three.title + '" (' + Z.gate.three.rows.join(', ') + ').'],
    ['Where it shows', 'The same card, same wording and same rows on Home (id gate-home), on the results on My Plan (gate-res), in the report sheet "' + Z.gate.report.h2 + '" opened from the report and PDF buttons (gate-report, with "Not now"), and in the "Make my choices" sheet. The timeline strip says "' + Z.gate.strip.title + '" with "' + Z.gate.strip.small + '" and one button "' + Z.gate.strip.btn + '". The Your assumptions screen opens with "To see your results we need N things" or "Everything your results need is chosen".'],
    ['Jump', 'Each "' + Z.gate.res.rows[0].btn + '" opens Me, Your assumptions (screen "' + Z.gateJump.head + '"), opens the group that holds the box (e.g. "' + Z.gateJump.open + '" for plan until age), scrolls it into view, gives it a highlight (class flash, about 4 seconds) and moves keyboard focus into it. Retirement age, plan until age and the partner\'s retirement age are in "Plan length"; inflation is in "Prices & growth".'],
    ['Count', 'The count is the number of required choices still open (' + Z.p4partner.req.length + ' with a working partner, ' + Z.p4single.req.length + ' without). Once all are chosen the card is gone and the results show (' + (Z.gateAfter.ready ? 'checked in the app' : '') + ').']], { size: 15 }));
  push(imgGrid([{ file: 'S27-gate-results.png', caption: 'My Plan with nothing chosen: the gate card' }, { file: 'S27-gate-jump.png', caption: 'After "Choose" on Plan until age: Your assumptions, the box highlighted' }], 2, 1000));
  push(H2('7.6 Another property\'s mortgage: an assumed term, never a block (journey-spec §27.4, §27.6)'));
  push(P('A mortgage on another property (4.8.2) with a balance but neither a monthly repayment nor years left does not block the results. The plan works the repayment out over 25 years (about €' + Z.mort2.pay.toLocaleString('en-IE') + ' a month on €180,000) and says so.', { size: 18 }));
  push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Check your details', '"' + Z.mort2.p4.replace(/⚠️Pension.*$/, '').replace(/^❓/, '❓ ') + '" (the item counts in the "N details missing" banner: ' + Z.mort2.banner + ' in this test, with the pension needing a look).'],
    ['Once either is given', 'The assumed 25 years goes; a typed repayment is used as typed, and years left give a worked-out repayment.'],
    ['Blank items', 'An item with no balance counts as €0 and asks nothing (4.8.2).']], { size: 15 })); 
''')
# ---- 7.9 / 7.10
cut("  push(H2('7.9 A partner","  push(H2('7.11 Emergency fund goal", r'''  push(H2('7.9 Step 7 "Choose N things" and the partner\'s retirement age (planner M2, journey-spec §27.8)'));
  push(table([2600, W - 2600], ['Part', 'Copy and behaviour (verbatim)'], [
    ['When a partner\'s income is counted', 'Step 7 card "' + Z.p4partner.h3 + '": "' + Z.p4partner.p + '" · counter "' + Z.p4partner.count + '" · fields in order: ' + Z.p4partner.order.join(', ') + '. The line above the buttons reads "' + Z.p4partner.need + '". Under it, collapsed: "' + Z.p4partner.summary + '": "' + Z.p4partner.restP + '"'],
    ['With no partner income', 'Card "' + Z.p4single.h3 + '": "' + Z.p4single.p + '" · counter "' + Z.p4single.count + '".'],
    ['Where else', 'In Your assumptions (Plan length group, next to the retirement age) and in the gate card (7.5). The partner\'s age is asked in every partner mode that uses their income ("Add your partner\'s age to see this").'],
    ['What the plan does with it', 'The partner\'s pay is counted until that age, then only their State Pension (below 60 their own pension is not drawn; see 7.15). "Known limits" reads: "' + Z.knownLimit + '"']], { size: 15 }));
  push(imgGrid([{ file: 'S27-step7-four.png', caption: 'Step 7 with a working partner: four things to choose, the rest collapsed' }], 1, 1000));
  push(H2('7.10 A rate we don\'t know: "Assumed: add yours" (journey-spec §27.6)'));
  push(P('A customer with a card, loan or mortgage who has not given the rate no longer meets a dead end or a block. The plan uses the suggested published rate where one exists, or the planning rate, labels it, and counts it in "N details missing".', { size: 18 }));
  push(table([2600, W - 2600], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Credit card', 'Field "' + Z.rates.card.label + '" · "' + Z.rates.card.help[0] + '" Buttons: "' + Z.rates.card.chips.join('" and "') + '".'],
    ['Other loans', 'Field "' + Z.rates.loan.label + '" · "' + Z.rates.loan.help[0] + '" Button: "' + Z.rates.loan.chips.join('" and "') + '".'],
    ['Mortgage', 'Field "' + Z.rates.mort.label + '" · "' + Z.rates.mort.help[0] + '"'],
    ['What your plan assumes', Z.rates.rows.filter(r => /rate/i.test(r[0]) && !/State/.test(r[0])).map(r => '"' + r.join('" · "') + '"').join('; ') + '. When the customer gives their own the tag reads "Your choice" (e.g. "' + Z.rates.rowsMine[0].slice(0, 3).join('" · "') + '").'],
    ['Legal limit button', 'Sets the card rate to ' + (Z.rates.cap * 100).toFixed(0) + '% (the legal limit for new cards: cautious, not typical); the planning-rate button leaves it for the adviser. Typing a rate clears the flag.']], { size: 15 }));
''')
# ---- 7.14 -> workbook section, plus 7.15 and 7.16
cut("  push(H2('7.14 Workbook changes","for (const c of data.calcs) {", r'''  push(H2('7.14 Where to find the workbook changes'));
  push(P('The workbook is described in 7.17 (version 2.7): the Plan sheets, the Calculation register, the gate and the new Settings standard "Pension access age".', { size: 18 }));
  push(H2('7.15 The simpler journey in the app (journey-spec §27)'));
  { const PA = Z.passed, R = Z.retire, A = Z.access, T = Z.tags, OV = Z.overlap;
  push(table([2600, W - 2600], ['Item', 'Copy and behaviour (verbatim)'], [
    ['Required choices (§27.4)', 'Only retirement age, plan-until age, inflation and a working partner\'s retirement age block results, the report and the PDF (the card in 7.5). Nothing else does.'],
    ['LifeMap standards (§27.5)', 'Every figure that is the same for everyone is applied from the start and tagged "' + T.set.tags[0] + '": e.g. "' + T.set.label + '". The customer may change any one: it then reads "' + T.mine.tags[0] + '" with the chip "' + T.mine.chips[0] + '". The tags used: "Set by LifeMap", "Your choice", "Assumed: add yours" (a suggested or planning rate in use, counted in "N details missing") and, only for the required choices, "' + T.notChosen.tags[0] + '". There is no "Use the standard" button any more. Law values stay "Set by Government · 2026" and fixed.'],
    ['Pension access age', 'A new LifeMap standard: "' + A.name + '": ' + A.label + '. Options "' + A.chips.join('" and "') + '". Wording: "' + A.by + '". Guidance: "' + A.guide + '" Source: ' + A.src + ' (as at ' + A.asat + '; verify before release: ' + (A.verify ? 'yes' : 'no') + '). In "What your plan assumes": "' + A.row.slice(0, 3).join('" · "') + '".'],
    ['Free retirement age (§27.3)', 'Any age from the customer\'s age + 1 up to plan-until age − 1 (the sample: ' + R.min + ' to ' + R.max + '). No hard limit of 50. The field help: "' + R.help + ' Choose the age you want to plan for, any age from ' + R.min + ' to ' + R.max + '." Calm one-line notes, never a block: at 40 or 45: "' + R.notes['40'] + '"; at 50 and 55: "' + R.notes['55'] + '"; at 60 or later: none. The partner\'s retirement age: at 40 or 45: "' + R.pnotes['40'] + '"; at 50 and 55: "' + R.pnotes['55'] + '".'],
    ['Early retirement in the engine', 'Income stops at the chosen age; the pension is drawn only from the access age (60, or 50 if the customer says their occupational scheme allows it); the years before it, and before the State Pension at 66, are paid from savings; any shortfall is shown. Retirement-goal % covered for the sample customer at ' + Z.early.map(e => e.age + ': ' + e.pct + '%').join(', ') + ' (it rises with the age, as it should).'],
    ['"Date has passed" (§27.1)', 'A goal whose age is before the customer\'s age today reads "' + PA.text + '" instead of "in -4 years", on the timeline chip ("' + PA.chip[0] + '"), in the goal list ("' + PA.whenEdit + '" when editing) and in the report, with a "' + PA.btn[0] + '" button. Checked with the sample customer set to age 45 and a Travel goal at 41.'],
    ['Number boxes (§27.2)', 'The unit (€, %, yrs, age) sits outside the typing area. Tested live: a long value typed into every visible number box (' + OV['390'].checked + ' boxes across Your assumptions, all 28 calculators, the timeline and Step 7) at 360, 390 and 1280 px: ' + (OV['360'].bad.length + OV['390'].bad.length + OV['1280'].bad.length) + ' overlaps or clipped values.'],
    ['Calculators (§27)', 'A calculator opened from Explore starts from the LifeMap standards (no gate for them). The customer\'s own figures still gate it: a market rate with no standard (mortgage rate, fund charges, card and loan APR), the State Pension, Illness Benefit, the retirement age. The words are unchanged ("Choose your … to see this" / "Add your … to see this", sections 1 and 4.7).']], { size: 15 }));
  push(imgGrid([{ file: 'S27-date-passed.png', caption: 'A goal whose date has passed' }], 1, 900)); }
  push(H2('7.16 Calculator audit fixes (independent audit, docs/calculator-audit-independent.md)'));
  { const AU = Z.audit, sent = (t, re) => (String(t).match(/[^.!?]*[.!?](?:\s|$)/g) || [String(t)]).map(x => x.trim()).filter(x => re.test(x)).join(' ');
  push(P('Each row shows what the tool says now, read from the running prototype with the standards and suggested rates chosen. The per-calculator sections (C01 to C28) carry the full screens.', { size: 18 }));
  push(table([1500, 2500, W - 4000], ['Tool', 'Fix', 'What the screen says now (verbatim)'], [
    ['C12', 'Bridge years and the lump-sum rule', sent(AU.c12.line, /State Pension you fund yourself|lump sum/)],
    ['C12', 'Standard Fund Threshold warning compares like with like', sent(AU.c12sft.line, /Standard Fund Threshold/)],
    ['C12', 'Retirement age at or before your age gates', '"' + AU.c12age.val + '" · ' + AU.c12age.line],
    ['C12', 'Retiring before the pension access age', sent(AU.c12early.line, /Most pensions/)],
    ['C22', 'Illness Benefit is paid for up to 24 months', 'Result "' + AU.c22cap.lbl + ' ' + AU.c22cap.val + '". ' + sent(AU.c22.line, /Illness Benefit is paid|designed|income protection/i)],
    ['C20', 'Range wording true in euros; no negative fall', sent(AU.c20.line, /fall|timeframes/)],
    ['C15', 'A withdrawal bigger than the pot', AU.c15big.val + ': ' + sent(AU.c15big.line, /run out in the first year/) + ' (row: ' + AU.c15big.rows[0].join(' = ') + ')'],
    ['C15', 'Early-access note when the start age is under 60', sent(AU.c15early.line, /Most pensions/)],
    ['C16', 'The same "first year" rule', AU.c16big.rows.map(r => r.join(' ')).join('; ')],
    ['C10', 'The money earns nothing while it waits; no cost when there is no growth', sent(AU.c10.line, /earns nothing|costs nothing/) + ' (and with growth: ' + sent(AU.c10b.line, /Waiting/) + ')'],
    ['C07', 'The deposit is clamped to the price, equity before selling costs, stamp duty on the price without VAT', sent(AU.c07clamp.line, /deposit can't|selling costs|excluding VAT/)],
    ['C01, C03', 'Stamp duty on a new home and Help to Buy', sent(AU.c01.line, /excluding VAT/) + ' (C03 says the same)'],
    ['C02, C28', 'Interest conventions', sent(AU.c02.line, /compounded monthly/) + ' · ' + sent(AU.c28.line, /effective yearly rate/)],
    ['C13', 'The extra contribution is level', sent(AU.c13.line, /same every year/)],
    ['C23', 'Optional repayment (workbook)', 'The workbook sheet "C23 Mortgage protection" has an optional input "Your actual monthly repayment (optional, 0 = work it out)"; the app shows the repayment it uses ("repaying €1,285 a month" on the sample).']], { size: 14 })); }
  push(H2('7.17 The workbook, version 2.7'));
  { const WB = XLX, GT = WB.gate;
  push(P('Deliverables/LifeGoals-Calculators.xlsx has ' + WB.sheets.length + ' sheets: the README, C01 to C28, the eight "Plan …" sheets, the Calculation register, Tax engine, Document reader spec, Your lists, Settings and Assumptions. The four "UI" sheets of the UI layer are appended separately by tools/build_ui_sheets.py and are not part of this document. README B2: "' + WB.readme + '"', { size: 17 }));
  push(table([2600, W - 2600], ['Item', 'What it says (verbatim)'], [
    ['Plan sheets (the main plan)', WB.planSheets.map(x => x[0] + ': ' + x[1]).join(' · ')],
    ['The gate on Plan results', 'Rows ' + GT.slice(0, 2).map(r => r[0]).join(' / ') + ' ...: ' + GT.slice(2, 6).map(r => r[0] + ' = ' + r[1]).join('; ') + '; "' + GT[6][0] + '" = ' + GT[6][1] + '; "' + GT[9][0] + '" = "' + GT[9][1] + '" (the card heading, identical to the app); the names on the card: "' + GT[8][1] + '"; "' + GT[11][0] + '": "' + GT[11][1] + '". ' + WB.how.C15],
    ['Goal limit warning', WB.how.C12],
    ['Retirement age, access age, "Date has passed"', WB.how.C16],
    ['Plan inputs', WB.planInputsB2 + ' Data validation: ' + WB.dv['Plan inputs'] + ' rules on Plan inputs, ' + WB.dv.Settings + ' on Settings.'],
    ['New Settings standard', '"' + WB.access.row[0] + '": ' + WB.access.row[1] + '; wording "' + WB.access.row[5] + '"; guidance "' + WB.access.row[8] + '". The Settings sheet lists ' + WB.settingsRows + ' rows (the app\'s ' + Object.keys(SET.s).length + ' standards plus the guidance figures and the inflation reading).'],
    ['Calculation register', WB.register.title + '. ' + WB.register.b2 + ' ' + WB.registerRows + ' rows; "Matched in test": ' + Object.entries(WB.registerCount).filter(([k]) => /^Matched/.test(k)).reduce((a, [, n]) => a + n, 0) + '.'],
    ['Budget note block', 'Assumptions sheet, rows ' + WB.budget.rows + ': "' + WB.budget.title + '" then "' + WB.budget.body + '"'],
    ['Calculation settings', 'Saved with ' + WB.calcPr + ' so Excel recalculates every formula when it opens.'],
    ['Investment standard', 'Set_inv ' + WB.inv.cell + ': ' + WB.inv.formula + ' = ' + WB.inv.value + '; Set_inv_Label reads "' + WB.label.value + '" (7.7).']], { size: 14 })); }
}
''')
open('b-body.js','w').write(s)
