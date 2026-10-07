// FP round 8 (§14): the three types as the customer sees them
const T_GOV = 'Set by Government · 2026', T_MINE = 'Your choice', T_HOW = 'How the plan works';
const tRange = d => { const [lo, hi] = d.rng(); return 'Usually ' + asmFmt(d, lo).replace(/ years$/, '') + '–' + asmFmt(d, hi); };
const asmFmt = (d, v) => v == null ? 'Not chosen yet' : d.t === 'pct' ? pcs(+v) : d.t === 'eur' ? eur(+v) : d.t === 'eurw' ? eurW(+v) + ' a week' : d.t === 'yrs' ? v + (+v === 1 ? ' year' : ' years') : d.t === 'age' ? 'age ' + v : d.t === 'num' ? (d === ASM.retireMult ? v + '× (about ' + +(100 / v).toFixed(1) + '% a year)' : d === ASM.safetyMonths ? v + (+v === 1 ? ' month' : ' months') : String(v)) : ((d.o.find(o => String(o[0]) === String(v)) || [0, String(v)])[1]);
function asmGuide(d){ if (d.ty === 2){ const [lo, hi] = d.rng(); return 'Usually between ' + asmFmt(d, lo) + ' and ' + asmFmt(d, hi) + ' (' + d.by + ').'; }
  return d.own ? '' : 'Generally the standard is ' + asmFmt(d, d.sug()) + ' (' + d.by + '). Choose what you want to use.'; }
const nbUnit = d => d.t === 'pct' ? '%' : d.t === 'eur' || d.t === 'eurw' ? '€' : d.t === 'yrs' ? 'y' : d.t === 'age' ? 'age' : '';
const asmTag = (on, need) => on ? '<span class="tag doc">' + T_MINE + '</span>' : need ? '<span class="tag look">Not chosen yet</span>' : '';
function asmInput(k){ const d = ASM[k], v = asmGet(k), id = 'asm-' + k, std = asmStd(k) ? d.sug() : null;
  const ctl = d.t === 'choice' ? '<div class="chips" role="group" aria-labelledby="' + id + '">' + d.o.map(([val, l]) => { const on = v != null && String(v) === String(val); return '<button class="chip sm' + (on ? ' sel' : '') + '" aria-pressed="' + on + '" data-a="asmset" data-p="' + k + '|' + val + '">' + esc(l) + '</button>'; }).join('') + '</div>'
    : nbox('asm', k, v == null ? '' : d.t === 'pct' ? +(v * 100).toFixed(2) : +v, nbUnit(d), id, {dec:d.t === 'pct' || d.t === 'eurw' || (d.step % 1 !== 0)}) + nbHint('asm', k);
  const chip = std != null && (v == null || String(v) !== String(std)) ? '<button class="chip sm" style="margin-top:6px" data-a="asmstd" data-p="' + k + '">Use the standard (' + esc(asmFmt(d, std)) + ')</button>' : '';
  return '<div class="field asmf" data-k="' + k + '" style="margin:0 0 14px"><span class="flabel" id="' + id + '">' + esc(d.l) + ' ' + asmTag(v != null, d.need()) + '</span>' + ctl + chip +
    '<span class="small" style="display:block;margin-top:4px">' + esc([asmGuide(d), d.help].filter(Boolean).join(' ')) + '</span></div>'; }
// Retirement age: never defaulted, never part of "use all" (§14)
function retireField(){ const v = S.retireSet ? S.retireAge : '';
  return '<div class="field asmf" data-k="retireAge" style="margin:0 0 14px"><span class="flabel" id="asm-retireAge">Retirement age ' + asmTag(S.retireSet, true) + '</span>' + nbox('ret', 'a', v, 'age', 'asm-retireAge', {}) + nbHint('ret', 'a') +
    '<span class="small" style="display:block;margin-top:4px">' + esc(RETIRE_HELP) + ' Choose the age you want to plan for.</span></div>'; }
