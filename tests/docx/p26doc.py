s=open('b-body.js').read()
def rp(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]); s=s.replace(a,b)
# --- first page
rp("(journey-spec §14 to §25:","(journey-spec §14 to §26 and the fix rounds of 7 October (planner, developer):")
rp("§25 photos and two real videos)","§25 photos and two real videos, §26 What-if order and labelled example figures, and the planner and developer fix rounds)")
# --- 3.5 Step 7 wording (three, or four with a partner's income)
rp("Nothing blocks except three choices that only the customer can make. From the top: a card","Nothing blocks except the choices that only the customer can make: three, or four when a partner\\'s income is counted (7.9). The numbers below are for the sample customer, who has a partner with income, so the card says \"' + A.h3[0] + '\". From the top: a card")
rp("counter \"' + A.count + '\" (role=status; becomes \"1 of 3 chosen\", \"2 of 3 chosen\", \"3 of 3 chosen\") · the inflation chips (see 1.8) · Retirement age · Plan until age (life expectancy). Each starts blank with the tag \"Not chosen yet\". These three are never filled in for the customer","counter \"' + A.count + '\" (role=status; counts up to the number of choices; the sample already has the partner\\'s age) · the inflation chips (see 1.8) · Retirement age · Plan until age (life expectancy) · Your partner\\'s retirement age (only when a partner\\'s income is counted). Each starts blank with the tag \"Not chosen yet\". These are never filled in for the customer")
rp("Both are disabled until the 3 things are chosen;","Both are disabled until the required choices are made;")
rp("caption: 'Step 7 at the start: 0 of 3 chosen, both buttons off'","caption: 'Step 7 at the start: ' + A.count + ', both buttons off'")
rp("caption: 'After the standards button and the 3 choices: both buttons on'","caption: 'After the standards button and the required choices: both buttons on'")
# --- 7.1 list
rp("'Money personality \"watch out\" line for the Contented type: \"Jumping in before your safety net is in place.\"', ","'The money-personality \"watch out\" lines no longer say \"safety net\": the Explorer type\\'s line now reads \"' + require('./s26.json').dev.types.E[1] + '\" (reworded; it was Lifecast wording) and the Contented type\\'s line is \"' + require('./s26.json').dev.types.C[1] + '\".', ")
# --- 7.2 order row
a=s.index("  ['Order', 'Growth assumptions")
b=s.index("\n",a)
s=s[:a]+"  ['Order (journey-spec §26)', 'Heading \"What if…?\" and its line · section \"' + W2.sections[0] + '\" · section \"' + W2.head + '\" (goal chips, extra each month, one-off, and the live line) · the result line for the chosen goal (e.g. \"Travel goes from 28% to 58%\") · a collapsed block \"' + require('./s26.json').dev.wi.growSummary + '\" (Growth assumptions, the inflation choice, the \"Your assumptions\" link; closed until tapped) · \"Save as my preferred plan\" · \"Back to my plan\". The saving controls come first; nothing else about the card changed.'],"+s[b:]
# --- 7.3 print fallback
rp("If printing is blocked: \"Printing is blocked here. Open this page in your browser to save the PDF.\"'","If printing throws an error: \"Printing is blocked here. Open this page in your browser to save the PDF.\" Some viewers ignore print() without any error, so the page listens for the browser\\'s beforeprint event; if no print window opened within half a second the message becomes \"' + require('./s26.json').dev.print.nothing + '\" (shown as a problem, and kept on screen longer).'")
# --- 2.7 example figures (before section 3)
EX2 = r'''push(H2('2.7 Example figures in Explore tools (journey-spec §26)'));
{ const Z = require('./s26.json').dev, XL2 = Z.exLabel, ALLX = XL2.all;
  push(P('A calculator opened from Explore without the customer\'s own figures starts from the tool\'s example figures, and says so. Made-up personal figures may appear only here. As soon as the customer types a figure, has a statement or has a plan, their own figure replaces the example (data precedence is unchanged: statement, then typed, then plan, then example). With a plan the tool starts from the customer\'s own figures and shows no label.', { size: 18 }));
  push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Label at the top of the tool', '"' + XL2.fresh.top + '" in bold on a pale note (role="note"), above the category line. It is hidden when no input still holds an example figure.'],
    ['Label on the result', 'The same words in gold under the big result value (class exres), shown whenever the tool is showing a result made from example figures. Many tools first ask for a choice (for example an interest rate), so their result card, and its label, appear only after that choice.'],
    ['With a plan', 'The top label is hidden and the result label is not drawn (checked on the borrowing tool with the sample customer).'],
    ['Tools checked', 'All ' + XL2.fresh.n + ' tools carry the top label when opened from Explore with no profile (' + ALLX.filter(x => x[2]).length + ' of ' + ALLX.length + ').']], { size: 15 }));
  push(imgGrid([{ file: 'S26-example-figures.png', caption: 'Borrowing tool opened from Explore with no profile: the label at the top' }], 1, 1000)); }
'''
rp("push(H1('3. Rules and Your assumptions'));",EX2+"push(H1('3. Rules and Your assumptions'));")
# --- 7.5 to 7.14 (before the calculators loop)
NEW = r'''{ const Z = require('./s26.json'), XLX = require('./s26x.json');
  push(H2('7.5 Skip never ends at a wall: "Use the standards for the rest" (journey-spec §22, planner H1)'));
  push(P('A customer who makes the required choices and taps "Skip, show my results" used to meet a results page that asked for every other judgement figure. Now the gate itself carries a second card. One tap uses the standard for every choice that has a standard; the customer\'s own choices (retirement age, plan-until age, inflation, a partner\'s retirement age) are never filled in. Nothing is silent: each figure shows as the standard in Your assumptions and can be changed.', { size: 18 }));
  push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Gate (results, plan top)', '"' + Z.gate.res.title + '" · "' + Z.gate.res.also + '" (sample customer who made only the required choices) · button "' + Z.gate.res.btn + '"'],
    ['Second card', 'Title "' + Z.gate.std.title + '" (green card under the gate) · "' + Z.gate.std.p + '" · button "' + Z.gate.std.btn + '" (opens nothing: it applies the standards at once and the gate re-draws).'],
    ['Template', 'One tap uses the standard for {n} choice(s) you have not made ({names}). You can change any of them later in Your assumptions. {k} choice(s) will still be yours to make: {names}. The last sentence appears only when something is left. Singular and plural follow the count ("1 choice", "One choice will still be yours to make").'],
    ['Where it shows', 'On the results gate on My Plan, on the Home gate card (button "' + Z.gate.home.btn + '") and in the gate sheet. It shows only while a standard is still not chosen.'],
    ['After the tap', 'The gate now asks only for the figures that have no standard: "' + Z.gateAfter.missing.join('", "') + '". Then the card is gone. Once those are given, the results show.'],
    ['Defect found while documenting', 'The "will still be yours to make" list repeats every missing item (' + Z.gate.nMissing + ' in the sample) instead of only the ' + Z.gate.nLeft.length + ' that have no standard (' + Z.gate.nLeft.join(', ') + '): the code compares two separately built lists by identity. Reported to the web developer; this document shows what the prototype does today.']], { size: 15 }));
  push(imgGrid([{ file: 'S26-gate-results.png', caption: 'My Plan for a customer who skipped: the gate and the standards card below it' }], 1, 1000));
  push(H2('7.6 Another property\'s mortgage: no hidden 25-year default (planner H2)'));
  push(P('A mortgage on another property (4.8.2) needs either the years left or the monthly repayment. Before, with neither, the plan quietly assumed 25 years. Now the plan asks. The main-home mortgage already had this gate.', { size: 18 }));
  push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Gate', '"' + Z.mort2.gate + '" · "' + Z.mort2.also + '" · button "' + Z.mort2.btn + '" (opens Your finances at Liabilities). Shown when the item has a balance but neither a monthly repayment nor years left.'],
    ['Once either is given', 'The gate is gone. With ' + 18 + ' years left on the sample balance of €180,000 the repayment is worked out from the balance, the rate and the years (about €' + Z.mort2.pay.toLocaleString('en-IE') + ' a month for the sample balance); a typed repayment is used as typed.'],
    ['Blank items', 'An item with no balance counts as €0 and asks nothing (4.8.2).']], { size: 15 }));
  push(imgGrid([{ file: 'S26-mort2-gate.png', caption: 'Results gate for a mortgage on another property with no years or repayment' }], 1, 1000));
  push(H2('7.7 Investment standard: derived, not typed (planner H3)'));
  { const I = Z.inv;
  push(P('The investment growth standard used to be a typed 3.5%, which did not match its own explanation. It is now worked out in the app and in the workbook from the same inputs, so it cannot drift. Plan goals of five years or more use it; the growth, regular-investing, fees and real-return tools use the growth before fees and tax.', { size: 18 }));
  push(table([2600, W - 2600], ['Part', 'Specification (verbatim)'], [
    ['Standard', '"' + I.inv.n + '": ' + (I.inv.v * 100).toFixed(1) + '% (cautious ' + (I.inv.vc * 100).toFixed(1) + '%, one point less growth). Wording shown with it: "' + I.inv.by + '". Source line: "' + I.inv.src + '". Guidance: "' + I.inv.guide + '"'],
    ['Input', '"' + I.invGross.n + '": ' + (I.invGross.v * 100).toFixed(0) + '% ("' + I.invGross.by + '"). Source: ' + I.invGross.src + '. Guidance: "' + I.invGross.guide + '"'],
    ['Charges used', '"' + I.fundChg.n + '": ' + (I.fundChg.v * 100).toFixed(0) + '% (the figure from the Market rates group); if no charges figure is set the app uses ' + (I.chgStd * 100).toFixed(0) + '%.'],
    ['Rule', 'g = growth before fees and tax, c = charges, e = exit tax (' + Math.round(I.exit * 100) + '%), y = ' + I.deemed + ' years (the deemed-disposal rule). f = (1 + g - c)^y. Standard = (( f - e × (f - 1) )^(1/y) - 1), rounded to 0.1%. Cautious takes 1 point off g first. Worked example: g 5%, c 1%: ' + (I.inv.v * 100).toFixed(1) + '%; g 6%: ' + (I.at6 * 100).toFixed(1) + '%.'],
    ['Workbook', 'Settings sheet cells Set_inv (' + XLX.inv.cell + '), Set_inv_Cautious (' + XLX.cautious.cell + ') and Set_inv_Label (' + XLX.label.cell + ') hold formulas, not typed values. Set_inv: ' + XLX.inv.formula + ' = ' + XLX.inv.value + '. The label cell reads "' + XLX.label.value + '" (the workbook says "forecast" and points to Suggest_Fund_Charges; the app says "prediction" and reads the Settings charges figure: see Appendix B).'],
    ['Limits', 'Partner figures for either growth figure must be inside the allowed range (7.12). A change to growth before fees and tax or to the charges moves the standard.']], { size: 15 })); }
  push(H2('7.8 "Your main strength" is only ever a goal that is fully covered (planner M1)'));
  push(P('The results headline used to call a goal a strength even when the customer was spending more than came in. The three outcomes:', { size: 18 }));
  push(table([3500, W - 3500], ['When', 'The strength line says (verbatim)'], [
    ['A goal is at least 95% covered and working-year spending is paid for', '"' + Z.strength.sample + '" (the best covered goal; for retirement: "Your pension and savings cover retiring at {age}")'],
    ['Working-year spending is more than comes in (a shortfall of more than the larger of €500 and 2% of that year\'s needs in any working year)', '"' + Z.strength.over + '"'],
    ['No goal is at least 95% covered', '"' + Z.strength.none + '"'],
    ['Where else it shows', 'The "Your main strength" card, its explain sheet and the Ask answer "What is my main strength?". When there is no strength the explain sheet reads "We only call something a strength when a goal is fully covered and your everyday spending is paid for."']], { size: 15 }));
  push(H2('7.9 A partner\'s retirement age is the fourth required choice; "Choose N things" (planner M2)'));
  push(table([2600, W - 2600], ['Part', 'Copy and behaviour (verbatim)'], [
    ['When a partner\'s income is counted', 'Step 7 card "' + Z.p4partner.h3 + '": "' + Z.p4partner.p + '" · counter "' + Z.p4partner.count + '" · fields in order: ' + Z.p4partner.order.join(', ') + '. The extra field: "' + Z.p4partner.field + '" with "' + Z.p4partner.help + '" Never defaulted.'],
    ['With no partner income', 'Card "' + Z.p4single.h3 + '": "' + Z.p4single.p + '" · counter "' + Z.p4single.count + '".'],
    ['Where else', 'Also in Your assumptions (Length group, next to the retirement ages) and in the gate: "Choose your partner\'s retirement age to see this" until it is chosen. The partner\'s age is gated in every partner mode that uses their income ("Add your partner\'s age to see this").'],
    ['What the plan does with it', 'The partner\'s pay is counted until that age, then only their State Pension. "Known limits" now reads: "' + Z.knownLimit + '"']], { size: 15 }));
  push(imgGrid([{ file: 'S26-step7-four.png', caption: 'Step 7 with a partner\'s income: four things to choose' }], 1, 1000));
  push(H2('7.10 Card and loan rate not known (planner M4)'));
  push(P('A customer with a card or loan balance and no rate used to meet a dead end. Now two buttons sit under the rate box, both explicit choices, never silent.', { size: 18 }));
  push(table([2600, W - 2600], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Before a choice', 'Field "' + Z.rates.before.label + '". Buttons: "' + Z.rates.before.chips.join('" and "') + '". Help: "' + Z.rates.before.small + '" Gates: "' + Z.rates.gateTxt.join('", "') + '".'],
    ['Legal limit button', 'Sets the card rate to ' + (Z.rates.cap * 100).toFixed(0) + '% (the legal limit for new cards: cautious, not typical). Version note "Credit-card rate: the legal limit for new cards". "What your plan assumes" row: "' + Z.rates.rowCap[0].join('" · "') + '".'],
    ['Leave it for my adviser', 'Sets a planning rate (' + (Z.rates.adv.fb * 100).toFixed(0) + '% for cards) and remembers that the customer does not know their rate. Version note "Rate left for my adviser (planning rate used)". Note under the field: "' + Z.rates.adv.note + '" Row: "' + Z.rates.row[0].join('" · "') + '". Typing a rate (or choosing the limit) clears the adviser flag.'],
    ['Other loans', 'The same "I don\'t know my rate" button, without the legal-limit button (the ' + (Z.rates.cap * 100).toFixed(0) + '% cap is for new credit cards only). Row before a choice: "' + Z.rates.row[1].join('" · "') + '".']], { size: 15 }));
  push(H2('7.11 Emergency fund goal amount, and a repayment that barely covers the interest (planner M7, M8)'));
  push(table([2600, W - 2600], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Goal amount', 'An automatic Emergency fund goal is exactly months × essential monthly spending, with no rounding to €1,000: ' + Z.emerg.months + ' months × €' + Z.emerg.essM.toLocaleString('en-IE') + ' = €' + Z.emerg.expect.toLocaleString('en-IE') + ' for the sample customer. The amount and the months always agree.'],
    ['A typed amount', 'If the customer types their own goal amount it is kept, and the goal box says: "' + Z.emerg.note + '" (a typed €15,000 on the sample).'],
    ['Repayment barely covers interest', 'For a credit card or other loan, when the rate is known (typed or chosen) and the monthly repayment is under the interest plus 1% of the balance (for example €6,000 at 22%: under €' + Math.round(Z.paylow.thresh) + ' a month), the item shows in the Check your details list with: "' + Z.paylow.msg + '". Not shown with no rate. The mortgage keeps its own line: "' + Z.paylow.mort + '".']], { size: 15 }));
  push(H2('7.12 Partner override: allowed ranges (planner M6)'));
  push(P('A partner (a lender or credit union) can set their own figure for a standard in the admin view (3.7.3). Each figure now has an allowed range. Outside it the figure is refused: "That figure is outside the allowed range, so it was not used. {range}." (role="alert", under the field). Growth standards have a ceiling so a provider cannot make a plan look better than it is; the tax-free lump sum can never be above the 25% legal limit. The range is printed under every field.', { size: 18 }));
  push(table([4800, W - 4800], ['Standard (Settings name)', 'Range shown (verbatim)'], Z.bounds.map(b => [b[1] + ' (Set_' + b[0] + ')', b[2]]), { size: 14 }));
  push(H2('7.13 Developer round (7 October): what changed on screen'));
  push(table([2600, W - 2600], ['Item', 'Copy and behaviour (verbatim)'], [
    ['No invented age', 'Step 1 "Your age" starts blank: the box shows "' + Z.dev.age.ph + '" and "' + Z.dev.age.nextText + '" is off until an age of 18 or more, a partner answer and the number of dependants are given. Me, My details shows "Age: ' + Z.dev.me.match(/Age(Not given yet)/)[1] + '". A new customer has no age anywhere in the app. Calculators use their own labelled example age (2.7).'],
    ['Add to my plan without an age', 'The sheet reads "' + Z.dev.addAge.h2 + '": "' + Z.dev.addAge.sub + '" Buttons "' + Z.dev.addAge.btns.join('" and "') + '".'],
    ['What-if order', 'See 7.2: saving controls first, growth and inflation collapsed below.'],
    ['Example figures', 'See 2.7.'],
    ['Dialogs', 'Every dialog is named by its own heading (aria-labelledby the h2; "Dialog" only if there is none) and the heading takes focus when nothing else should. On every close (Esc, ✕ or any button) focus returns to the control that opened it, or to the screen heading, never to the page body. The close button is 44 × 44 px.'],
    ['Plan report dialog', 'The report is a dialog named "' + Z.dev.report.label + '". On opening, focus goes to "Print / save as PDF"; Tab and Shift+Tab stay inside it (' + Z.dev.report.tab2 + ' is next); the page behind is inert while it is open; Esc closes it and focus goes back to the button that opened it (' + Z.dev.report.afterEsc.focus + ').'],
    ['Focus ring and targets', 'A two-tone focus ring on every control (3 px ink outline with a white halo, so it shows on light and dark surfaces); white ring on dark surfaces. Controls are at least 44 px tall: summaries, side-menu buttons, the assumptions toggles, report bar buttons. Timeline chips (36 to 39 px) keep their size because script positions them; the inline number boxes are text boxes.'],
    ['One banner, not two', 'When details are missing the results show one banner: "' + Z.dev.banner.miss.replace('ℹ️', '') + '" The separate "rough picture" banner shows only when nothing is missing but sections were skipped or quality is low.'],
    ['Print fallback', 'See 7.3: "' + Z.dev.print.opening + '", then, if nothing opened, "' + Z.dev.print.nothing + '".'],
    ['Explorer watch-out', 'The Explorer money personality reads: "' + Z.dev.types.E[1] + '" (no longer "safety net").'],
    ['Colour tweaks for contrast', 'Teal text and status colours were darkened slightly (--sea-d #0A7068, --ok-t #17703F) so small text keeps 4.5:1; the chapter colours were set as tokens.']], { size: 15 }));
  push(imgGrid([{ file: 'S26-age-blank.png', caption: 'Step 1: age blank, Next off' }, { file: 'S26-add-age-sheet.png', caption: 'Add to my plan with no age' }, { file: 'S26-whatif-order.png', caption: 'What if…? with the saving controls first' }], 3, 1100));
  push(H2('7.14 Workbook changes in this round'));
  push(table([2600, W - 2600], ['Item', 'What it says (verbatim)'], [
    ['README', '"' + XLX.readme + '"'],
    ['Budget note block', 'Assumptions sheet, rows ' + XLX.budget.rows + ': "' + XLX.budget.title + '" then "' + XLX.budget.body + '"'],
    ['Calculation settings', 'The workbook is saved with ' + XLX.calcPr + ' so Excel recalculates every formula when it opens.'],
    ['Investment standard', 'Formulas in the Settings sheet (7.7).']], { size: 15 })); }
'''
rp("for (const c of data.calcs) { const S = SPEC[c.id], cat = CATN[c.cat],",NEW+"for (const c of data.calcs) { const S = SPEC[c.id], cat = CATN[c.cat],")
# --- Appendix B
rp("  '**Videos (§25)**:","  '**Defects found in the prototype and workbook while documenting (reported, not fixed)**: (1) the \"Use the standards for the rest\" card lists every missing item as \"still yours to make\" instead of only those without a standard (7.5); (2) the workbook label Set_inv_Label says \"forecast\" and the app says \"prediction\", and the workbook formula reads Suggest_Fund_Charges while the app reads the Settings charges figure, so a partner change to the charges moves the app but not the workbook (7.7).',\n  '**Videos (§25)**:")
open('b-body.js','w').write(s)
