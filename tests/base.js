const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)); const YEAR0=2026;
// Growth assumptions are the customer's choice (Pooja, 30 Sep 2026). Standard = default; Cautious = the Financial Planner's set. AS always holds the active set.
const AS_SETS = {standard:{infl:0.02, wage:0.025, cash:0.01, inv:0.045, pen:0.045, penRet:0.0315}, cautious:{infl:0.025, wage:0.03, cash:0.007, inv:0.03, pen:0.04, penRet:0.028}};
const AS_NAME = {standard:'Standard', cautious:'Cautious'};
function applyAssume(){ Object.assign(AS, AS_SETS[(S && S.assume) || 'standard']); }
// 2026 Irish rules, today's money. Bands/credits are assumed to rise with prices (call with income / infl, then multiply back).
const TX = {band:44000, credits:4000, ageCredit:245, ageExempt:18000,
  usc:[[12012, .005], [28700, .02], [70044, .03], [Infinity, .08]], uscExempt:13000, prsi:0.0435, prsiWk:352};
function incomeTax(g, cr){ return Math.max(0, 0.2 * Math.min(g, TX.band) + 0.4 * Math.max(0, g - TX.band) - (cr == null ? TX.credits : cr)); }
function usc(g, reduced){ if (g <= TX.uscExempt) return 0; const b = reduced ? [[12012, .005], [Infinity, .02]] : TX.usc; let t = 0, lo = 0;
  for (const [hi, r] of b){ t += Math.max(0, Math.min(g, hi) - lo) * r; lo = hi; if (g <= hi) break; } return t; }
function prsi(g){ const wk = g / 52; if (wk <= TX.prsiWk) return 0; const cr = wk <= 424 ? Math.max(0, 12 - (wk - 352.01) / 6) : 0; return Math.max(0, (wk * TX.prsi - cr) * 52); }
const pc = x => +(x * 100).toFixed(2) + '%';
// Assumption rows, all built from AS / TX so the copy never drifts from the engine (FP review C1–C10, W12)
function netPay(g){ return g <= 0 ? 0 : g - incomeTax(g) - usc(g) - prsi(g); }
// Retirement: no PRSI at 66+, State Pension is USC-exempt, age credit and age exemption from 65, reduced USC from 70 (income <= €60,000)
function netRet(draw, sp, age){ const g = draw + sp; if (g <= 0) return 0;
  const it = age >= 65 && g <= TX.ageExempt ? 0 : incomeTax(g, TX.credits + (age >= 65 ? TX.ageCredit : 0));
  return g - it - usc(draw, age >= 70 && g <= 60000); }
