// ---------- document ----------
const children = [];
const spacer = () => new Paragraph({ children: [], spacing: { after: 60, line: 120 } });
const push = (...x) => x.forEach(y => { if (Array.isArray(y)) return push(...y); children.push(y); if (y instanceof Table) children.push(spacer()); });

// Cover
push(new Paragraph({ children: [run('LifeGoals', { size: 28, bold: true, color: SEA_D })], spacing: { before: 2400, after: 120 } }),
  new Paragraph({ children: [run('Calculators: UI/UX build specification', { size: 52, bold: true, color: INK })], spacing: { after: 200 } }),
  new Paragraph({ children: [run('An exact-replica specification of every calculator in the LifeGoals customer journey prototype (' + data.calcs.length + ' calculators, C01 to C' + String(data.calcs.length).padStart(2, '0') + ')', { size: 26, color: MUTED })], spacing: { after: 600 } }),
  kv([['Source of truth', 'LifeGoals-Customer-Journey-Prototype.html (CALCS array, calculator screen V.CALC, fieldR value boxes, calcOut result card, inflation chips, "Adjust for inflation" switch, statement uploads DOCT)'], ['Prepared for', 'Pooja Tirupati, Proposition owner'], ['Prepared by', 'UI/UX design, LifeGoals team'], ['Date', '1 October 2026'], ['Companion file', 'Calculator workbook (Excel) built in parallel by the web developer. Sheet "Cnn" holds the maths for calculator Cnn.'], ['Status', 'Guidance, not advice. All figures are illustrative.']]),
  brk());
push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Contents', font: FONT })], spacing: { after: 160 } }), new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-1' }));
// Purpose
push(H1('Purpose and how to use this document'),
  P('This document lets a designer and developer rebuild every Explore calculator exactly as it behaves in the prototype: the same words, the same numbers, the same limits, the same states. Every label, default, limit and line of copy here was taken from the prototype source and then checked automatically against the live screen (see the check report, uiux-spec-check.md).'),
  H3('How to use it'),
  B('**Design system** (section 1) gives the tokens, type, components and accessibility rules that every calculator shares. Build these once.'),
  B('**Explore structure** (section 2) shows where calculators live: the 6 calculator groups, the "Focus on one area" topics and the statement-upload cards.'),
  B('**One section per calculator** (C01 to C' + String(data.calcs.length).padStart(2, '0') + ', in CALCS order). Each has screenshots, an inputs table, the result card copy with {placeholders}, states and edge cases, actions and accessibility notes.'),
  B('**Maths lives in the Excel workbook.** This document names each dynamic value and points to sheet "Cnn". It does not re-state formulas, so there is one source for the maths.'),
  B('**Appendix A** is the copy deck: every string, per calculator. **Appendix B** lists open points and prototype defects to decide on.'),
  H3('Conventions'),
  table([2300, W - 2300], ['Notation', 'Meaning'], [
    ['{name}', 'A dynamic value. Its format and meaning are in the calculator\'s placeholder table; the maths is in Excel sheet Cnn.'],
    ['«A|B»', 'One of the options, chosen by the rule in the "Shown when" column. An empty option («text|») means nothing is shown.'],
    ['★', 'In screen-value tables: the field shows the green "From your statement" tag.'],
    ['Verbatim', 'Text in quotes or in the copy columns is exact, including punctuation: straight apostrophes (\'), the multiplication sign ×, the middle dot ·, the ellipsis …, and the minus sign − (U+2212) in negative euro amounts.'],
    ['Default state', 'The calculator opened from Explore before a plan exists (no figures given). The "On screen" column shows what the customer actually sees, which can differ from the CALCS default where the tool always pre-fills (marked ⚠).'],
    ['Screenshots', '390 px wide (device scale 2). Full-screen captures show the whole scrolling screen at full length; on a 390×844 phone the content scrolls between the fixed header and tab bar.'],
  ], { size: 15 }),
  H3('Value formats'),
  table([1700, 2000, W - 3700], ['Format', 'Name', 'Rule'], Object.entries(TYPES).map(([k, v]) => [k, v[0], v[1]]), { size: 15 }),
);