// Type 1: set by law, the same for everyone. Shown, never editable.
function govRows(){ const I = RI.it, U = RI.usc, PN = RI.pen, SP = RI.sp, H = RI.home, A = RI.ae, P = RI.prsi.path;
  return [['Income tax', '20% up to ' + eur(I.band) + ' (single; ' + eur(I.bandMarried) + ' married, plus up to ' + eur(I.bandUplift) + ' for a second income), 40% above. Personal credit ' + eur(I.personal) + ' (' + eur(I.personalMarried) + ' married), employee credit ' + eur(I.paye)],
    ['USC', U.bands.map(b => pcs(b[1])).join(' / ') + ' in bands; none if your income is ' + eur(U.exempt) + ' or less. The State Pension is exempt'],
    ['PRSI', P.map(x => pcs(x.r) + ' from ' + ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][x.m] + ' ' + x.y).join(', ') + '; none from ' + RI.prsi.endAge],
    ['Pension tax relief', PN.relief.map(r => pcs(r[1])).join(' / ') + ' of pay by age, on pay up to ' + eur(PN.earnCap)],
    ['Retirement lump sum', 'Up to ' + pcs(PN.lsMaxPct) + ': ' + eur(PN.lsTaxFree) + ' tax-free, the next ' + eur(PN.lsCap - PN.lsTaxFree) + ' taxed at ' + pcs(PN.lsBandRate)],
    ['Standard Fund Threshold', eur(PN.sft[2026]) + ' in 2026, rising to ' + eur(PN.sft[2029]) + ' by 2029; ' + pcs(PN.sftRate) + ' tax above it'],
    ['Pension withdrawals', 'From ' + PN.earliestAge + ' at the earliest; at least ' + pcs(PN.arfMin61) + ' a year from 61, ' + pcs(PN.arfMin71) + ' from 71 (' + pcs(PN.arfMinBig) + ' over ' + eur(PN.arfBig) + ')'],
    ['State Pension (full rate)', eurW(SP.week) + ' a week from ' + SP.age + ' (' + eur(SP.over80) + ' more from 80); Qualified Adult ' + eurW(SP.qa66)],
    ['Illness Benefit and survivor\'s pension', eurW(SP.illness) + ' a week; survivor\'s pension ' + eurW(SP.survivor) + ' under 66, ' + eurW(SP.survivor66) + ' at 66+'],
    ['Auto-enrolment (My Future Fund)', pcs(A.ee) + ' you + ' + pcs(A.er) + ' employer + ' + pcs(A.state) + ' State, on pay up to ' + eur(A.earnCap)],
    ['Savings tax', 'DIRT ' + pcs(RI.sav.dirt) + ' on deposit interest; exit tax ' + pcs(RI.sav.exit) + ' on funds'],
    ['Mortgage limits (Central Bank)', H.ltiFTB + '× income for first-time buyers, ' + H.ltiSSB + '× for others; at least a ' + pcs(1 - H.ltv) + ' deposit'],
    ['Stamp duty', pcs(H.stamp[0][1]) + ' up to ' + eur(H.stamp[0][0]) + ', ' + pcs(H.stamp[1][1]) + ' to ' + eur(H.stamp[1][0]) + ', ' + pcs(H.stamp[2][1]) + ' above']]; }