// Net cost to take-home of the employee's own pension contributions (relief at marginal income-tax rate, within age limits and the €115,000 cap)
const relLim = a => a < 30 ? .15 : a < 40 ? .2 : a < 50 ? .25 : a < 55 ? .3 : a < 60 ? .35 : .4;
function pensionCost(g, E, age){ const Er = Math.min(E, relLim(age) * Math.min(g, 115000)); return E - (incomeTax(g) - incomeTax(Math.max(0, g - Er))); }
function finNums(){
  // Skipped figures count as €0 and show as ❓ Missing. Only "Estimate for me" adds a (labelled) typical figure. (spec §11)
  const f = S.fin, n = k => { const v = f[k]; return v != null && v !== '' && !isNaN(+v) ? +v : 0; };
  const mortOn = f.home === 'Own with mortgage';
  return {age:S.about.age, R:S.retireAge, work:f.work, partner:!!S.about.partner, pAge:n('pAge') || S.about.age, income:f.work === 'Not working' ? 0 : n('income'), pIncome:S.about.partner ? n('pIncome') : 0,
    otherM:n('otherM'), costsM:n('costsM'), oneOffY:n('oneOffY'), cash:n('cash'), invest:n('invest'), rentM:n('rentM'),
    mortBal:mortOn ? n('mortBal') : 0, mortPayM:mortOn ? n('mortPayM') : 0, mortYears:mortOn ? n('mortYears') : 0, debt:n('debt'), debtPayM:n('debtPayM'),
    pension:n('pension'), pensionM:n('pensionM'), sp:f.sp === 'Expect full' ? 1 : f.sp === 'Partly' ? 0.6 : 0.8};
}
function projectOld(wi){
  applyAssume();
  const f = finNums(), goals = S.goals, a0 = f.age, R = f.R, N = AS.end - a0;
  wi = wi || {}; const wg = wi.g != null ? goals.find(g => g.id === wi.g) : null, wm = +wi.m || 0, wl = +wi.l || 0;
  let cash = f.cash, inv = f.invest, pen = f.pension, ear = 0, mBal = f.mortBal, dBal = f.debt, mfreeDone = false;
  if (wg && wg.kind === 'retire') pen += wl; else if (wg) ear = wl;
  const res = {}; goals.forEach(g => { const s = Math.min(g.saved || 0, cash); res[g.id] = s; cash -= s; });
  const gf = {}; goals.forEach(g => gf[g.id] = {cost:0, cov:0});
  const rows = []; const rg = goals.find(g => g.kind === 'retire');
  for (let t = 0; t <= N; t++){
    const a = a0 + t, infl = Math.pow(1 + AS.infl, t), wgw = Math.pow(1 + AS.wage, t), working = a < R;
    let inflow = 0;
    // FP review round 1 §3 (C5–C9): tax in today's money (bands indexed), own-share pension relief, drawdown tax, 25% tax-free lump sum
    if (working){
      const gR = f.income * wgw / infl;                                   // gross in today's money
      const E  = f.pensionM * 12 * (f.work === 'Self-employed' ? 1 : 0.5) * wgw / infl;   // own share of "paid in each month"
      inflow += (netPay(gR) - pensionCost(gR, E, a)) * infl;
      let contrib = f.pensionM * 12 * wgw; if (wg && wg.kind === 'retire') contrib = Math.max(0, contrib + wm * 12);
      pen = pen * (1 + AS.pen) + contrib;
      if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;                   // working past 66 (rare): keep as today
    } else {
      if (a === R){ const ls = Math.min(pen * 0.25, 200000); pen -= ls; cash += ls; }   // tax-free lump sum (limit is not indexed)
      const draw = pen / Math.max(1, AS.end - a + 1);                      // >= ARF imputed 4% (61-70) / 5% (71+)
      pen = (pen - draw) * (1 + AS.penRet);
      const sp = a >= AS.spAge ? AS.sp * f.sp : 0;                         // today's money
      inflow += netRet(draw / infl, sp, a) * infl;
    }
    if (f.partner){ const pa = f.pAge + t; if (pa < 66) inflow += netPay(f.pIncome * wgw / infl) * infl; else inflow += AS.sp * f.sp * infl; }
    inflow += (f.otherM + f.rentM) * 12 * infl;
    let living = working ? f.costsM * 12 * infl : (rg ? rg.amount * infl : f.costsM * 12 * infl * 0.8);
    living += f.oneOffY * infl;
    let fixed = 0;
    if (mBal > 1 && !mfreeDone){ const pay = Math.min(f.mortPayM * 12, mBal * (1 + AS.mortRate)); fixed += pay; mBal = mBal * (1 + AS.mortRate) - pay; }
    if (dBal > 1){ const pay = Math.min(Math.max(f.debtPayM * 12, dBal * 0.1), dBal * (1 + AS.debtRate)); fixed += pay; dBal = dBal * (1 + AS.debtRate) - pay; }
    if (!(wg && wg.kind === 'retire') && wm < 0 && working) fixed += -wm * 12; // saving less each month
    // earmarked what-if money grows until its goal
    if (wg && wg.kind !== 'retire' && wm > 0 && a < wg.age) ear = ear * (1 + AS.cash) + wm * 12; else if (wg && wg.kind !== 'retire') ear *= 1 + AS.cash;
    Object.keys(res).forEach(id => res[id] *= 1 + AS.cash);
    // goal costs this year
    const active = [];
    goals.forEach(g => {
      if (g.age !== a || (g.kind !== 'spend' && g.kind !== 'mfree')) return;
      let c = g.kind === 'mfree' ? (f.mortBal > 0 ? Math.max(0, mBal) : g.amount * infl) : g.amount * infl;
      const cost = c; let paid = Math.min(c, res[g.id] || 0); res[g.id] -= paid; c -= paid;
      if (wg && wg.id === g.id){ const p2 = Math.min(c, ear); ear -= p2; c -= p2; paid += p2; cash += ear; ear = 0; }
      cash += res[g.id] || 0; res[g.id] = 0;
      if (g.kind === 'mfree'){ mfreeDone = true; mBal = 0; }
      gf[g.id].cost += cost; gf[g.id].cov += paid; active.push({g, c});
    });
    const goalCost = active.reduce((s, x) => s + x.c, 0);
    const needs = living + fixed + goalCost;
    const net = inflow - needs; let used = 0, short = 0;
    if (net >= 0){ cash += net * 0.6; inv += net * 0.4; }
    else { let gap = -net; const a1 = Math.min(gap, cash); cash -= a1; gap -= a1; used += a1; const a2 = Math.min(gap, inv); inv -= a2; gap -= a2; used += a2; short = gap; }
    cash *= 1 + AS.cash; inv *= 1 + AS.inv;
    let unf = short;
    for (const {g, c} of active.slice().reverse()){ const hit = Math.min(unf, c); unf -= hit; gf[g.id].cov += c - hit; }
    if (rg && !working){ const hit = Math.min(unf, living); gf[rg.id].cost += living; gf[rg.id].cov += living - hit; unf -= hit; }
    const liquid = cash + inv + Object.values(res).reduce((s, x) => s + x, 0) + ear;
    goals.forEach(g => {
      if (g.kind === 'pot' && g.age === a){ const tgt = g.amount * infl, have = liquid; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, have); if (res[g.id]){ cash += res[g.id]; res[g.id] = 0; } if (wg && wg.id === g.id){ cash += ear; ear = 0; } }
      if (g.kind === 'legacy' && t === N){ const tgt = g.amount * infl; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, liquid); }
    });
    rows.push({t, a, yr:YEAR0 + t, inflow, needs, short, used, liquid, pen, retired:!working, rmark:a === R});
  }
  const pct = {}; goals.forEach(g => { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? clamp(Math.round(x.cov / x.cost * 100), 0, 100) : 100; });
  return {rows, pct};
}
const band = p => p >= 95 ? 'sunny' : p >= 70 ? 'showers' : 'storm';
const BANDW = {sunny:'On track', showers:'Needs a nudge', storm:'Needs attention'}, BANDE = {sunny:'☀️', showers:'🌦️', storm:'⛈️'};
const isShort = r => r.short > Math.max(500, r.needs * 0.02);