// ---------- 1 Design system ----------
push(H1('1. Design system'));
push(P('Visual language: the "Teal & Navy" theme. Values below are copied verbatim from the prototype CSS.'));
push(H2('1.1 Colour tokens'));
const hexOf = v => (v.match(/^#([0-9A-Fa-f]{6})$/) || [])[1];
push(table([1900, 1500, 900, W - 4300], ['Token', 'Value', 'Swatch', 'Use'], tokens.filter(t => !/^--f[hb]$/.test(t[0])).map(([k, v]) => [k, v, hexOf(v) ? cell('', 900, { fill: hexOf(v) }) : '—', TOKEN_USE[k] || (/-t$/.test(k) ? 'Status text colour (passes 4.5:1 on white and on its -l tint)' : /-l$/.test(k) ? 'Status tint (background)' : /^--(good|nudge|alert|sunny|showers|storm|ok|dip|gap)/.test(k) ? 'Status fill (fills only, never text)' : /^--(plain|mark)/.test(k) ? 'Header gradient / brand mark' : '')]), { size: 15 }));
push(P('Other fixed colours used by the calculator screen: result-card body text #DCE7F2; result-card row divider rgba(255,255,255,.14); what-if card border #B9C9D6 (dashed); value-box underline #8CC7BF (dashed); statement card border #B5E3DB; page background behind the phone #E4ECE8; neutral tag background #EEF2F0.', { size: 18, before: 80 }));
push(H2('1.2 Typography'));
push(table([2200, W - 2200], ['Item', 'Value (verbatim)'], [
  ['Heading font (--fh)', tokens.find(t => t[0] === '--fh')[1]], ['Body font (--fb)', tokens.find(t => t[0] === '--fb')[1]],
  ['Web font load', 'Google Fonts: Bricolage Grotesque 500, 700, 800; Figtree 400, 500, 600, 700, 800; display=swap'],
  ['Heading rule', 'h1, h2, h3: font-family var(--fh); letter-spacing -.01em'],
]));
push(H3('Type scale used on calculator screens'));
const TS = [['Screen title (h2.t)', 'h2.t', 'Bricolage Grotesque'], ['Question / subtitle (.sub)', '.sub', 'Figtree'], ['Category eyebrow (.eyebrow)', '.eyebrow', 'Figtree'], ['Field label (.flabel)', '.field>label,.flabel', 'Figtree'], ['Small text (.small)', '.small', 'Figtree'], ['Tip note (.note)', '.note', 'Figtree'], ['Disclaimer (.disc)', '.disc', 'Figtree'], ['Tag (.tag)', '.tag', 'Figtree'], ['Chip (.chip / .chip.sm)', '.chip', 'Figtree'], ['Hint (.nbhint)', '.nbhint', 'Figtree'], ['Section heading (.sec h3)', '.sec h3', 'Bricolage Grotesque'], ['List row title (.goal b)', '.goal b', 'Figtree']];
const ruleFor = s => { try { return cssRule(s); } catch (e) { const m = HTML.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{([^}]*)\\}')); return m ? m[1] : ''; } };
push(table([2600, 1700, W - 4300], ['Element', 'Font', 'CSS (verbatim)'], TS.map(([n, s, f]) => [n, f, ruleFor(s)]).concat([
  ['Result headline value', 'Bricolage Grotesque', 'font-family:var(--fh);font-size:36px;font-weight:800;margin:4px 0'],
  ['Result line', 'Figtree', 'margin:0;font-size:14px;line-height:1.5;color:#DCE7F2'],
  ['Result rows', 'Figtree', 'justify-content:space-between;border-top:1px solid rgba(255,255,255,.14);padding:8px 0;margin-top:8px;font-size:13.5px (value in bold)'],
  ['Result eyebrow', 'Figtree', '.eyebrow with color:var(--sun)'],
]), { size: 15 }));
push(H2('1.3 Radii, shadows and spacing'));
push(table([2600, W - 2600], ['Element', 'CSS (verbatim)'], [
  ['Card (.card)', cssRule('.card')], ['Card stack (.card+.card)', cssRule('.card+.card')], ['Calculator cards', 'Inputs card, inflation card: margin-bottom:12px. What-if card: margin-top:12px;border:1.5px dashed #B9C9D6;box-shadow:none'],
  ['Result card', '.card with background:var(--ink);color:#fff'], ['Statement card (.card.pst)', cssRule('.card.pst')],
  ['Field (.field)', cssRule('.field')], ['Label row (.flabel)', cssRule('.field>label,.flabel') + ' and .field .flabel{align-items:center}'],
  ['Screen scroll area (.scroll)', cssRule('.scroll')], ['Header (.sky)', cssRule('.sky')], ['Two-column grid (.grid2)', cssRule('.grid2')],
  ['List row (.goal)', cssRule('.goal')], ['List row icon (.goal .ic)', cssRule('.goal .ic')], ['Category tile (.tile / .tile.ctile)', cssRule('.tile') + ' | ' + cssRule('.tile.ctile')],
  ['Tip note (.note)', cssRule('.note')], ['Adjust row (.adjrow)', '.adjrow{display:flex;align-items:center;gap:10px;margin:0 0 10px}'],
  ['Phone frame (presentation)', cssRule('.phone')],
], { size: 15 }));
push(H2('1.4 Buttons'));
push(table([2300, W - 2300], ['Style', 'CSS (verbatim)'], [
  ['Primary: gold with navy text (.btn)', cssRule('.btn')], ['Primary hover', cssRule('.btn:hover')], ['Primary pressed', cssRule('.btn:active')],
  ['Navy small (.btn.sm), used for "＋ Add to my plan" and "Upload a statement"', '.btn.sm{background:var(--ink);color:#fff;box-shadow:none} .btn.sm{min-height:44px;font-size:14px;width:auto;padding:0 18px} hover: background:var(--ink2). On calculators: style="width:100%"'],
  ['Outline / ghost (.btn.ghost), used for "Ask an expert" and "Use a sample statement"', cssRule('.btn.ghost') + ' hover: border-color:var(--ink)'],
  ['Navy full (.btn.navy)', '.btn.navy{background:var(--ink);color:#fff;box-shadow:none}'], ['Disabled', '.btn[disabled]{opacity:.45;cursor:not-allowed} and box-shadow:none'],
  ['Text link (.link)', cssRule('.link')], ['Back button (.backb)', cssRule('.backb') + ' Text: "‹ Back"'],
], { size: 15 }));
push(P('Main calls to action in sheets and flows ("Add it", "Looks right, fill in my tools") use the gold primary. On the calculator itself both actions are small: navy "＋ Add to my plan" and ghost "Ask an expert", side by side in a two-column grid.', { size: 18 }));
push(imgP('K-actions.png', 340, 200), cap('Calculator actions: navy small + ghost small'));

push(H2('1.5 Slider with editable value box'));
push(P('Every input is a labelled range slider with an editable value box on the right of the label. The customer can drag or type.'));
push(table([2300, W - 2300], ['Part', 'Specification (verbatim CSS)'], [
  ['Slider', cssRule('input[type=range]') + ' Attributes: min, max = max(slider max, current value), step, value, aria-labelledby the label.'],
  ['Value box (.nbox)', cssRule('.nbox')], ['Value input (.nbox .nb)', '.nbox .nb{border:0;background:transparent;font:inherit;font-weight:800;color:var(--sea-d);text-align:right;padding:4px 0;min-width:2.6ch;max-width:16ch;box-sizing:content-box} Width = (max(2, characters) + 0.6)ch, updated while typing.'],
  ['Box focus', '.nbox:focus-within{border-bottom:2px solid var(--sea-d);background:var(--sea-l);border-radius:6px 6px 0 0}'],
  ['Unit (.nbu)', '.nbox .nbu{font-weight:800;color:var(--sea-d)} .nbox .nb + .nbu{margin-left:3px}. Units are aria-hidden: € before; % after; "yrs" after; "mo" after; "age " before; plain numbers have none.'],
  ['Hint (.nbhint)', '.nbhint{display:block;font-size:12px;color:var(--nudge-t);min-height:0} .nbhint:empty{display:none}. role="status" aria-live="polite", under the slider.'],
], { size: 15 }));
push(H3('Behaviour (all calculators)'));
['**Drag**: the value snaps to the slider step. The box shows the value (en-IE grouping, up to 4 decimals) and the result updates live.',
 '**Type**: tapping the box selects its text. The result updates live while typing, once the text is a valid number. Enter, or leaving the box, commits and re-formats it (e.g. "72500" becomes "72,500").',
 '**Typed precision is kept.** The step applies only when dragging, e.g. 72,500.55 or 3.85% stay as typed. A pre-filled value that is not on the step (e.g. €12,451, step 500) shows exactly in the box while the thumb sits at the nearest step. The result always uses the box value.',
 '**Parsing**: everything except digits, ".", "," and "-" is ignored; commas are thousand separators. Empty, "-" or "." is ignored while typing; on commit the box goes back to the last valid value.',
 '**€ fields above the slider top**: accepted up to 10 × the slider maximum. The slider widens so its thumb pins at the end. Above 10 × the maximum the value clamps and the hint reads "Max €…" (10 × slider max).',
 '**Rates, years, months, ages and plain numbers** clamp to the slider range. Hint: "Max 8%", "Max 35 yrs", "Max 12 mo", "Max 70" (ages and plain numbers have no unit).',
 '**Below the minimum** (any field): clamps to the minimum. Hint: "Min €15,000" for euros, otherwise "Min 1" / "Min 0.5" / "Min -2" (no unit; hyphen-minus).',
 '**When the hint shows**: as soon as the typed text passes a limit (live), and after committing by leaving the box. It clears on the next in-range value. Prototype quirk: if the customer presses Enter and then leaves the box, the second commit re-checks the already clamped value and clears the hint.',
 '**Touched fields win**: once the customer drags or types a field, that value is kept over any pre-fill for the rest of the session. A new statement upload resets the tool to the statement.',
 '**Keyboard**: inputmode="decimal" when the step has decimals or the unit is %; otherwise inputmode="numeric". enterkeyhint="done", autocomplete="off".'].forEach(t => push(B(t)));
push(imgGrid([{ file: 'K-focus.png', caption: 'Value box focused (text selected, teal tint)' }, { file: 'C02-hint.png', caption: 'Max hint on a rate field' }, { file: 'K-widen.png', caption: '€ above the slider top: €300,000 typed, slider widened' }], 3, 140));

push(H2('1.6 Chips, tags, inflation chips, switch and tip'));
push(table([2300, W - 2300], ['Component', 'Specification'], [
  ['Chip (.chip)', cssRule('.chip') + ' Selected: ' + cssRule('.chip.sel') + ' Small: ' + cssRule('.chip.sm')],
  ['Tag (.tag)', cssRule('.tag')],
  ['Tag: "From your statement"', '.tag.doc{background:var(--ok-l);color:var(--ok-t)}. In the calculator label, after the label text, with one space. Shown on each input whose value came from an uploaded statement (Explore statement cards). Text exactly: "From your statement".'],
  ['Tag: "From your statement (corrected)"', 'Your finances only (not calculators): "✅ From your statement (corrected)" when the customer changed a value on the "We read these values" screen. Uncorrected statement values show "✅ From document · 95%" (confidence %). Same .tag.doc colours.'],
  ['Tag: confidence (statement confirm screen)', '"✓ 95% sure" (.tag.doc) when confidence ≥ 80%; "⚠️ Check this · 76% sure" (.tag.look: var(--gap-l) / var(--gap-t)) below 80%. Optional fields add small text "If shown · clear it if not".'],
  ['Other data tags (Your finances)', '"✏️ Your figure" (.tag.typed), "≈ Estimated" (.tag.est), "Confirmed none" (.tag.none), "From your answers" (.tag.pre), "❓ Missing", "⚠️ Needs a look" (.tag.look), "Statement is over 12 months old" (.tag.est).'],
  ['Statement precedence message (Your finances)', '"You typed €X. Your statement says €Y; we\'re using that." Shown when a statement replaced a figure the customer had typed. "Remove statement" goes back to the typed figure (toast "Statement removed. Your own figures are used again").'],
  ['Tip note (.note)', cssRule('.note') + ' Shown in the header under the question with display:block;margin-top:8px, text "💡 " + tip. Only the Emergency fund calculator (C11) has a tip.'],
], { size: 15 }));
push(H3('Inflation chips (calculators: ' + M.INFL_TOOLS.filter(x => !M.ADJ_TOOLS.includes(x)).map(NUM).sort().join(', ') + '; and ' + M.ADJ_TOOLS.map(NUM).join(', ') + ' when the switch is on)'));
push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
  ['Card', 'A card above the inputs card (margin-bottom 12px), shown while no inflation rate is chosen, or after the customer taps "Change".'],
  ['Title', '"Prices rising (inflation)" (bold 14px; labels the chip group)'],
  ['Help', '"Planners usually use 2% a year as the long-term standard. Ireland\'s inflation today is 3.5% (CSO, May 2026). Pick what feels right for you."'],
  ['Chips (role="group", each aria-pressed)', '"2% · long-term standard" (sets 2%) · "3.5% · Ireland today" (sets 3.5%) · "Other"'],
  ['Other', 'Shows "My own rate (0–10%)" with a % value box (0 to 10, decimals; hints "Max 10%" / "Min 0"); starts at 2.5% when nothing was chosen.'],
  ['After choosing', 'The chips card hides. Under the result card: "Prices rising {infl} a year (your choice) · Change" (.small, margin 8px 2px 0; "Change" is a .link, 13px). "Change" re-opens the chips with the current choice selected.'],
  ['Scope', 'One rate for the whole app: choosing it in any calculator also sets it for every other tool and the plan (a new plan version "Inflation: 2%" is saved).'],
  ['Quirk', 'Tapping "Other" before any rate is chosen sets 2.5% and the chips card closes at once, so the own-rate box only appears after tapping "Change". Recommend keeping the card open after "Other".'],
], { size: 15 }));
push(imgGrid([{ file: 'K-inflchips.png', caption: 'Inflation chips, nothing chosen' }, { file: 'K-inflother.png', caption: 'After "Change", Other selected' }], 2, 260));
push(H3('"Adjust for inflation" switch (' + M.ADJ_TOOLS.map(NUM).join(', ') + ')'));
push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
  ['Control', 'A small chip used as a switch: role="switch", aria-checked true/false. Off: "Adjust for inflation". On: "✓ Adjust for inflation" with the selected chip style.'],
  ['Helper text', '"Show the result in today\'s money" (.small) to the right, in .adjrow.'],
  ['Default', 'Off. Remembered per tool for the session. Focus stays on the switch after toggling.'],
  ['On, no rate chosen', 'The inflation chips card appears and the result line starts "Pick an inflation rate to see it in today\'s money. "'],
  ['On, rate chosen', 'Headline switches to today\'s money, the real-return sentence appears and a "Worth in today\'s money" row is added; the "Prices rising … · Change" line shows.'],
], { size: 15 }));
push(imgGrid([{ file: 'K-switch-off.png', caption: 'Switch off' }, { file: 'K-switch-on.png', caption: 'Switch on' }, { file: 'K-tag.png', caption: '"From your statement" tag on a label' }], 3, 120));
push(imgP('K-tip.png', 300, 300), cap('Header with the Emergency fund tip'));

