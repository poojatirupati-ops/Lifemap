let S;
const AS = {infl:0.025, wage:0.03, cash:0.007, inv:0.03, pen:0.04, penRet:0.028, sp:15564, spAge:66, end:90, mortRate:0.038, debtRate:0.09};
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
function saveCap(surplusM){                                  // monthly saving, today's money, before what-if
  const k = typeof S.ans['6'] === 'number' ? S.ans['6'] : null, sp = Math.max(0, surplusM);
  if (k === 4) return SAVE.shareVaries * sp;
  const cap = k == null ? SAVE.noAnswer : SAVE.band[k];
  return Math.min(cap, SAVE.share * sp);
}
function project(wi){
  applyAssume();
  const f = finNums(), a0 = f.age, R = f.R, N = AS.end - a0, rg = S.goals.find(g => g.kind === 'retire');
  wi = wi || {}; const wg = wi.g != null ? S.goals.find(g => g.id === wi.g) : null, wm = +wi.m || 0, wl = +wi.l || 0;
  const wgR = wg && wg.kind === 'retire';
  // Goals funded from savings: spend, mfree, pot. Retirement uses the pension + cashflow; legacy is what is left at the end.
  const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).slice().sort(GOAL_ORDER);
  // Mortgage balance path, so "Be mortgage-free" has a known cost at its date
  const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1){ const pay = Math.min(f.mortPayM * 12, m * (1 + AS.mortRate)); m = m * (1 + AS.mortRate) - pay; } } }
  const G = {}; fg.forEach(g => { const n = Math.max(0, g.age - a0), r = n >= SAVE.longYrs ? AS.inv : AS.cash;
    const cost = g.kind === 'mfree' ? (f.mortBal > 0 ? mPath[Math.min(n, N)] : g.amount * Math.pow(1 + AS.infl, n)) : g.amount * Math.pow(1 + AS.infl, n);
    G[g.id] = {g, n, r, cost, pot:0, paid:0, done:false, c0:0, cSum:0, cYrs:0, need0:0}; });
  // 1. Lump sums. Each goal's own "saved so far" first (taken from cash), then a buffer is held back, then free cash + investments in goal order.
  let cash = f.cash, inv = f.invest, pen = f.pension, mBal = f.mortBal, dBal = f.debt, mfreeDone = false;
  fg.forEach(g => { const s = Math.min(g.saved || 0, cash); G[g.id].pot += s; cash -= s; });
  if (wg && !wgR && G[wg.id]) G[wg.id].pot += wl; if (wgR) pen += wl;
  const hasSafety = fg.some(g => g.k === 'safety');
  let buffer = hasSafety ? 0 : Math.min(cash, SAVE.buffer * f.costsM); cash -= buffer;
  let free = cash + inv;                                       // unallocated money (spent first in a shortfall, funds retirement and legacy)
  fg.forEach(g => { const x = G[g.id], want = Math.max(0, x.cost / Math.pow(1 + x.r, x.n) - x.pot), take = Math.min(want, free); x.pot += take; free -= take; });
  const gr = 0.6 * AS.cash + 0.4 * AS.inv;                     // unallocated money: same 60/40 cash/invest mix as before
  const gf = {}; S.goals.forEach(g => gf[g.id] = {cost:0, cov:0});
  const rows = [];
  for (let t = 0; t <= N; t++){
    const a = a0 + t, infl = Math.pow(1 + AS.infl, t), wgw = Math.pow(1 + AS.wage, t), working = a < R;
    let inflow = 0;
    if (working){
      const gR = f.income * wgw / infl, E = f.pensionM * 12 * (f.work === 'Self-employed' ? 1 : 0.5) * wgw / infl;
      inflow += (netPay(gR) - pensionCost(gR, E, a)) * infl;
      let contrib = f.pensionM * 12 * wgw; if (wgR) contrib = Math.max(0, contrib + wm * 12);
      pen = pen * (1 + AS.pen) + contrib;
      if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;
    } else {
      if (a === R){ const ls = Math.min(pen * 0.25, 200000); pen -= ls; free += ls; }
      const draw = pen / Math.max(1, AS.end - a + 1); pen = (pen - draw) * (1 + AS.penRet);
      inflow += netRet(draw / infl, a >= AS.spAge ? AS.sp * f.sp : 0, a) * infl;
    }
    if (f.partner){ const pa = f.pAge + t; inflow += pa < 66 ? netPay(f.pIncome * wgw / infl) * infl : AS.sp * f.sp * infl; }
    inflow += (f.otherM + f.rentM) * 12 * infl;
    let living = (working ? f.costsM * 12 : (rg ? rg.amount : f.costsM * 12 * 0.8)) * infl + f.oneOffY * infl;
    let fixed = 0;
    if (mBal > 1 && !mfreeDone){ const pay = Math.min(f.mortPayM * 12, mBal * (1 + AS.mortRate)); fixed += pay; mBal = mBal * (1 + AS.mortRate) - pay; }
    if (dBal > 1){ const pay = Math.min(Math.max(f.debtPayM * 12, dBal * 0.1), dBal * (1 + AS.debtRate)); fixed += pay; dBal = dBal * (1 + AS.debtRate) - pay; }
    // 2. Goals due this year are paid from their own pot, then from unallocated money. What can't be paid is a goal gap (shown on the road).
    let goalGap = 0; const due = [];
    fg.forEach(g => { const x = G[g.id]; if (x.done || g.age > a) return; x.done = true; due.push(g.name);
      if (g.kind === 'pot'){ x.paid = Math.min(x.cost, x.pot); goalGap += x.cost - x.paid;
        if (g.k === 'safety') buffer += x.pot; else free += x.pot; x.pot = 0; }          // the safety net stays as the buffer; a wealth pot becomes free money
      else { let pay = Math.min(x.cost, x.pot); x.pot -= pay; const top = Math.min(x.cost - pay, free); free -= top; pay += top; free += x.pot; x.pot = 0;
        x.paid = pay; goalGap += x.cost - pay; if (g.kind === 'mfree' && pay >= x.cost - 1){ mfreeDone = true; mBal = 0; } }
      gf[g.id].cost = x.cost; gf[g.id].cov = x.paid; });
    // 3. Spare money this year. Only the saving amount is saved; the rest is assumed spent.
    const net = inflow - living - fixed; let used = 0, short = 0, saved = 0, spent = 0;
    if (net >= 0){
      const base = working ? saveCap(net / 12 / infl) * 12 * infl : 0;
      let budget = Math.max(0, base + (!wgR && wm < 0 && working ? wm * 12 * infl : 0));         // "saving less" lowers the saving amount
      const extra = !wgR && wm > 0 && working && wg && G[wg.id] && !G[wg.id].done ? wm * 12 * infl : 0;  // "extra towards X" (today's money, kept level in real terms)
      budget = Math.min(budget, net); const ex = Math.min(extra, net - budget); saved = budget + ex; spent = net - saved;
      if (ex > 0){ const x = G[wg.id], n = x.g.age - a, need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(ex, need);
        x.pot += give; x.cSum += give / infl; free += ex - give; if (t === 0) x.c0 += give; }
      fg.forEach(g => { const x = G[g.id]; if (x.done) return; const n = g.age - a;
        const need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(budget, need);
        if (t === 0) x.need0 = need; x.pot += give; budget -= give; x.cSum += give / infl; x.cYrs++; if (t === 0) x.c0 += give; });
      free += budget;                                            // saved but not needed by any goal: unallocated
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
    rows.push({t, a, yr:YEAR0 + t, inflow, needs:living + fixed, short:short + goalGap, shortLiving:short, goalGap, due, used, saved, spent, liquid, pen, retired:!working, rmark:a === R});
  }
  // 5. Results. Floor, so 99.6% never reads as 100%.
  const pct = {}, goal = {};
  S.goals.forEach(g => { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? (x.cov >= x.cost - 1 ? 100 : clamp(Math.floor(x.cov / x.cost * 100), 0, 99)) : 100; });
  fg.forEach(g => { const x = G[g.id];
    goal[g.id] = {cost:x.cost, have:x.paid, rate:x.r, years:x.n,
      needM:Math.round(x.need0 / 12), nowM:Math.round(x.c0 / 12), avgM:x.cYrs ? Math.round(x.cSum / x.cYrs / 12) : 0}; });
  const s0 = rows[0], sur0 = f.age < R ? (s0.saved + s0.spent) / 12 : 0;
  return {rows, pct, goal, save:{surplusM:Math.round(sur0), saveM:Math.round(s0.saved / 12)}};
}
let id=1; const G=(k,name,amount,age,kind,prio='Must have',saved=0)=>({id:id++,k,name,amount,age,kind,prio,saved});
const P=[
 {name:'A Pooja example: 30, single, €55k, costs €2,400, cash €6k, Q6 €100-300',
  about:{age:30,partner:false}, retireAge:66, q6:1,
  fin:{work:'Employed',income:55000,costsM:2400,cash:6000,invest:0,pension:12000,pensionM:300,sp:'Expect full'},
  goals:a=>[G('safety','Safety net',10000,a+2,'pot'),G('home','Buy a home',40000,a+18,'spend'),G('business','Start a business',25000,a+26,'spend','Nice to have'),G('wealth','Grow my wealth',50000,a+27,'pot','Nice to have')]},
 {name:'B Couple 40, €75k+€45k, costs €4,000, mortgage, cash €30k, inv €20k, Q6 Over €750',
  about:{age:40,partner:true}, retireAge:65, q6:3,
  fin:{work:'Employed',income:75000,pIncome:45000,pAge:40,costsM:4000,cash:30000,invest:20000,pension:90000,pensionM:900,home:'Own with mortgage',mortBal:220000,mortPayM:1300,mortYears:22,sp:'Expect full'},
  goals:a=>[G('car','Change the car',30000,a+3,'spend','Nice to have'),G('edu',"Kids' education",60000,a+10,'spend'),G('mfree','Be mortgage-free',220000,a+15,'mfree','Nice to have'),G('retire','Retire comfortably',45000,65,'retire')]},
 {name:'C 26, single, €32k, costs €2,000, cash €1.5k, Q6 Under €100',
  about:{age:26,partner:false}, retireAge:66, q6:0,
  fin:{work:'Employed',income:32000,costsM:2000,cash:1500,invest:0,pension:0,pensionM:0,sp:'Expect full'},
  goals:a=>[G('travel','Travel',8000,a+2,'spend','Nice to have'),G('wedding','Wedding',25000,a+3,'spend'),G('home','Buy a home',40000,a+5,'spend'),G('retire','Retire comfortably',30000,66,'retire')]},
 {name:'D 50, €120k, costs €4,500, cash €80k, inv €250k, pension €400k, Q6 Over €750',
  about:{age:50,partner:false}, retireAge:63, q6:3,
  fin:{work:'Employed',income:120000,costsM:4500,cash:80000,invest:250000,pension:400000,pensionM:1500,sp:'Expect full'},
  goals:a=>[G('helpfam','Help my family',20000,a+8,'spend'),G('wealth','Grow my wealth',50000,a+10,'pot'),G('retire','Retire comfortably',50000,63,'retire'),G('legacy','Leave a legacy',100000,85,'legacy','Nice to have')]},
];
for (const assume of ['standard','cautious']) for(const p of P){
  S={about:p.about,retireAge:p.retireAge,fin:p.fin,ans:{'6':p.q6},assume,goals:p.goals(p.about.age)};
  const o=projectOld(), n=project(), n2=project({g:S.goals[1].id,m:200,l:0});
  console.log('\n'+assume+' | '+p.name+' | save '+n.save.saveM+'/m of surplus '+n.save.surplusM+'/m');
  S.goals.forEach(g=>{const x=n.goal[g.id]; console.log('  '+g.name.padEnd(20)+' old '+String(o.pct[g.id]).padStart(3)+'%  new '+String(n.pct[g.id]).padStart(3)+'%'+(x?'  cost '+Math.round(x.cost)+' needs '+x.needM+'/m now '+x.nowM+'/m avg '+x.avgM+'/m':'')+'  | +200/m to goal2: '+n2.pct[g.id]+'%');});
  const sh=n.rows.filter(isShort).map(r=>r.a); console.log('  short years: '+(sh.length?sh[0]+'..'+sh[sh.length-1]+' ('+sh.length+')':'none')+'; old short: '+o.rows.filter(isShort).length);
}
// extra checks on persona A
const p=P[0]; S={about:p.about,retireAge:p.retireAge,fin:p.fin,ans:{'6':p.q6},assume:'standard',goals:p.goals(30)};
const show=(lbl,x)=>console.log(lbl.padEnd(28)+S.goals.map(g=>x.pct[g.id]+'%').join(' / ')+'  save '+x.save.saveM+'/m; short yrs '+x.rows.filter(isShort).map(r=>r.a).join(','));
show('A base',project()); show('A what-if -100/m',project({g:S.goals[1].id,m:-100,l:0})); show('A lump +10k to wealth',project({g:S.goals[3].id,m:0,l:10000}));
S.ans={}; show('A Q6 unanswered',project()); S.ans={'6':4}; show('A Q6 varies',project()); S.ans={'6':3}; show('A Q6 over 750',project());
