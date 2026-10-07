// ---------- 4 Your finances (journey-spec §15) ----------
const EX = require('./ex.json');
push(H1('4. Your finances: "Not sure? See an example"'));
push(P('Journey-spec §15: every customer\'s money is different, so we never fill in a figure for them. Each Your finances field (' + EX.cards.length + ' fields across the 6 sections) has the link "Not sure? See an example". It opens a short example card built from the sample customers Aoife and Cian (SAMPLE_FIN, the same figures as the sample customer). The card never fills the field. "Not sure? Estimate for me" and "I don\'t have this" are removed everywhere.'));
push(H2('4.1 The link'));
const LK = EX.cards[0].link;
push(table([2300, W - 2300], ['Part', 'Specification (verbatim)'], [['Text', LK.text], ['Markup', '<div class="fhelp"><button class="link" data-a="fex" data-p="{field}" aria-haspopup="' + LK.haspopup + '">' + LK.text + '</button></div>'], ['Style', '.link{' + cssRule('.link') + '} .fhelp{' + cssRule('.fhelp') + '}'], ['Placement', 'Under the field: after the input, the statement note, the hint and any "Worked out from your figures" line. On choice fields, under the chips. Every one of the ' + EX.cards.length + ' fields has it (checked).'], ['What it does', 'Opens the example card for that field. The field value and its status do not change (checked for all ' + EX.cards.length + ' fields).']], { size: 15 }));
push(imgP('E-field-cash.png', 330, 200), cap('Cash savings field with the link (sample customer)'));
push(H2('4.2 Card layout'));
const C0 = EX.cards.find(c => c.k === 'cash');
push(table([2300, W - 2300], ['Part, in order', 'Specification (verbatim)'], [
  ['Container', 'Bottom sheet. .sheet-bg{' + cssRule('.sheet-bg') + '} .sheet{' + cssRule('.sheet') + '}; grab handle .grab; close button .sx (✕, aria-label "' + C0.close + '").'],
  ['1. Title', 'h2.t id="ex-t": "Example: {field label}", e.g. "' + C0.title + '".'],
  ['2. Options (choice fields only)', 'ul.small: one item per option, "<b>{option}</b>: {meaning}" (the colon and meaning are left out when the meaning is empty).'],
  ['3. Example sentence', 'p.sub id="ex-s": one sentence about Aoife and Cian with their sample figures, ending with what they enter or pick, e.g. "' + C0.sentence + '"'],
  ['4. Where to find yours', 'p.small: "📍" (aria-hidden) + bold "Where to find yours:" + one line naming the document or app, e.g. "' + C0.where + '"'],
  ['5. Enter 0', 'p.small, bold: "' + C0.zero + '" Euro-amount fields only (not on ages, years or choices).'],
  ['6. Small print', 'p.small in var(--muted): "' + C0.small + '"'],
  ['7. Button', 'Gold primary .btn: "' + C0.button + '" (closes the card).']], { size: 15 }));
push(imgGrid([{ file: 'E-card-cash.png', caption: 'Euro field: Cash savings' }, { file: 'E-card-home.png', caption: 'Choice field: Your home' }, { file: 'E-card-age.png', caption: 'Number field: Your age (no "Enter 0")' }], 3, 700));
push(imgGrid([{ file: 'E-card-life.png', caption: 'Yes / No / Not sure: Life cover' }, { file: 'E-card-sp.png', caption: 'State Pension' }, { file: 'E-card-mortPayM.png', caption: 'Monthly repayment' }], 3, 700));
push(H2('4.3 Dialog behaviour'));
const DG = EX.dialog;
['**Semantics**: role="' + C0.role + '", aria-modal="' + C0.modal + '", aria-labelledby="' + C0.labelledby + '" (the title), aria-describedby="' + C0.describedby + '" (the sentence). The link has aria-haspopup="dialog".',
 '**Opening**: tapping the link opens the card; focus moves to "' + DG.openFocus + '".',
 '**Focus trap**: Tab from "' + DG.tab2 + '" wraps to the close button (✕), Tab again returns to "' + DG.tab2 + '", Shift+Tab wraps backwards. Focus never leaves the card while it is open.',
 '**Closing**: "Got it", the ✕ button, Escape, or a tap on the dimmed backdrop. After "Got it", ✕ or Escape, focus returns to the link that opened the card (checked: "' + DG.escape.focus + '").',
 '**Never fills anything**: the field value and status are unchanged after the card closes (checked for all ' + EX.cards.length + ' fields).',
 '**Motion**: the sheet slides up (animation "up"); off under prefers-reduced-motion.'].forEach(t => push(B(t)));