push(H2('1.7 Calculator screen anatomy'));
['**Header (.sky)**: "‹ Back" (left), profile initial button (right, aria-label "Profile and privacy"); title h2 = emoji + space + calculator name; subtitle = the question; the tip note if any.',
 '**Category eyebrow**: the group name in capitals (CSS text-transform), e.g. HOME & MORTGAGE.',
 '**"Adjust for inflation" row** (C10, C18 only).', '**Inflation chips card** (inflation tools, when no rate is chosen or when changing).',
 '**Inputs card**: one slider + value box per input, in CALCS order.', '**Result card** (navy, aria-live="polite"): eyebrow label (gold), headline value, one line of explanation, then rows (label left, bold value right).',
 '**"Prices rising … (your choice) · Change"** line (inflation tools once a rate is chosen).', '**What if… card** (dashed border; C01, C02, C03, C12, C27): extra sliders that change the result.',
 '**Actions**: "＋ Add to my plan" (navy small) and "Ask an expert" (ghost small) in a two-column grid.', '**Disclaimer**: "Illustrative figures, not a guarantee and not advice."',
 '**App chrome**: tab bar (Home, Explore, My Plan, Me, Experts; Explore active) and the floating "Ask" button (aria-label "Ask: help and plain-English explanations").'].forEach(t => push(N(t)));
