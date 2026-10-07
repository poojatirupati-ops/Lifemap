let S;
const GOALCAT = [
  {k:'home', t:'Buy a home', e:'🏡', amt:40000, yrs:4, kind:'spend', spec:'mortgage', unit:'Deposit'},
  {k:'retire', t:'Retire comfortably', e:'🌅', amt:40000, kind:'retire', spec:'pension', unit:'Yearly income'},
  {k:'family', t:'Grow my family', e:'👶', amt:15000, yrs:3, kind:'spend', spec:'protection', unit:'One-off'},
  {k:'edu', t:"Kids' education", e:'🎓', amt:30000, yrs:10, kind:'spend', spec:'planner', unit:'Per child'},
  {k:'travel', t:'Travel', e:'✈️', amt:8000, yrs:2, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'business', t:'Start a business', e:'💼', amt:25000, yrs:5, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'mfree', t:'Be mortgage-free', e:'🏦', amt:150000, yrs:15, kind:'mfree', spec:'mortgage', unit:'Mortgage balance'},
  {k:'safety', t:'Build a safety net', e:'🪂', amt:15000, yrs:2, kind:'pot', spec:'planner', unit:'Months of costs'},
  {k:'wealth', t:'Grow my wealth', e:'📈', amt:50000, yrs:10, kind:'pot', spec:'investment', unit:'Target pot'},
  {k:'helpfam', t:'Help my family', e:'🤝', amt:20000, yrs:8, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'legacy', t:'Leave a legacy', e:'🎁', amt:100000, age:85, kind:'legacy', spec:'planner', unit:'Amount'},
  {k:'wedding', t:'Wedding', e:'💍', amt:25000, yrs:3, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'car', t:'Change the car', e:'🚗', amt:30000, yrs:3, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'health', t:'Health & care', e:'🩺', amt:10000, yrs:5, kind:'spend', spec:'protection', unit:'One-off'},
  {k:'other', t:'Something else', e:'⭐', amt:10000, yrs:4, kind:'spend', spec:'planner', unit:'Custom'}
];
const GC = k => GOALCAT.find(g => g.k === k);
const own = () => /^Own/.test(S.fin.home || ''), mort = () => S.fin.home === 'Own with mortgage';
const FF = {
  name:{l:'First name', type:'text', pre:1},
  age:{l:'Your age', type:'num', min:18, max:80, pre:1},
  retireAge:{l:'Retirement age', type:'num', min:50, max:75, pre:1, hint:'From your timeline flag'},
  pAge:{l:"Partner's age", type:'num', min:18, max:85, est:() => S.about.age, show:() => S.about.partner && S.partner.mode !== 'invite'},
  work:{l:'Your work', type:'choice', o:['Employed','Self-employed','Not working'], est:'Employed'},
  income:{l:'Your gross yearly income', type:'eur', est:45000, hint:'Before tax'},
  pIncome:{l:"Partner's gross yearly income", type:'eur', est:38000, show:() => S.about.partner && S.partner.mode !== 'invite'},
  otherM:{l:'Other income a month', type:'eur', est:0, opt:1, hint:'Optional'},
  costsM:{l:'Monthly living costs', type:'eur', est:() => 2000 + (S.about.partner ? 800 : 0) + 450 * (S.about.deps || 0), hint:'Rent, bills, food and extras. Leave out mortgage and loan repayments.'},
  oneOffY:{l:'Yearly one-off costs', type:'eur', est:1500, opt:1, hint:'Optional. Car tax, insurance, holidays'},
  home:{l:'Your home', type:'choice', o:['Own outright','Own with mortgage','Rent','Live with family'], est:'Rent'},
  homeValue:{l:'Home value', type:'eur', est:380000, show:own},
  cash:{l:'Cash savings', type:'eur', est:8000, hint:'Incl. credit union and State Savings'},
  invest:{l:'Investments', type:'eur', est:0, hint:'Shares, funds, share schemes, crypto: one total'},
  propValue:{l:'Other property: value', type:'eur', est:0, opt:1, hint:'Optional'},
  rentM:{l:'Other property: rent received a month', type:'eur', est:0, opt:1, hint:'Optional'},
  mortBal:{l:'Mortgage left', type:'eur', est:200000, show:mort},
  mortPayM:{l:'Monthly repayment', type:'eur', est:1100, show:mort},
  mortYears:{l:'Years left', type:'num', min:1, max:40, est:20, show:mort},
  debt:{l:'Other loans and cards: total owed', type:'eur', est:0},
  debtPayM:{l:'Their monthly repayments', type:'eur', est:0},
  life:{l:'Life cover', type:'ynn'}, ip:{l:'Income protection', type:'ynn'}, ci:{l:'Serious illness cover', type:'ynn'}, workCover:{l:'Cover through work', type:'ynn'}, health:{l:'Health insurance', type:'ynn'},
  pension:{l:'Pension value today', type:'eur', est:() => Math.max(0, S.about.age - 25) * 3500, hint:'All pots together'},
  pensionM:{l:'Paid in each month', type:'eur', est:() => Math.round((S.fin.income || 45000) * 0.1 / 12 / 10) * 10, hint:'Including your employer'},
  sp:{l:'State Pension', type:'choice', o:['Expect full','Partly','Not sure'], est:'Not sure'}
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur = n => (n < 0 ? '−€' : '€') + Math.round(Math.abs(n)).toLocaleString('en-IE');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const YEAR0 = 2026;
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const val = f => typeof f === 'function' ? f() : f;
function mkGoal(k, custom){
  const c = GC(k), a0 = S.about.age;
  const g = {id:S.gid++, k, name:custom ? custom[1] : c.t, e:custom ? custom[0] : c.e, kind:c.kind, spec:c.spec, amount:custom ? custom[2] : c.amt, saved:0, who:'Me', prio:'Must have', flex:'Can move'};
  if (c.kind === 'retire') g.age = S.retireAge;
  else if (c.kind === 'legacy') g.age = AS.end;   // FP round 4 F9: tested and shown at the end of the plan (90)
  else g.age = Math.min(89, a0 + (custom ? custom[3] : c.yrs));
  if (k === 'edu' && S.about.deps > 1) g.amount = c.amt * Math.min(3, S.about.deps);
  if (k === 'safety') g.amount = Math.round(val(FF.costsM.est) * 4 / 1000) * 1000;
  return g;
}
const retireGoal = () => S.goals.find(g => g.kind === 'retire');
const AS = {infl:0.025, wage:0.03, cash:0.007, inv:0.03, pen:0.04, penRet:0.028, sp:15564, spAge:66, end:90, mortRate:0.038, debtRate:0.09};
// Growth assumptions are the customer's choice (Pooja, 30 Sep 2026). Standard = default; Cautious = the Financial Planner's set. AS always holds the active set.
const AS_SETS = {standard:{infl:0.02, wage:0.025, cash:0.01, inv:0.045, pen:0.045, penRet:0.0315}, cautious:{infl:0.025, wage:0.03, cash:0.007, inv:0.03, pen:0.04, penRet:0.028}};
const AS_NAME = {standard:'Standard', cautious:'Cautious'};
function applyAssume(){ Object.assign(AS, AS_SETS[(S && S.assume) || 'standard']); }
function assumeToggle(){ const a = (S && S.assume) || 'standard';
  return '<div class="asm"><div class="seg" role="group" aria-label="Growth assumptions" style="margin:0">' + ['standard','cautious'].map(k => '<button class="' + (a === k ? 'on' : '') + '" aria-pressed="' + (a === k) + '" data-a="assume" data-p="' + k + '">' + AS_NAME[k] + '</button>').join('') + '</div><p class="small" style="margin:6px 0 0">' + (a === 'cautious' ? 'Cautious assumes slower growth and faster rising prices, so results are lower but safer.' : 'Standard uses typical long-run growth. Cautious assumes slower growth and faster rising prices, so results are lower but safer.') + '</p></div>'; }
// 2026 Irish rules, today's money. Bands/credits are assumed to rise with prices (call with income / infl, then multiply back).
const TX = {band:44000, credits:4000, ageCredit:245, ageExempt:18000,
  usc:[[12012, .005], [28700, .02], [70044, .03], [Infinity, .08]], uscExempt:13000, prsi:0.0435, prsiWk:352};
function incomeTax(g, cr){ return Math.max(0, 0.2 * Math.min(g, TX.band) + 0.4 * Math.max(0, g - TX.band) - (cr == null ? TX.credits : cr)); }
function usc(g, reduced){ if (g <= TX.uscExempt) return 0; const b = reduced ? [[12012, .005], [Infinity, .02]] : TX.usc; let t = 0, lo = 0;
  for (const [hi, r] of b){ t += Math.max(0, Math.min(g, hi) - lo) * r; lo = hi; if (g <= hi) break; } return t; }
function prsi(g){ const wk = g / 52; if (wk <= TX.prsiWk) return 0; const cr = wk <= 424 ? Math.max(0, 12 - (wk - 352.01) / 6) : 0; return Math.max(0, (wk * TX.prsi - cr) * 52); }
const pc = x => +(x * 100).toFixed(2) + '%';
// Assumption rows, all built from AS / TX so the copy never drifts from the engine (FP review C1–C10, W12)
function saveRows(){ const P = project(), k = S.ans['6'], q = DQ_BY('6');
  return [['What you save', 'About ' + eur(P.save.saveM) + ' a month towards your goals (' + (S.saveM != null ? 'your choice' : typeof k === 'number' ? 'from your answer: ' + q.o[k].t : 'assumed €300 cap: you haven\'t told us yet') + '; never more than half your spare money unless you set it)'],
    ['Spare money not saved', 'Assumed spent'], ['Emergency buffer', S.goals.some(g => g.k === 'safety') ? 'Your safety-net goal is your emergency fund' : '3 months of costs kept aside (you have no safety-net goal)'],
    ['Order your savings go to goals', 'Safety net first, then must-haves, then nice-to-haves, soonest first'], ['Money for goals under 5 years', 'Kept as cash'], ['Tax for couples', S.about.partner && S.about.married === true ? 'Joint assessment (married / civil partners)' : 'Taxed as individuals'], ['Known limits', 'Living costs stay the same to 90; your partner\'s pension and retirement age aren\'t modelled']]; }
const assumeRows = () => (applyAssume(), [['Growth assumptions', AS_NAME[S.assume || 'standard'] + ' (your choice)'], ['Prices rise (inflation)', pc(AS.infl) + ' a year'], ['Pay rises', pc(AS.wage) + ' a year'], ['Cash savings grow', pc(AS.cash) + ' a year, after tax'], ['Investments grow', pc(AS.inv) + ' a year, after charges and tax'], ['Pensions grow', pc(AS.pen) + ' a year after charges (' + pc(AS.penRet) + ' once retired)'],
  ['State Pension', eur(AS.sp) + ' a year from ' + AS.spAge + ' (' + (S.fin.sp || 'Not sure') + ')'], (retireGoal() ? ['Retirement age', '' + S.retireAge] : ['Work income stops at', 'Age ' + S.retireAge + ' (from About you; no retirement goal)']), ['Tax', '2026 Irish income tax, USC and PRSI; bands assumed to rise with prices'], ['At retirement', '25% of your pension taken tax-free (up to €200,000)'], ...saveRows(), ['Plan ends', 'Age ' + AS.end]]);
function netPay(g){ return g <= 0 ? 0 : g - incomeTax(g) - usc(g) - prsi(g); }
// Retirement: no PRSI at 66+, State Pension is USC-exempt, age credit and age exemption from 65, reduced USC from 70 (income <= €60,000)
function netRet(draw, sp, age){ const g = draw + sp; if (g <= 0) return 0;
  const it = age >= 65 && g <= TX.ageExempt ? 0 : incomeTax(g, TX.credits + (age >= 65 ? TX.ageCredit : 0));
  return g - it - usc(draw, age >= 70 && g <= 60000); }
// Net cost to take-home of the employee's own pension contributions (relief at marginal income-tax rate, within age limits and the €115,000 cap)
const relLim = a => a < 30 ? .15 : a < 40 ? .2 : a < 50 ? .25 : a < 55 ? .3 : a < 60 ? .35 : .4;
function pensionCost(g, E, age){ const Er = Math.min(E, relLim(age) * Math.min(g, 115000)); return E - (incomeTax(g) - incomeTax(Math.max(0, g - Er))); }
const annPay = (bal, r, yrs) => bal > 0 ? bal * r / (1 - Math.pow(1 + r, -Math.max(1, yrs))) : 0;   // level yearly repayment (FP round 4)
// Joint assessment (married / civil partners, Ireland 2026): standard-rate band €53,000 + the lower earner's income up to €35,000 (max €88,000); married personal credit €4,000 + €2,000 PAYE credit per earner.
// Returns the income-tax saving versus being taxed as two single people (never negative). Today's money.
function jointGain(g1, g2){ g1 = Math.max(0, g1); g2 = Math.max(0, g2); if (!g1 && !g2) return 0; const hi = Math.max(g1, g2), lo = Math.min(g1, g2), band = 53000 + Math.min(lo, 35000), G = g1 + g2;
  const joint = Math.max(0, 0.2 * Math.min(G, band) + 0.4 * Math.max(0, G - band) - (4000 + 2000 * ((g1 > 0) + (g2 > 0)))), sep = incomeTax(g1) + (g2 > 0 ? incomeTax(g2) : 0);
  return Math.max(0, sep - joint); }
function finNums(){
  // Skipped figures count as €0 and show as ❓ Missing. Only "Estimate for me" adds a (labelled) typical figure. (spec §11)
  const f = S.fin, n = k => { const v = f[k]; return v != null && v !== '' && !isNaN(+v) ? +v : 0; };
  const mortOn = f.home === 'Own with mortgage';
  return {age:S.about.age, R:S.retireAge, work:f.work, married:!!S.about.partner && S.about.married === true, partner:!!S.about.partner, pAge:n('pAge') || S.about.age, income:f.work === 'Not working' ? 0 : n('income'), pIncome:S.about.partner ? n('pIncome') : 0,
    otherM:n('otherM'), costsM:n('costsM'), oneOffY:n('oneOffY'), cash:n('cash'), invest:n('invest'), rentM:n('rentM'),
    mortBal:mortOn ? n('mortBal') : 0, mortPayM:mortOn ? Math.max(n('mortPayM'), annPay(n('mortBal'), AS.mortRate, n('mortYears') || 25) / 12) : 0, mortPayLow:mortOn && n('mortPayM') * 12 < annPay(n('mortBal'), AS.mortRate, n('mortYears') || 25) - 12, mortYears:mortOn ? n('mortYears') : 0, debt:n('debt'), debtPayM:n('debtPayM'),
    pension:n('pension'), pensionM:f.work !== 'Not working' && n('income') > 0 ? n('pensionM') : 0, sp:f.sp === 'Expect full' ? 1 : f.sp === 'Partly' ? 0.6 : 0.8};
}
/* ===== Honest goal funding (FP review round 3). Replaces project(); same return shape {rows, pct} plus P.goal and P.save ===== */
const SAVE = {
  band:[50, 200, 500, 1000, null],   // Q6 option index -> monthly amount, today's money (band midpoint; "Over €750" -> €1,000; "varies" -> share only)
  share:0.5,                         // at most half of the measured monthly spare money is saved
  shareVaries:0.33,                  // "It changes month to month": a third
  noAnswer:300,                      // Q6 not answered: €300 a month cap (shown as an assumption)
  buffer:3,                          // months of living costs kept back as an emergency buffer when there is no safety-net goal
  longYrs:5                          // goals 5+ years away grow at the investment rate, sooner ones at the cash rate
};
const GOAL_ORDER = (a, b) => (a.k === 'safety' ? 0 : 1) - (b.k === 'safety' ? 0 : 1)       // safety net first, always
  || (a.prio === 'Nice to have' ? 1 : 0) - (b.prio === 'Nice to have' ? 1 : 0)            // then Must have before Nice to have
  || a.age - b.age || a.id - b.id;                                                          // then by date
// Saving that grows with pay (w) into a pot growing at r: value after n years of 1 a year (paid at the start of each year)
const annF = (n, r, w) => { let s = 0; for (let t = 0; t < n; t++) s += Math.pow(1 + w, t) * Math.pow(1 + r, n - t); return s; };
function saveAuto(surplusM){                                 // the Q6 rule: monthly saving, today's money, before what-if
  const k = typeof S.ans['6'] === 'number' ? S.ans['6'] : null, sp = Math.max(0, surplusM);
  if (k === 4) return SAVE.shareVaries * sp;
  const cap = k == null ? SAVE.noAnswer : SAVE.band[k];
  return Math.min(cap, SAVE.share * sp);
}
// FP round 5: the customer's own "My monthly saving" (S.saveM, today's money) is this year's amount. Raising it above the
// Q6 rule keeps the rule's later growth (never less than the rule in any year); lowering it caps every year. Monotone in S.saveM and in income.
function saveCap(surplusM, auto0){ const sp = Math.max(0, surplusM), auto = saveAuto(sp);
  if (S.saveM == null) return auto;
  const up = S.saveUp != null ? S.saveUp : S.saveM >= auto0 - 0.5;   // fixed when the customer moves the control (S.saveUp), so a later income change can't flip it
  return Math.min(sp, up ? Math.max(S.saveM, auto) : Math.min(S.saveM, auto)); }
function project(wi){
  applyAssume();
  const f = finNums(), a0 = f.age, R = f.R, N = AS.end - a0, rg = S.goals.find(g => g.kind === 'retire');
  wi = wi || {}; const wg = wi.g != null ? S.goals.find(g => g.id === wi.g) : null, wm = +wi.m || 0, wl = +wi.l || 0;
  const wgR = wg && wg.kind === 'retire';
  // Goals funded from savings: spend, mfree, pot. Retirement uses the pension + cashflow; legacy is what is left at the end.
  const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).map(g => Object.assign({}, g, {age:clamp(g.age, a0 + 1, AS.end)})).sort(GOAL_ORDER);
  // Mortgage balance path, so "Be mortgage-free" has a known cost at its date
  const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1){ const pay = Math.min(f.mortPayM * 12, m * (1 + AS.mortRate)); m = m * (1 + AS.mortRate) - pay; } } }
  const G = {}; fg.forEach(g => { const n = Math.max(0, g.age - a0), r = n >= SAVE.longYrs ? AS.inv : AS.cash;
    const cost = g.kind === 'mfree' ? (f.mortBal > 0 ? mPath[Math.min(n + 1, N)] : g.amount * Math.pow(1 + AS.infl, n)) : g.amount * Math.pow(1 + AS.infl, n);
    G[g.id] = {g, n, r, cost, pot:0, paid:0, done:false, c0:0, cSum:0, cYrs:0, need0:0}; });
  // 1. Lump sums. Each goal's own "saved so far" first (taken from cash), then a buffer is held back, then free cash + investments in goal order.
  const dPay = Math.max(f.debtPayM * 12, annPay(f.debt, AS.debtRate, 5));
  let cash = f.cash, inv = f.invest, pen = f.pension, mBal = f.mortBal, dBal = f.debt, mfreeDone = false;
  fg.forEach(g => { const s = Math.min(g.saved || 0, cash); G[g.id].pot += s; cash -= s; });
  if (wg && !wgR && G[wg.id]) G[wg.id].pot += wl; if (wgR) pen += wl;
  const hasSafety = fg.some(g => g.k === 'safety');
  let buffer = hasSafety ? 0 : Math.min(cash, SAVE.buffer * f.costsM); cash -= buffer;
  let free = cash + inv;                                       // unallocated money (spent first in a shortfall, funds retirement and legacy)
  fg.forEach(g => { const x = G[g.id], want = Math.max(0, x.cost / Math.pow(1 + x.r, x.n) - x.pot), take = Math.min(want, free); x.pot += take; free -= take; });
  const gr = 0.6 * AS.cash + 0.4 * AS.inv;                     // unallocated money: same 60/40 cash/invest mix as before
  const gf = {}; S.goals.forEach(g => gf[g.id] = {cost:0, cov:0});
  const rows = []; let auto0 = 0;
  for (let t = 0; t <= N; t++){
    const a = a0 + t, infl = Math.pow(1 + AS.infl, t), wgw = Math.pow(1 + AS.wage, t), working = a < R;
    let inflow = 0;
    if (working){
      const gR = f.income * wgw / infl, E = f.pensionM * 12 * (f.work === 'Self-employed' ? 1 : 0.5) * wgw / infl;
      inflow += (netPay(gR) - pensionCost(gR, E, a) - (f.work === 'Self-employed' ? 0.03 * Math.max(0, gR - 100000) : 0)) * infl;   // FP round 4 F10: self-employed USC surcharge
      if (f.married){ const pa = f.pAge + t, pR = pa < 66 ? f.pIncome * wgw / infl : 0; inflow += jointGain(gR, pR) * infl; }   // FP round 4 S3: joint assessment (married / civil partners)
      let contrib = f.pensionM * 12 * wgw; if (wgR) contrib = Math.max(0, contrib + wm * 12);
      pen = pen * (1 + AS.pen) + contrib;
      if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;
    } else {
      if (a === R){ const ls = Math.min(pen * 0.25, 200000); pen -= ls; free += ls; }
      const draw = pen * Math.min(1, Math.max(1 / Math.max(1, AS.end - a + 1), a >= 71 ? 0.05 : a >= 61 ? 0.04 : 0)); pen = (pen - draw) * (1 + AS.penRet);
      inflow += netRet(draw / infl, a >= AS.spAge ? AS.sp * f.sp : 0, a) * infl;
    }
    if (f.partner){ const pa = f.pAge + t; inflow += pa < 66 ? netPay(f.pIncome * wgw / infl) * infl : AS.sp * f.sp * infl; }
    inflow += (f.otherM + f.rentM) * 12 * infl;
    let living = (working ? f.costsM * 12 : (rg ? rg.amount : f.costsM * 12 * 0.8)) * infl + f.oneOffY * infl;
    let fixed = 0;
    if (mBal > 1 && !mfreeDone){ const pay = Math.min(f.mortPayM * 12, mBal * (1 + AS.mortRate)); fixed += pay; mBal = mBal * (1 + AS.mortRate) - pay; }
    if (dBal > 1){ const pay = Math.min(dPay, dBal * (1 + AS.debtRate)); fixed += pay; dBal = dBal * (1 + AS.debtRate) - pay; }
    // 2. Goals due this year are paid from their own pot, then from unallocated money. What can't be paid is a goal gap (shown on the road).
    let goalPaid = 0, goalGap = 0, goalCost = 0; const due = [], dueG = [];
    fg.forEach(g => { const x = G[g.id]; if (x.done || g.age > a) return; x.done = true; due.push(g.name);
      if (g.kind === 'pot'){ x.paid = Math.min(x.cost, x.pot); goalGap += x.cost - x.paid;
        if (g.k === 'safety') buffer += x.pot; else free += x.pot; x.pot = 0; }          // the safety net stays as the buffer; a wealth pot becomes free money
      else { let pay = Math.min(x.cost, x.pot); x.pot -= pay; const top = Math.min(x.cost - pay, free); free -= top; pay += top; free += x.pot; x.pot = 0;
        x.paid = pay; goalPaid += pay; goalGap += x.cost - pay; if (g.kind === 'mfree' && pay >= x.cost - 1){ mfreeDone = true; mBal = 0; } else if (g.kind === 'mfree') mBal = Math.max(0, mBal - pay); }
      gf[g.id].cost = x.cost; gf[g.id].cov = x.paid; goalCost += x.cost; dueG.push({id:g.id, name:g.name, e:g.e, kind:g.kind, cost:x.cost, paid:x.paid}); });   // exposed for the Detail chart
    // 3. Spare money this year. Only the saving amount is saved; the rest is assumed spent.
    const net = inflow - living - fixed; let used = 0, short = 0, saved = 0, spent = 0;
    if (t === 0) auto0 = saveAuto(Math.max(0, net) / 12);         // the Q6 rule's amount today (FP round 5)
    if (net >= 0){
      const base = working ? saveCap(net / 12 / infl, auto0) * 12 * infl : 0;
      let budget = Math.max(0, base + (!wgR && wm < 0 && working ? wm * 12 * infl : 0));         // "saving less" lowers the saving amount
      const extra = !wgR && wm > 0 && working && wg && G[wg.id] && !G[wg.id].done ? wm * 12 * infl : 0;  // "extra towards X" (today's money, kept level in real terms)
      budget = Math.min(budget, net); const ex = Math.min(extra, net - budget); saved = budget + ex; spent = net - saved;
      if (ex > 0){ const x = G[wg.id], n = x.g.age - a, need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(ex, need);
        x.pot += give; x.cSum += give / infl; free += ex - give; if (t === 0) x.c0 += give; }
      fg.forEach(g => { const x = G[g.id]; if (x.done) return; const n = g.age - a;
        const need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(budget, need);
        if (t === 0) x.need0 = need; x.pot += give; budget -= give; x.cSum += give / infl; x.cYrs++; if (t === 0) x.c0 += give; });
      free += budget;
      if (!working){ free += spent; saved += spent; spent = 0; }   // FP round 4 F7: retired income above the spending goal stays in savings                                            // saved but not needed by any goal: unallocated
    } else {
      fg.forEach(g => { const x = G[g.id]; if (!x.done){ x.cYrs++; if (t === 0) x.need0 = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, g.age - a)) / annF(g.age - a, x.r, AS.wage)); } });
      let gap = -net; const take = v => { const d = Math.min(gap, v); gap -= d; used += d; return d; };
      free -= take(free); buffer -= take(buffer);
      fg.slice().reverse().forEach(g => { const x = G[g.id]; if (!x.done && gap > 0) x.pot -= take(x.pot); });   // Nice-to-have and latest goals give way first
      short = gap;
    }
    // 4. Growth
    free *= 1 + gr; buffer *= 1 + AS.cash; fg.forEach(g => { const x = G[g.id]; if (!x.done) x.pot *= 1 + x.r; });
    if (rg && !working){ gf[rg.id].cost += living; gf[rg.id].cov += living - Math.min(short, living); }
    const pots = fg.reduce((s, g) => s + G[g.id].pot, 0), liquid = free + buffer + pots;
    S.goals.forEach(g => { if (g.kind === 'legacy' && t === N){ const tgt = g.amount * infl; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, free + buffer); } });
    rows.push({t, a, yr:YEAR0 + t, inflow, needs:living + fixed, goalPaid, living, fixed, goalCost, dueG, short:short + goalGap, shortLiving:short, goalGap, due, used, saved, spent, liquid, pen, retired:!working, rmark:a === R});
  }
  // 5. Results. Floor, so 99.6% never reads as 100%.
  const pct = {}, goal = {};
  S.goals.forEach(g => { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? (x.cov >= x.cost - 1 ? 100 : clamp(Math.floor(x.cov / x.cost * 100), 0, 99)) : 100; });
  fg.forEach(g => { const x = G[g.id];
    goal[g.id] = {cost:x.cost, have:x.paid, rate:x.r, years:x.n,
      needM:Math.round(x.need0 / 12), nowM:Math.round(x.c0 / 12), avgM:x.cYrs ? Math.round(x.cSum / x.cYrs / 12) : 0}; });
  fg.forEach(g => { if (pct[g.id] < 95){ const r = rows[g.age - a0]; if (r) r.goalShort = true; } });   // FP round 4 F1: colours follow the %
  if (rg && rows.some(r => r.retired && r.shortLiving > Math.max(500, r.needs * 0.02))) pct[rg.id] = Math.min(pct[rg.id], 94);
  const s0 = rows[0], sur0 = f.age < R ? (s0.saved + s0.spent) / 12 : 0;
  return {rows, pct, goal, save:{surplusM:Math.round(sur0), saveM:Math.round(s0.saved / 12), autoM:auto0}};
}
const band = p => p >= 95 ? 'good' : p >= 70 ? 'nudge' : 'alert';   // teal / gold / coral (Pooja, 1 Oct); weather emojis stay as icons
const BANDW = {good:'On track', nudge:'Needs a nudge', alert:'Needs attention'}, BANDE = {good:'☀️', nudge:'🌦️', alert:'⛈️'};
const isShort = r => r.shortLiving > Math.max(500, r.needs * 0.02) || !!r.goalShort;
const rowCol = r => isShort(r) ? 'var(--alert)' : r.used > 1 ? 'var(--nudge)' : 'var(--good)';
function extraFor(g){ for (const m of [25,50,75,100,150,200,250,300,400,500,600,750,1000,1250,1500,2000]){ if (project({g:g.id, m, l:0}).pct[g.id] >= 95) return m; } return null; }
module.exports={project,finNums,netPay,netRet,incomeTax,usc,prsi,pensionCost,mkGoal,AS,TX,isShort,rowCol,band,SAVE,setS:s=>{S=s},getS:()=>S};