push(H2('4.4 All ' + EX.cards.length + ' example cards (verbatim)'));
push(P('Every card has the title "Example: {field label}", the small print "' + C0.small + '" and the button "' + C0.button + '". The texts come from the sample customers\' figures, so they change if the sample data changes.', { size: 18 }));
const SECN = ['About you', 'Income and expenses', 'Assets', 'Liabilities', 'Protection', 'Pension'];
for (let si = 0; si < 6; si++) { const cs = EX.cards.filter(c => EX.ff[c.k].sec === si); if (!cs.length) continue;
  push(H3('4.4.' + (si + 1) + ' ' + SECN[si]));
  push(table([1700, 2100, 3000, 2266, 800], ['Card title', 'Options: meaning', 'Example sentence', 'Where to find yours', 'Enter 0 line'], cs.map(c => [c.title, c.opts.length ? c.opts.map(o => o[0] + (o[1] ? ': ' + o[1] : '')).join(' · ') : '—', c.sentence, c.where.replace(/^📍 Where to find yours: /, ''), c.zero ? 'Yes' : '—']), { size: 14 })); }
push(H2('4.5 Statuses on Your finances fields'));
const TG = EX.tags;
push(table([3000, 1500, W - 4500], ['Tag (verbatim)', 'Class', 'When'], [[TG.doc[0], '.tag.doc', 'Read from an uploaded document, with the reader\'s confidence ("' + TG.docNoConf[0] + '" when there is none)'], [TG.fixed[0], '.tag.doc', 'Read from a document and corrected by the customer on "We read these values"'], [TG.typed[0], '.tag.typed', 'Typed by the customer, including 0'], [TG.pre[0], '.tag.pre', 'Carried over from the customer\'s first answers (name, age, retirement age)'], ['From your answers', '.tag.pre', 'The partner and dependants controls in About you'], [TG.none[0], '.tag.none', 'Left blank. Counts as €0 and stays on the checklists until added'], [TG.look[0], '.tag.look', 'A figure that needs a second look (e.g. a statement over 12 months old). Shown ahead of any other tag']], { size: 15 }));
push(P('Removed by §15: "≈ Estimated" and "Confirmed none". **Data precedence**: document > customer-typed > (nothing: ❓ Missing). A statement figure is never overwritten by a later typed one: the typed figure is kept and the note reads "' + TG.docNote + '" (example). Removing the statement brings the typed figure back.', { size: 18 }));
const WO = EX.p3.liab.filter(f => f.worked);
push(P('**Worked out from your figures**: calculations from the customer\'s own figures, never guesses about the person. Shown as a small teal line (var(--sea-d), id "wo-{field}") under the field, which keeps its own status tag:', { size: 18 }));
push(table([2400, W - 2400], ['Field', 'Line (verbatim template · example)'], [['Monthly repayment (mortgage)', 'Worked out from your figures: about {€} a month, from your balance, rate and years left. Type yours to replace it. · "' + WO[0].worked + '" Shown when the balance and years left are given but no repayment.'], ['Credit cards / Other loans: monthly repayment', 'Worked out from your figures: {€} a month clears it in 5 years, because «the repayment given doesn\'t cover the interest|no repayment was given». Type yours to replace it. · "' + WO[1].worked + '"']], { size: 15 }));
push(imgP('E-p3-liab.png', 300, 900), cap('Liabilities: From document, ❓ Missing with a worked-out repayment, ✏️ Your figure (0) with a worked-out repayment'));
push(H2('4.6 Checklists'));
const CK = EX.check;
push(P('**Check your details** (plan builder step 7) lists only ⚠️ Needs a look and ❓ Missing items; a section left completely empty is one row ("{emoji} {section} · skipped", "Not added yet, so it counts as €0 for now"; Protection: "Not added yet"). Everything else folds into "✅ {n} details look good" with each field\'s tag. Rows for the example below:', { size: 18 }));
push(table([600, 2500, 1500, W - 6100 - 1500, 1500], ['Icon', 'Field', 'Section', 'Line (verbatim)', 'Actions'], CK.rows.map(r => [r.icon, r.title, r.sec.replace(/^· /, ''), r.line, r.actions.join(' · ')]), { size: 14 }));
push(P('My money has the same list as a card "' + EX.money.title + '": ' + EX.money.rows.map(r => '"' + r[0] + '" + "' + r[1] + '"').join('; ') + '.', { size: 18 }));
push(imgGrid([{ file: 'E-p4.png', caption: 'Check your details' }, { file: 'E-money.png', caption: 'My money · To sharpen your plan' }], 2, 520));
push(H2('4.7 In the calculators'));
const CG = EX.calc, NM = { repayment: 'C02', overpay: 'C04', ratechange: 'C05', term: 'C06', mortgageprotect: 'C23' };
push(P('A personal figure the tool needs but Your finances does not have is never filled in. Example: years left on the mortgage. The box stays blank with the tag "Not chosen yet", and the result card reads "Add your {label} to see this"; other missing items follow as "Also still to add or choose: {items}." "Add to my plan" shows the toast "Add your {label} first". Mortgage balance known, years left missing (sample customer):', { size: 18 }));
push(table([1200, 2400, W - 3600], ['Tool', 'Blank input', 'Result gate (verbatim)'], Object.entries(NM).map(([id, n]) => { const x = CG[id + '-noyears'], f = x.dom.fields.find(f => f.kind === 'blank'); return [n, f.label, x.dom.gate.b + (x.dom.gate.also ? ' · ' + x.dom.gate.also : '')]; }), { size: 15 }));
push(P('Worked-out figures in calculators carry the tag "Worked out from your figures" (.tag.pre) after the label, with the same line under the slider minus "Type yours to replace it.":', { size: 18 }));
const WT = [['C25 Monthly surplus', CG['surplus-worked']], ['C27 Debt repayment', CG['debtpay-worked']]];
push(table([2000, 2800, W - 4800], ['Tool', 'Input (tag)', 'Line under the slider (verbatim)'], WT.flatMap(([n, x]) => x.dom.fields.filter(f => f.guide && /^Worked out/.test(f.guide)).map(f => [n, f.label + ' · Worked out from your figures', f.guide])), { size: 15 }));
push(imgGrid([{ file: 'E-repayment-gate.png', caption: 'C02: Add your term to see this' }, { file: 'E-surplus-worked.png', caption: 'C25: worked-out essentials' }, { file: 'E-debtpay-worked.png', caption: 'C27: worked-out payment' }], 3, 260));
push(P('A stated monthly mortgage repayment (from a document or typed) is used by C02, C04 and C23 while the mortgage fields are untouched; a repayment the app works out is never used there.', { size: 18 }));