push(H2('1.8 Focus and accessibility rules'));
[':focus-visible{outline:3px solid var(--sun);outline-offset:2px}. Chips and buttons: outline:3px solid var(--ink);outline-offset:3px.',
 'Screen titles have tabindex="-1" and get focus when a new screen opens (no outline shown for that programmatic focus).',
 'Every slider and value box is labelled by its visible label (aria-labelledby). The label includes the "From your statement" tag text, so the tag is announced.',
 'The result region (#cout) is aria-live="polite": changes are announced. Hints are role="status" aria-live="polite".',
 'Emoji in list rows, tiles and units are aria-hidden. Note: the emoji in the screen title is not hidden and will be read out; hide it in the build (aria-hidden span).',
 'Gap to fix in the build: calculator sliders have no aria-valuetext, so a screen reader hears "60000" instead of "€60,000". Add aria-valuetext with the formatted value and unit (the plan what-if sliders already do this).',
 'Tap targets: value box min-height 44px, small buttons 44px, chips 40–46px, back button 38px high.',
 'Colour contrast: gold button navy text about 9:1; status text colours (-t) pass 4.5:1 on white and on their tints; result text #DCE7F2 on #0B2545.',
 '@media (prefers-reduced-motion:reduce): all animation and transition off.',
 'Mobile first: below 800 px wide the phone frame is dropped and the app fills the screen; on desktop the app is shown in a 390×844 phone frame scaled to fit, with the journey side panel.'].forEach(t => push(B(t)));

// ---------- 2 Explore structure ----------
push(H1('2. Explore structure'));
push(P('Explore (tab "Explore") header: title "Explore", subtitle "Tools, calculators and short videos. Try anything, no plan needed." Sections in order: What-ifs for your goals (only after a plan, for goals under 95% covered), Calculators, Tools for you, Watch · picked for you, Focus on one area, then the disclaimer "Calculators and videos explain general topics. Figures are illustrative, not a guarantee and not advice."'));
push(H2('2.1 Calculators: 6 groups'));
push(P('A two-column grid of coloured tiles. Each tile: emoji, group name, and "{n} tools" (small, opacity .92, weight 600). Tapping opens the group page: header "{emoji} {group name}", subtitle = blurb; then the statement card (3 groups) and a list row per calculator (emoji tile, bold name, question, chevron ›).'));
push(table([700, 2300, 1300, 2300, 700, W - 7300], ['Emoji', 'Group (verbatim)', 'Tile colour', 'Blurb (page subtitle)', 'Tools', 'Calculators, in list order'], M.CATS.map(c => { const l = data.calcs.filter(x => x.cat === c.id); const col = c.color.match(/--c\d/)[0]; return [c.em, c.name, col + ' ' + tokens.find(t => t[0] === col)[1], c.blurb, l.length + ' tools', l.map(x => x.n + ' ' + x.name).join('; ')]; }), { size: 15 }));
push(P('Total: ' + data.calcs.length + ' calculators. (The prototype\'s internal screen note says "29 calculators"; CALCS holds ' + data.calcs.length + '. See Appendix B.)', { size: 18 }));
push(P('"Tools for you" strip (horizontal, 132 px tiles in the group colour): Borrow + Deposit if a mortgage goal exists, Retirement + Contribution if a pension goal exists, then Goal planner, Emergency fund, Monthly surplus, Life cover, Compound growth; first 6 only.', { size: 18 }));
push(H2('2.2 Focus on one area'));
push(P('List rows (emoji, bold topic, subtitle, ›). A topic page has header "{emoji} {topic}", subtitle "{subtitle}." and, in order: "Try the calculator" (list rows), a "Talk to {a/an} {expert} →" link, a statement link where the topic has one, "Watch" videos, live sessions, and the disclaimer "Topics explain general ideas. They are not advice."'));
push(table([600, 1400, 2400, 1900, 2200, W - 8500], ['Emoji', 'Topic', 'Subtitle (verbatim)', 'Expert link', 'Calculators (order shown)', 'Statement link'], M.TOPICS.map(t => { const x = M.EXPERT_FOR[t[3]].toLowerCase(), a = /^[aeiou]/.test(x) ? 'an ' : 'a '; const doc = M.DOCT[t[4]];
  return [t[0], t[1], t[2], 'Talk to ' + a + x + ' →', M.TOPIC_TOOLS[t[1]].map(id => NUM(id) + ' ' + byId[id].name).join('; '), doc ? '"📄 Upload ' + (/^[aeiou]/.test(doc.what) ? 'an ' : 'a ') + doc.what + ' statement to fill in these tools →"; after upload "📄 Your ' + doc.what + ' statement is uploaded · see it →". Opens the ' + CATN[t[4]].name + ' group page.' : '—']; }), { size: 15 }));