const govHTML = () => govRows().map(x => '<div class="mini"><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>').join('');
function stdLeft(){ return ASM_KEYS().filter(k => asmStd(k) && !asmMine(k)).length + (inflSet() ? 0 : 1); }
const useAllBtn = where => '<button class="btn ghost sm" data-a="useall" data-p="' + where + '">Use the standard for all of these</button><p class="small" style="margin:4px 0 0">Fills every choice you haven\'t made yet with its standard. It never sets your retirement age or plan-until age: choose those yourself.</p>';
function asmScreen(){ applyAssume(); const open = S.asmOpen === undefined ? 'prices' : S.asmOpen, left = stdLeft();
  return (left ? '<div class="card"><b>' + left + (left === 1 ? ' choice' : ' choices') + ' not made yet</b><p class="small" style="margin:2px 0 8px">Each one shows the standard and where it comes from.</p>' + useAllBtn('asm') + '</div>' : '') +
    ASM_GRP.map(([g, t]) => '<details class="card asmg" data-g="' + g + '"' + (open === g ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:32px">' + t + '</summary><div style="margin-top:10px">' +
    (g === 'prices' ? '<div class="field" style="margin:0 0 14px">' + inflChoice('asm') + '</div><div class="field" style="margin:0 0 14px"><span class="flabel">Growth assumptions set</span>' + assumeToggle() + '</div>' : '') + (g === 'length' ? retireField() : '') +
    ASM_KEYS().filter(k => ASM[k].g === g).sort((a, b) => (b === 'planEnd') - (a === 'planEnd')).map(asmInput).join('') + (g === 'safety' && [ 'budgetNeeds', 'budgetWants', 'budgetSave'].every(asmMine) && Math.abs(asmV('budgetNeeds') + asmV('budgetWants') + asmV('budgetSave') - 1) > 1e-6 ? '<p class="note">Your budget split adds up to ' + Math.round((asmV('budgetNeeds') + asmV('budgetWants') + asmV('budgetSave')) * 100) + '%. It should total 100%.</p>' : '') + '</div></details>').join('') +
    '<details class="card asmg" data-g="law"' + (open === 'law' ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:32px">' + T_GOV + '</summary><div style="margin-top:10px">' + govHTML() + '<p class="small" style="margin:8px 0 0">Set by law and the same for everyone, so you can\'t change them. ' + RULES_VERSION + '.</p></div></details>'; }
// Plan builder step 7: one place to make the choices the results need (§14), next to the inflation choice
function p4Asm(){ const ty2 = ASM_KEYS().filter(k => ASM[k].ty === 2 && ASM[k].need()), own = ASM_KEYS().filter(k => ASM[k].own && k !== 'planEnd' && ASM[k].need()),
    rest = ASM_KEYS().filter(k => asmStd(k) && ASM[k].need()), left = rest.filter(k => !asmMine(k)).length + (inflSet() ? 0 : 1);
  return '<div class="card" id="p4-asm"><h3 style="margin:0 0 4px;font-size:17px">Your assumptions</h3><p class="small" style="margin:0 0 12px">Your results depend on a few choices. They are yours to make: for each one we show the usual range or the standard.</p>' +
    '<div id="p4-infl" class="field" style="margin:0 0 14px">' + inflChoice('p4') + '</div>' + retireField() + asmInput('planEnd') + ty2.concat(own).map(asmInput).join('') +
    '<div class="field" style="margin:4px 0 0"><b style="font-size:14px">Other choices</b><p class="small" style="margin:2px 0 8px">' + (left ? left + ' of ' + (rest.length + 1) + ' not chosen yet.' : 'All ' + (rest.length + 1) + ' chosen.') + '</p>' + (left ? useAllBtn('p4') : '') +
    '<details class="asmg" data-g="p4"' + (S.asmOpen === 'p4' ? ' open' : '') + ' style="margin-top:8px"><summary style="cursor:pointer;font-weight:800;min-height:32px">See or change each one</summary><div style="margin-top:10px">' + rest.map(asmInput).join('') + '</div></details></div></div>'; }
// "Choose your [item] to see this": shown instead of any result that needs a missing choice (§14)
function gateHTML(where){ const m = planMissing(); if (!m.length) return '';
  return '<div class="card" id="gate-' + where + '" style="border:1.5px dashed #B9C9D6;box-shadow:none"><b>' + esc(chooseTxt(m[0])) + '</b><p class="small" style="margin:4px 0 8px">' + (m.length > 1 ? 'Also still to choose: ' + esc(m.slice(1).map(x => x.n).join(', ')) + '.' : 'One choice left.') + '</p><button class="btn sm" data-a="asmopen">Make my choices</button></div>'; }