// ---------- 5 LifeMap (journey-spec §16) ----------
push(H1('5. LifeMap name and cover'));
push(P('Journey-spec §16: the product is **LifeMap** (by DigiPro.AI). Every customer-facing string in the prototype, the workbook and this document says LifeMap; file names stay as they are for now (LifeGoals-Customer-Journey-Prototype.html, LifeGoals-Calculators.xlsx, this .docx).'));
push(H2('5.1 Cover (D0)'));
const CV = EX.cover;
push(table([2300, W - 2300], ['Part', 'Specification (verbatim)'], [['Photo', 'Full-bleed photo of a winding road through Irish countryside (to be supplied and licensed). It is one CSS custom property, --cover-photo, on :root; until the photo arrives it holds a drawn placeholder (sky, green hills, a winding road). Position: center 30%, cover.'], ['Shade', 'Navy gradient over the photo, clear at the top and dark at the bottom: .cover-shade{' + cssRule('.cover-shade') + '}. Short screens start it higher.'], ['Logo', CV.logo + ' (mark + wordmark, navy on the sky)'], ['Top right', '"' + CV.invite + '" (white pill, navy text; opens "Enter your invite code")'], ['Headline (h2, focused on arrival)', CV.h], ['Line', CV.line], ['Button', CV.btn + ' (gold, full width; goes to D1)'], ['Under the button', CV.under], ['Link', '"' + CV.why + '" (white; opens "Why we ask")'], ['Nothing else', 'No trust line and no "Guidance, not advice." on the cover (that stays wherever results are shown).']], { size: 15 }));
push(imgP('B-cover.png', 300, 650), cap('Cover at 390 × 844, with the placeholder photo'));
push(P('Contrast: white text measured against the lightest pixel behind it is at least 9.2:1 at 390 × 844, 1280 × 800, 844 × 390 and 360 × 640; the invite pill is at least 4.97:1.', { size: 16, color: MUTED }));
push(H2('5.2 Other §16 changes the calculators touch'));
push(table([2600, W - 2600], ['Where', 'Now (verbatim)'], [['D1 title', EX.d1.h + ' (chips unchanged, incl. "' + EX.d1.chips.find(c => /safety net/.test(c)) + '")'], ['Goal tile', EX.tile.e + ' ' + EX.tile.t + ' (was "Build a safety net"; no helper line)'], ['C11 Add to my plan', 'The goal is named "' + EX.tile.t + '" too (sheet title "' + data.sheets['emergency-chosen'][1] + '")'], ['Discover Q8', EX.q8.h + ' / ' + EX.q8.sub], ['Q8 answers', EX.q8.o.map(o => o[0] + ' ' + o[1] + ' (' + o[2] + ')').join(' · ')]], { size: 15 }));
push(imgP('B-q8.png', 260, 560), cap('Discover Q8, road version'));