push(P('"Talk to … →" opens the Experts tab with that expert type chosen ("You chose a mortgage expert.").', { size: 18 }));
push(imgGrid([{ file: 'X-explore.png', caption: 'Explore (before a plan)' }, { file: 'X-topic-Mortgages.png', caption: 'Topic page: Mortgages' }, { file: 'X-cat-home-unverified.png', caption: 'Group page with statement card (account not yet secured)' }], 3, 700));
push(H2('2.3 Statement-upload cards'));
push(P('Shown at the top of three group pages: Pensions & Retirement, Home & Mortgage, Investments. One pattern for all three.'));
push(table([2300, W - 2300], ['Part', 'Copy and behaviour (verbatim)'], [
  ['Card', '.card.pst (teal gradient, 1.5px #B5E3DB border).'],
  ['Heading (bold 15px)', '"📄 Have a {pension | mortgage} statement? Upload it and we\'ll fill in these tools for you." / "📄 Have an investment statement? Upload it and we\'ll fill in these tools for you."'],
  ['Documents line (.small)', '"We can read: {documents joined with " · "}."'],
  ['Buttons (two columns)', '"Upload a statement" (navy small; file picker, accepts .pdf, .jpg, .jpeg, .png, .heic) · "Use a sample statement" (ghost small).'],
  ['Account gate line', 'Only while the account is not secured: "🔐 First we\'ll secure your account (email and mobile code), so your documents stay private."'],
  ['Gate', 'If the account is not verified, either button first opens "Secure your account" (subtitle "Before you add any money figures, we check your email and mobile once."), then the email code, mobile code and the optional Face ID / passkey step. The upload then resumes automatically.'],
  ['Reading screen', 'Title "Reading your statement…", subtitle = file name(s), scanning animation, status "Finding your {pension | mortgage | investment} figures" (about 1.4 s).'],
  ['Confirm screen', 'Title "We read these values", subtitle "Please confirm. Change anything that looks wrong." Card "{emoji} {statement title}" + file name; one row per value: label (" (%)" added for percentages), confidence tag, editable box (110px). Text values (bold) and "Statement date" with the old-statement tag where it applies. Footnote "These also go into Your finances, so we won\'t ask for them again." Buttons: "Looks right, fill in my tools" (gold primary) · "Cancel" (ghost).'],
  ['After confirming', 'Values go into Your finances and pre-fill the group\'s tools; the group page and its main calculator open. Toast: "Added to your plan too ({where})" after a plan, else "Saved. Your plan will use it when you make it".'],
  ['Uploaded state', '"✅ Uploaded: {statement title} · {date}" with links "Replace statement" · "Remove statement". Remove: toast "Statement removed. Your own figures are used again".'],
  ['Optional values', 'Values marked optional apply only if shown; clearing the box means "not on the statement".'],
  ['Corrections', 'A value the customer changed is still treated as a statement figure ("From your statement (corrected)" in Your finances).'],
], { size: 15 }));
const PRE_TXT = { retire: [['C12 Retirement projection', 'Pension value today ← Current pension value; Monthly contributions ← your + employer contribution; Target retirement age ← plan retirement age if a plan exists, else the statement\'s normal retirement age; Other yearly income ← State Pension estimate from PRSI years (40+ full, 10–39 partly 0.6, else 0.8), rounded to €500; Growth after charges ← growth after the statement\'s charges (only if charges shown)'], ['C13 Contribution impact', 'Years to retirement; Growth assumption (if charges shown)'], ['C14 AVC impact', 'Years to retirement; Growth assumption (if charges shown)'], ['C15 Will my money last?', 'Retirement savings ← projected value (else current value)'], ['C16 Retirement drawdown scenarios', 'Retirement savings ← projected value (else current value)']],
  home: [['C02 Monthly mortgage repayment', 'Mortgage amount, Interest rate, Term'], ['C04 Mortgage overpayment', 'Mortgage balance, Interest rate, Years left'], ['C05 Interest-rate impact', 'Mortgage balance, Current rate, Years left'], ['C06 Mortgage term comparison', 'Mortgage amount, Interest rate, Term A'], ['All mortgage tools', 'The statement\'s monthly repayment is used as the repayment while the pre-filled fields are untouched']],
  invest: [['C18 Regular investing', 'Monthly amount ← monthly amount invested; Yearly fees ← annual charges (0, untagged, if not shown)'], ['C10 Lump-sum growth', 'Amount ← total value; Yearly fees ← annual charges (0, untagged, if not shown)'], ['C17 Inflation-adjusted return', 'Amount ← total value'], ['C19 Fees impact', 'Amount invested ← total value; Fee A ← annual charges (0, untagged, if not shown)'], ['C20 Risk & return simulator', 'Amount ← total value; Style ← 3 if shares ≥ 70%, 2 if ≥ 40%, else 1 (only if holdings shown)']] };
const FEED = { retire: 'Pension value; monthly pension contributions (your + employer); State Pension expectation; pension charges (if shown).', home: 'Home = "Own with mortgage"; mortgage balance, rate, monthly repayment, years left; home value (if shown).', invest: 'Investments (total value).' };
for (const k of ['retire', 'home', 'invest']) { const T = M.DOCT[k];
  push(H3(T.em + ' ' + T.title + ' (' + CATN[k].name + ')'));
  push(kv([['Card heading', '📄 Have ' + (/^[aeiou]/.test(T.what) ? 'an ' : 'a ') + T.what + ' statement? Upload it and we\'ll fill in these tools for you.'], ['We can read', T.reads.join(' · ')], ['Sample statement', T.title + ' · ' + T.date + (T.old ? ' (shows "Statement is over 12 months old")' : '')], ['Opens after confirming', NUM(T.open) + ' ' + byId[T.open].name], ['Feeds Your finances', FEED[k]]]));
  push(P('Values extracted (sample statement):', { bold: true, before: 80, size: 18 }));
  const rowsV = T.f.map(f => [f[1] + (f[4] === '%' ? ' (%)' : ''), String(f[2]), { '€': 'Euro amount', '%': 'Percent', y: 'Years', age: 'Age' }[f[4]] || f[4], f[3] < 80 ? '⚠️ Check this · ' + f[3] + '% sure' : '✓ ' + f[3] + '% sure', f[5] ? 'Optional: "If shown · clear it if not"' : 'Required']);
  (T.text || []).forEach(t => rowsV.push([t[0], t[1], 'Text (not editable)', '✓ ' + t[2] + '% sure', '—']));
  if (T.extra) T.extra.f.forEach(f => rowsV.push([f[1] + ' (in card "' + T.extra.t + '")', String(f[2]), 'Years', '✓ ' + f[3] + '% sure', 'Shows "Expected State Pension" {Expect full | Partly | Not sure} and "A full State Pension needs about 40 years of PRSI contributions [confirm with MyWelfare]."']));
  rowsV.push(['Statement date', T.date, 'Text', T.old ? 'Tag "Statement is over 12 months old"' : '—', '—']);
  push(table([2800, 1300, 1300, 1900, W - 7300], ['Label on confirm screen (verbatim)', 'Sample value', 'Type', 'Confidence tag', 'Rule'], rowsV, { size: 15 }));
  push(P('Pre-fills these tools (inputs get the "From your statement" tag):', { bold: true, before: 80, size: 18 }));
  push(table([3000, W - 3000], ['Calculator', 'Inputs filled'], PRE_TXT[k], { size: 15 })); }
push(imgGrid([{ file: 'X-gate.png', caption: 'Gate: Secure your account' }, { file: 'X-scan-retire.png', caption: 'Reading your statement…' }, { file: 'X-confirm-retire.png', caption: 'We read these values (pension)' }], 3, 560));
push(imgGrid([{ file: 'X-confirm-home.png', caption: 'We read these values (mortgage)' }, { file: 'X-confirm-invest.png', caption: 'We read these values (investment)' }, { file: 'X-cat-invest-uploaded.png', caption: 'Uploaded state on the group page' }], 3, 560));
push(H2('2.4 Shared actions'));
push(table([2200, W - 2200], ['Action', 'Behaviour and copy (verbatim)'], [
  ['‹ Back', 'Returns to the previous Explore screen (group page, topic page, Explore home or the screen that opened the tool).'],
  ['＋ Add to my plan', 'Opens a bottom sheet. If the result makes a goal: eyebrow "Add to my plan", title "{goal emoji} {goal name}", text "{€ amount} in about {years} year«s|» (age {age + years}). «This saves a new version of your plan.|It will be on your timeline when you make your plan.»" (first after a plan, second before). Buttons "Add it" (gold primary) and "Not now" (ghost). "Add it" adds the goal and shows the toast "{goal name} added to your plan" (after a plan) or "{goal name} added. It will be on your timeline when you make your plan". If the result makes no goal: title "Nothing to add", text "This result doesn\'t create a goal. Try changing the sliders.", button "OK".'],
  ['Ask an expert', 'Opens the Experts tab with the matching expert chosen: Home & Mortgage → Mortgage expert; Pensions & Retirement → Pension & retirement expert; Protection → Protection expert; Investments → Investment expert; Savings & Goals and Everyday Money → Financial planner. The Experts page then says "You chose a {expert, lower case}."'],
  ['Talk to {a/an} {expert} →', 'Topic pages and videos. Same destination as "Ask an expert" for that topic\'s expert.'],
], { size: 15 }));
push(imgGrid([{ file: 'X-sheet-goal.png', caption: 'Add to my plan sheet (C01, before a plan)' }, { file: 'X-sheet-none.png', caption: 'Nothing to add (C05)' }], 2, 300));

