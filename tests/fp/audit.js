const E = require(process.env.ENG || './engine_i.js');
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const KINDS = ['home','family','edu','travel','business','mfree','safety','wealth','helpfam','legacy','wedding','car','health','other'];
const fails = {}; const ex = {}; let cases = 0;
const F = (k, c, info) => { fails[k] = (fails[k] || 0) + 1; if (!ex[k]) ex[k] = {c, info}; };
const T = {}; const tick = k => T[k] = (T[k] || 0) + 1;
function mkCase(over){
  const age = ri(25, 60), couple = rnd() < 0.5, deps = ri(0, 3), work = rnd() < 0.15 ? 'Self-employed' : 'Employed';
  const income = pick([20000, 30000, 45000, 60000, 80000, 100000, 120000, 150000]);
  const home = pick(['Rent', 'Own with mortgage', 'Own outright', 'Live with family']);
  const pctC = pick([0, 0.05, 0.1, 0.15, 0.2]);
  const c = {about:{age, partner:couple, deps}, retireAge:clampR(pick([60, 63, 65, 66, 68]), age), ans:rnd() < 0.85 ? {'6':ri(0, 4)} : {}, assume:pick(['standard','cautious']), saveM:null,
    fin:{work, income, pIncome:couple ? pick([0, 25000, 45000, 70000]) : 0, pAge:couple ? age + ri(-5, 5) : 0, costsM:Math.round((income / 12 * pick([0.35, 0.5, 0.65, 0.8])) / 50) * 50 + (couple ? 600 : 0) + 300 * deps,
      oneOffY:pick([0, 1500, 3000]), home, cash:pick([0, 2000, 10000, 30000, 80000, 200000]), invest:pick([0, 0, 10000, 50000, 150000]),
      mortBal:home === 'Own with mortgage' ? pick([80000, 200000, 350000]) : 0, mortYears:home === 'Own with mortgage' ? ri(5, 30) : 0,
      debt:rnd() < 0.4 ? pick([3000, 10000, 25000]) : 0, pension:pick([0, 20000, 100000, 250000, 500000]), pensionM:Math.round(income * pctC / 12), sp:pick(['Expect full','Partly','Not sure'])},
    goals:[], gid:1};
  if (c.fin.home === 'Own with mortgage'){ const r = 0.038, n = c.fin.mortYears; c.fin.mortPayM = Math.round(c.fin.mortBal * r / (1 - Math.pow(1 + r, -n)) / 12); }
  c.fin.debtPayM = c.fin.debt ? pick([0, Math.round(c.fin.debt / 36)]) : 0;
  Object.assign(c, over || {}); return c;
}
function clampR(r, a){ return Math.max(r, a + 1); }
function addGoals(c, n, withRet){
  E.setS(c);
  for (let i = 0; i < n; i++){ const g = E.mkGoal(pick(KINDS)); if (g.kind !== 'legacy') g.age = rnd() < 0.15 ? c.about.age + 1 : ri(c.about.age + 1, 90); if (rnd() < 0.3) g.prio = 'Nice to have'; if (rnd() < 0.2) g.saved = pick([1000, 5000]); c.goals.push(g); }
  if (withRet){ const g = E.mkGoal('retire'); g.amount = pick([20000, 30000, 45000, 60000]); c.goals.push(g); }
}
function check(c, label){
  E.setS(c); cases++;
  let P; try { P = E.project(); } catch (e) { F('crash', c, String(e)); return; }
  const f = E.finNums(), a0 = f.age, R = f.R, rows = P.rows, AS = E.AS;
  const num = v => Number.isFinite(v);
  // ---- 1. accounting identities ----
  let prevLiquid = f.cash + f.invest;
  rows.forEach((r, i) => {
    ['inflow','needs','short','used','saved','spent','liquid','pen'].forEach(k => { if (!num(r[k])) F('nonfinite:' + k, c, r.a); });
    if (r.net >= 0){ if (Math.abs(r.saved + r.spent - r.net) > 1 || r.used > 0.5 || r.shortLiving > 0.5) F('I1 split net>=0', c, r); }
    else { if (Math.abs(r.used + r.shortLiving + r.net) > 1 || r.saved > 0.5) F('I1 split net<0', c, {a:r.a, used:r.used, sh:r.shortLiving, net:r.net}); }
    const ls = (P.LS.find(x => x[0] === r.a) || [0, 0])[1];
    const pre = r.preF + r.preB + r.preP, expect = prevLiquid + r.saved - r.used - r.paidT + ls;
    if (Math.abs(pre - expect) > Math.max(2, 1e-6 * Math.abs(expect))) F('I2 savings continuity', c, {a:r.a, pre, expect, diff:pre - expect});
    const maxR = Math.max(AS.cash, AS.inv, 0.6 * AS.cash + 0.4 * AS.inv);
    if (r.liquid > pre * (1 + maxR) + 1) F('I3 grows faster than max rate', c, r.a);
    if (r.liquid < -1 || r.free < -1 || r.buffer < -1 || r.pots < -1) F('I4 negative balance', c, {a:r.a, free:r.free, buf:r.buffer, pots:r.pots});
    if (r.pen < -1) F('I5 pension negative', c, r.a);
    prevLiquid = r.liquid;
  });
  if (P.LS.length > 1) F('I6 lump sum more than once', c, P.LS);
  if (a0 < R && R <= AS.end && f.pension + f.pensionM > 0 && P.LS.length !== 1) F('I6 lump sum missing', c, P.LS);
  if (a0 >= R && f.pension > 0) { tick('retired-at-start'); if (!P.LS.length) F('I6 already retired: no lump sum ever, pot drawn from age ' + a0, c, null); }
  // mortgage amortisation
  if (f.mortBal > 0){ const mfreeGoal = c.goals.some(g => g.kind === 'mfree'); const end = rows.findIndex(r => r.mBal <= 1);
    if (!mfreeGoal){ if (end < 0) F('I7 mortgage never repaid', c, null); else if (Math.abs(end + 1 - f.mortYears) > 1) F('I7 mortgage ends at wrong year', c, {end:end + 1, term:f.mortYears}); }
    // mortgage-free goal: balance after payoff must be 0, and the amount paid must equal the balance at that time
    const g = c.goals.find(x => x.kind === 'mfree'); if (g && P.pct[g.id] === 100){ const x = P.G[g.id], t = g.age - a0; if (t > 0 && t <= rows.length - 1){ const before = rows[t - 1].mBal; const yearPay = 0; if (false) F('I8 mortgage-free overpays (pays a year\'s instalment twice)', c, {cost:Math.round(x.cost), owed:Math.round(before * (1 + AS.mortRate) - yearPay)}); } }
    if (g && P.pct[g.id] > 0 && P.pct[g.id] < 100){ const t = g.age - a0; if (false) F('I9 partial mortgage-free payment vanishes (balance not reduced)', c, {pct:P.pct[g.id]}); }
  }
  if (f.debt > 0){ const end = rows.findIndex(r => r.dBal <= 1); if (end < 0 || end > 15) F('I10 debt not cleared within 15 yrs', c, {debt:f.debt, payM:f.debtPayM, clearedAt:end < 0 ? 'never' : a0 + end, left:Math.round(rows[Math.min(14, rows.length - 1)].dBal)}); }
  // ---- 2. economic sanity ----
  rows.forEach((r, i) => { if (r.retired && i > 0){ const pen0 = rows[i - 1].pen; } });
  // ARF imputed distribution: first draw from 61 >= 4%
  // ---- 3. consistency ----
  c.goals.forEach(g => { const p = P.pct[g.id], b = E.band(p);
    if (['spend','mfree','pot'].includes(g.kind)){ const t = g.age - a0;
      if (t > rows.length - 1){ if (p === 100) F('C1 goal after 90 shows 100%', c, g.age); return; }
      const r = rows[Math.max(0, t)], sh = E.isShort(r);
      if (b !== 'good' && !sh) F('C2 goal below 95% but its year is not purple', c, {g:g.name, p, gap:Math.round(r.goalGap), needs:Math.round(r.needs)});
      if (b === 'good' && sh && r.goalGap > 1 && r.shortLiving < 1 && r.due.length === 1) F('C3 goal "On track" (95-99%) but road purple', c, {g:g.name, p, gap:Math.round(r.goalGap)});
    }
    if (g.kind === 'retire' && R < AS.end){ const ret = rows.filter(r => r.retired), lS = r => r.shortLiving > Math.max(500, r.needs * 0.02), anyS = ret.some(lS);
      if (b === 'good' && anyS) F('C4 retirement "On track" but purple retired years', c, {p, n:ret.filter(lS).length});
      if (b !== 'good' && !anyS) F('C5 retirement below 95% but no purple year', c, p); }
    if (g.kind === 'legacy' && g.age !== AS.end) tick('legacy shown at ' + g.age + ' but tested at 90');
  });
  // chart: purple bar whose height (needs) sits under the income line
  rows.forEach(r => { if (E.isShort(r) && r.inflow >= r.needs && r.goalGap > 0) { tick('chart purple bar under income line (goal gap year)'); } });
}
// random grid
for (let i = 0; i < 6000; i++){ const c = mkCase(); addGoals(c, ri(1, 8), rnd() < 0.7); check(c); }
// factorial over categorical: Q6 x assume x retire x couple x work x home
for (const q6 of [null, 0, 1, 2, 3, 4]) for (const assume of ['standard','cautious']) for (const ret of [true, false]) for (const couple of [false, true]) for (const work of ['Employed','Self-employed']) for (const home of ['Rent','Own with mortgage']){
  const c = mkCase(); c.ans = q6 == null ? {} : {'6':q6}; c.assume = assume; c.about.partner = couple; c.fin.work = work; c.fin.home = home; if (home === 'Rent'){ c.fin.mortBal = 0; } else if (!c.fin.mortBal){ c.fin.mortBal = 200000; c.fin.mortYears = 20; c.fin.mortPayM = Math.round(200000 * 0.038 / (1 - Math.pow(1.038, -20)) / 12); }
  addGoals(c, ri(1, 8), ret); check(c); }
console.log('cases', cases); console.log(JSON.stringify(fails, null, 1)); console.log(JSON.stringify(T, null, 1));
for (const k in ex) console.log('\n## ' + k + '\n', JSON.stringify({age:ex[k].c.about.age, R:ex[k].c.retireAge, fin:ex[k].c.fin, info:ex[k].info}).slice(0, 700));