// ---------- 3 Calculators ----------
const STATE_SHORT = { default: 'Default', infl: 'Inflation 2%', adjUnset: 'Switch on, no rate', adjSet: 'Switch on, 2%', plan: 'Plan pre-fill', stmt: 'Statement' };
for (const c of data.calcs) { const S = SPEC[c.id], cat = CATN[c.cat], dflt = c.states.find(s => s.key === 'default'), dom = dflt.dom, fulls = c.states.filter(s => s.kind === 'full'), edges = c.states.filter(s => s.kind === 'result'), hint = c.states.find(s => s.key === 'hint');
  push(H1(c.n + ' ' + c.name));
  const im = inflMode(c.id);
  push(kv([['Calculator', c.n + ' · internal id "' + c.id + '" · Excel sheet ' + c.n], ['Category (eyebrow)', cat.name + ' (shown in capitals: ' + cat.name.toUpperCase() + ')'], ['Title (h2)', dom.title], ['Emoji', c.em], ['Question (subtitle)', c.q], ['Tip', c.tip ? '💡 ' + c.tip : 'None'],
    ['Inflation', im === 'switch' ? '"Adjust for inflation" switch (off by default); inflation chips when on and no rate chosen' : im === 'chips' ? 'Inflation chips while no rate is chosen; "Prices rising … · Change" line once chosen' : 'Not used'],
    ['What if… card', c.wi.length ? c.wi.map(i => '"' + i.l + '"').join(', ') : 'None'], ['Statement upload', STMT[c.id] ? M.DOCT[STMT[c.id]].title + ' (' + CATN[STMT[c.id]].name + ' group page)' : 'None'],
    ['Reached from', 'Group page "' + cat.name + '"' + Object.entries(M.TOPIC_TOOLS).filter(([, l]) => l.includes(c.id)).map(([t]) => '; topic "' + t + '"').join('') + '; "Tools for you" strip where listed'], ['Ask an expert goes to', expertFor(c.cat)]]));
  // screens
  push(H2(c.n + ' Screens'));
  push(imgGrid(fulls.map(s => ({ file: s.file, caption: c.n + ' · ' + s.title })), Math.min(3, fulls.length), 720));
  // inputs
  push(H2(c.n + ' Inputs'));
  const ins = allInputs(c), fd = k => dom.fields.find(f => f.k === k);
  push(table([2600, 1150, 1100, 1250, 900, 900, 766, 1200], ['Label (verbatim)', 'Unit shown', 'CALCS default', 'On screen (default)', 'Min', 'Max', 'Step', 'Keyboard'], ins.map(i => { const f = fd(i.k), onS = F.boxText(f.pre, f.box, f.suf), cd = F.boxText(F.PARTS[i.u][0], F.nbFmt(i.v), F.PARTS[i.u][1]);
    return [(i.wi ? '[What if] ' : '') + i.l, F.unitDisplay(i.u), cd, onS + (onS !== cd ? ' ⚠' : ''), F.nbFmt(i.min), F.nbFmt(i.max), F.nbFmt(i.step), i.step % 1 !== 0 || i.u === '%' ? 'decimal' : 'numeric']; }), { size: 15 }));
  if (ins.some(i => { const f = fd(i.k); return F.boxText(f.pre, f.box, f.suf) !== F.boxText(F.PARTS[i.u][0], F.nbFmt(i.v), F.PARTS[i.u][1]); })) push(P('⚠ The tool always pre-fills this field, so even before a plan the screen shows the "On screen" value, not the CALCS default.', { size: 16, color: MUTED }));
  push(table([2600, 2500, 1200, W - 6300], ['Label', 'Typed above max', 'Typed below min', 'Pre-fill (Your finances / plan) · Statement (tag)'], ins.map(i => { const pf = (PF[c.id] || {})[i.k] || ['', ''];
    const above = i.u === '€' ? 'Accepted up to ' + F.eur(i.max * 10) + ' (slider widens); above: clamps, hint "' + F.maxHint(i) + '"' : 'Clamps to ' + F.nbFmt(i.max) + ', hint "' + F.maxHint(i) + '"';
    return [i.l, above, 'Clamps, hint "' + F.minHint(i) + '"', (pf[0] ? pf[0] : 'Tool default') + (pf[1] ? ' · Statement: ' + pf[1] + ' → tag "From your statement"' : '')]; }), { size: 15 }));
  push(P('Pre-fill order (highest first): the customer\'s own move of this field > the uploaded statement\'s figure for this tool > Your finances (statement > typed > estimate) > the plan > the tool default. Pre-filled values are clamped to the slider range and are not rounded to the step.', { size: 16, color: MUTED, before: 60 }));
  if (hint) push(imgP(hint.file, 330, 120), cap(c.n + ' · ' + hint.title + ' → box shows "' + hint.dom.fields.find(f => f.k === hint.field).box + '", hint "' + hint.dom.fields.find(f => f.k === hint.field).hint + '"'));
  // result card
  push(H2(c.n + ' Result card'));
  const rowsTbl = []; S.rows.forEach(([l, vals, w]) => rowsTbl.push([l, vals.map(([v, vw]) => v + (vw ? ' (' + vw + ')' : '')).join(' / '), w]));
  push(table([1500, 5566, 2800], ['Part', 'Text (verbatim template)', 'Shown when'], S.lbl.map(([t, w]) => ['Label (eyebrow)', t, w]).concat(S.val.map(([t, w]) => ['Headline value', t, w]), S.line.map(([t, w]) => ['Line', t, w])), { size: 16 }));
  push(P('Rows, in order (label left, bold value right):', { bold: true, size: 18, before: 80 }));
  push(table([3500, 3366, 3000], ['Row label (verbatim template)', 'Row value', 'Shown when'], rowsTbl, { size: 16 }));
  push(P('Placeholders:', { bold: true, size: 18, before: 80 }));
  push(table([1500, 1700, W - 3200], ['Placeholder', 'Format', 'Meaning (maths in Excel sheet ' + c.n + ')'], Object.entries(S.ph).map(([k, v]) => ['{' + k + '}', TYPES[v[0]][0], v[1]]), { size: 16 }));
  push(P('Add to my plan creates: ' + (S.goal || 'no goal (the sheet says "Nothing to add").'), { size: 18, before: 80 }));
  // screen values per screenshot
  push(H2(c.n + ' Screen values in the screenshots'));
  const cols = fulls.length, lw = 2300, cw = Math.floor((W - lw) / cols), widths = [lw].concat(Array(cols).fill(cw)); widths[cols] += W - lw - cw * cols;
  const vrows = [];
  ins.forEach(i => vrows.push([i.l].concat(fulls.map(s => { const f = s.dom.fields.find(x => x.k === i.k); return f ? fieldBox(f) : '—'; }))));
  vrows.push(['Result label'].concat(fulls.map(s => s.dom.result.lbl))); vrows.push(['Headline value'].concat(fulls.map(s => s.dom.result.val)));
  const rowLabels = []; fulls.forEach(s => s.dom.result.rows.forEach(r => { if (!rowLabels.includes(r[0])) rowLabels.push(r[0]); }));
  rowLabels.forEach(l => vrows.push(['Row: ' + l].concat(fulls.map(s => { const r = s.dom.result.rows.find(x => x[0] === l); return r ? r[1] : '—'; }))));
  vrows.push(['Inflation line'].concat(fulls.map(s => s.dom.inflNote || '—')));
  push(table(widths, ['Field'].concat(fulls.map(s => STATE_SHORT[s.key] || s.key)), vrows, { size: 15, firstFill: true }));
  push(P('Result line, verbatim, per screenshot:', { bold: true, size: 18, before: 80 }));
  fulls.forEach(s => push(B('**' + (STATE_SHORT[s.key] || s.key) + '**: ' + s.dom.result.line)));
  if (edges.length) { push(H3('Edge-case results'));
    edges.forEach(s => { push(P('**' + s.title + '** (typed: ' + Object.entries(s.set).map(([k, v]) => '"' + ins.find(i => i.k === k).l + '" = ' + v).join(', ') + ')', { size: 18, keepNext: true }));
      push(imgP(s.file, 300, 260), cap(c.n + ' · ' + s.title));
      push(table([2300, W - 2300], null, [['Label', s.dom.result.lbl], ['Headline value', s.dom.result.val], ['Line', s.dom.result.line]].concat(s.dom.result.rows.map(r => ['Row: ' + r[0], r[1]])), { size: 15, firstFill: true })); }); }
  // states
  push(H2(c.n + ' States and edge cases'));
  ['**Empty box**: ignored while typing; on leaving, the box returns to the last valid value. **Invalid characters** are stripped (see 1.5).',
   '**Out of range**: see the inputs table for each field\'s clamp and hint text.',
   ...S.states,
   STMT[c.id] ? '**Statement**: inputs filled from the ' + M.DOCT[STMT[c.id]].what + ' statement show the "From your statement" tag. Moving one of them removes nothing else; the value simply becomes the customer\'s own. Removing the statement resets these inputs to Your finances or the defaults.' : null,
   im !== 'none' ? '**Inflation**: the rate is shared across the app; see 1.6 for the chips and ' + (im === 'switch' ? 'the switch.' : 'the "Change" line.') : null].filter(Boolean).forEach(t => push(B(t)));
  // actions
  push(H2(c.n + ' Actions'));
  push(table([2400, 2400, W - 4800], ['Control (verbatim)', 'Style', 'Goes to'], [['‹ Back', 'Back pill (.backb)', 'Previous Explore screen'], ['＋ Add to my plan', 'Navy small (.btn.sm), full column width', S.goal ? 'Sheet "Add to my plan": ' + S.goal : 'Sheet "Nothing to add" (this tool creates no goal)'], ['Ask an expert', 'Ghost small (.btn.ghost.sm), full column width', 'Experts tab, ' + expertFor(c.cat) + ' chosen'],
    ...(im === 'chips' || im === 'switch' ? [['Inflation chips / Change', 'Small chips; text link', 'Sets the app-wide inflation rate; the result updates in place']] : []), ...(im === 'switch' ? [['Adjust for inflation', 'Small chip as switch', 'Shows the result in today\'s money']] : [])], { size: 16 }));
  push(P('Disclaimer under the actions (verbatim): "' + dom.disc + '"', { size: 18, before: 60 }));
  // a11y
  push(H2(c.n + ' Accessibility'));
  [ 'Title read as "' + dom.title + '" (hide the emoji from screen readers in the build). Focus moves to the title when the screen opens.',
    'Each of the ' + ins.length + ' sliders and value boxes is labelled by its visible label' + (STMT[c.id] ? ', including the "From your statement" tag when shown' : '') + '. Add aria-valuetext with unit, e.g. "' + F.boxText(F.PARTS[ins[0].u][0], F.nbFmt(ins[0].v), F.PARTS[ins[0].u][1]) + '".',
    'The result card is a polite live region: the label, value, line and rows are re-announced after each change. Debounce announcements while dragging in the build.',
    'Max/min hints are polite status messages under the slider.',
    c.wi.length ? 'The What if… card is a visual group; give it a group role with the name "What if…".' : null,
    im === 'switch' ? 'The "Adjust for inflation" chip is a switch (role="switch", aria-checked). Focus stays on it after toggling.' : null,
    im !== 'none' ? 'Inflation chips are toggle buttons (aria-pressed) in a group labelled "Prices rising (inflation)".' : null,
    c.tip ? 'The tip is part of the header text and is read after the question.' : null ].filter(Boolean).forEach(t => push(B(t)));
}

// ---------- Appendix A: copy deck ----------
push(H1('Appendix A. Copy deck'));
push(P('Every string on the calculator screens. Templates use {placeholders} and «A|B» options as defined in each calculator section.'));
push(H2('A.0 Shared strings'));
const SHARED = [['Back button', '‹ Back'], ['Add action', '＋ Add to my plan'], ['Expert action', 'Ask an expert'], ['Disclaimer', 'Illustrative figures, not a guarantee and not advice.'], ['What-if card title', 'What if…'], ['Tag on statement inputs', 'From your statement'],
  ['Inflation title', 'Prices rising (inflation)'], ['Inflation help', 'Planners usually use 2% a year as the long-term standard. Ireland\'s inflation today is 3.5% (CSO, May 2026). Pick what feels right for you.'], ['Inflation chip 1', '2% · long-term standard'], ['Inflation chip 2', '3.5% · Ireland today'], ['Inflation chip 3', 'Other'], ['Own rate label', 'My own rate (0–10%)'], ['Chosen line', 'Prices rising {infl} a year (your choice) · Change'],
  ['Switch (off / on)', 'Adjust for inflation / ✓ Adjust for inflation'], ['Switch helper', 'Show the result in today\'s money'], ['Switch prompt (on, no rate)', 'Pick an inflation rate to see it in today\'s money.'], ['Real-return sentence', 'Real return about {rr}% a year ({g}% «growth|growth after fees», prices rising {infl}).'], ['Today\'s-money row', 'Worth in today\'s money (prices rising {infl} a year)'],
  ['Hints', 'Max €{10 × max} · Max {max}% · Max {max} yrs · Max {max} mo · Max {max} · Min €{min} · Min {min}'],
  ['Add sheet (goal)', 'Add to my plan · {emoji} {goal name} · {€ amount} in about {years} year«s|» (age {age}). «This saves a new version of your plan.|It will be on your timeline when you make your plan.» · Add it · Not now'], ['Add sheet (no goal)', 'Nothing to add · This result doesn\'t create a goal. Try changing the sliders. · OK'],
  ['Add toast', '{goal name} added to your plan · {goal name} added. It will be on your timeline when you make your plan'],
  ['Explore disclaimer', 'Calculators and videos explain general topics. Figures are illustrative, not a guarantee and not advice.'], ['Topic disclaimer', 'Topics explain general ideas. They are not advice.'],
  ['Statement card', '📄 Have a {what} statement? Upload it and we\'ll fill in these tools for you. · We can read: {list}. · Upload a statement · Use a sample statement · 🔐 First we\'ll secure your account (email and mobile code), so your documents stay private. · ✅ Uploaded: {title} · {date} · Replace statement · Remove statement'],
  ['Statement screens', 'Reading your statement… · Finding your {what} figures · We read these values · Please confirm. Change anything that looks wrong. · ✓ {n}% sure · ⚠️ Check this · {n}% sure · If shown · clear it if not · Statement date · Statement is over 12 months old · These also go into Your finances, so we won\'t ask for them again. · Looks right, fill in my tools · Cancel'],
  ['Statement toasts', 'Added to your plan too ({where}) · Saved. Your plan will use it when you make it · Statement removed. Your own figures are used again'],
  ['Your finances tags', '✅ From your statement (corrected) · ✅ From document · {n}% · ✏️ Your figure · ≈ Estimated · Confirmed none · From your answers · ❓ Missing · ⚠️ Needs a look'], ['Precedence message', 'You typed {€ typed}. Your statement says {€ statement}; we\'re using that.']];
push(table([2600, W - 2600], ['Element', 'String (verbatim)'], SHARED, { size: 16, zebra: true }));
for (const c of data.calcs) { const S = SPEC[c.id], dom = c.states[0].dom;
  push(H2('A.' + c.n + ' ' + c.name));
  const rows = [['Title', dom.title], ['Question', c.q]]; if (c.tip) rows.push(['Tip', '💡 ' + c.tip]); rows.push(['Category eyebrow', CATN[c.cat].name]);
  allInputs(c).forEach(i => { rows.push([(i.wi ? 'What-if label' : 'Input label') + ' (' + F.UNIT_NAME[i.u] + ')', i.l]); rows.push(['  Unit and hints', (F.PARTS[i.u][0] ? 'Box prefix "' + F.PARTS[i.u][0].trim() + '" · ' : F.PARTS[i.u][1] ? 'Box suffix "' + F.PARTS[i.u][1] + '" · ' : 'No unit · ') + F.maxHint(i) + ' · ' + F.minHint(i)]); });
  S.lbl.forEach(([t]) => rows.push(['Result label', t])); S.val.forEach(([t]) => rows.push(['Headline value', t])); S.line.forEach(([t]) => rows.push(['Result line', t]));
  S.rows.forEach(([l, vals]) => rows.push(['Row', l + '  →  ' + vals.map(v => v[0]).join(' / ')]));
  if (S.goal) rows.push(['Goal added', S.goal]);
  if (inflMode(c.id) === 'switch') rows.push(['Switch', 'Adjust for inflation / ✓ Adjust for inflation · Show the result in today\'s money']); if (inflMode(c.id) !== 'none') rows.push(['Inflation strings', 'See A.0 (inflation chips and "Prices rising {infl} a year (your choice) · Change")']); if (c.wi.length) rows.push(['What-if card title', 'What if…']);
  rows.push(['Actions', '‹ Back · ＋ Add to my plan · Ask an expert']); rows.push(['Disclaimer', dom.disc]);
  push(table([2600, W - 2600], ['Element', 'String (verbatim)'], rows, { size: 16, zebra: true })); }

// ---------- Appendix B ----------
push(H1('Appendix B. Open points and prototype defects'));
push(P('Build to the prototype unless the proposition owner decides otherwise. Items marked Defect break the tool and should be fixed in the build.'));
[ '**Defect, C20 Risk & return**: the Style box accepts decimals; 2.5 shows "undefined · middle outcome" and "€NaN". Restrict Style to 1, 2, 3 (or three chips).',
  '**Defect, C04 Mortgage overpayment**: "With the extra" can print "Infinity yrs NaN mo" if repayment + extra is below the monthly interest (only possible with a low stated repayment). Show "—".',
  '**C01 First-time buyer** is a 0/1 slider; typed decimals are treated as "first-time". Recommend a Yes/No switch.',
  '**C13 / C14 tax rate**: slider stops at 20% and 40% but the box accepts any value from 20 to 40.',
  '**C16 Drawdown**: the headline and Growth row show "60+" at the cap; the Cautious and Balanced rows show "60 yrs".',
  '**Singular forms**: "1 years" (C15, C16, C28, C07 label "1 yrs"), "1 months" / "1.0 months" (C11, C22), "(1 months)" in C11.',
  '**C03 Deposit**: when the deposit is already saved the line still says "Saving €… a month closes the gap."',
  '**C06 Term comparison**: equal terms still say the shorter term "costs more each month".',
  '**C25 Surplus**: a surplus of exactly €0 shows "Spending is above income right now."',
  '**C25 / C26 pre-fill**: the take-home pre-fill is not rounded (sample customer sees "€5,193.6206").',
  '**C10 vs C18 goal**: Lump-sum adds the goal in today\'s money whenever a rate is chosen (even with the switch off); Regular investing never does.',
  '**Inflation "Other"**: tapping Other before any rate closes the chips at once (2.5% applied); the own-rate box needs "Change".',
  '**Value-box hint**: pressing Enter and then leaving the box clears the max/min hint (the second commit re-checks the clamped value).',
  '**Calculator count**: CALCS holds ' + data.calcs.length + ' calculators; the Explore screen note in the prototype says 29. This spec covers the ' + data.calcs.length + ' in CALCS.',
  '**Excel sheet names** cannot contain "?", so sheet names for C01 and C15 will differ from the calculator names. Match on the "Cnn" prefix.',
  '**Sliders lack aria-valuetext** (see 1.8); the emoji in screen titles is read aloud.',
  '**docs/journey-spec.md K6** still says Explore and its calculators are removed; the later change list brings Explore back. This document follows the prototype, which includes Explore.' ].forEach(t => push(B(t)));

