// Loans group: loan comparison, loan affordability, credit card repayment, debt repayment, debt payoff plan.
// Each result is compared with an independent calculation written here (month-by-month loops and closed forms), over seeded random inputs.
// Usage: NODE_PATH=/opt/node22/lib/node_modules node tests/loans.js     Last line: FAILS n of m
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.resolve(__dirname, '../LifeGoals-Customer-Journey-Prototype.html')); await p.waitForTimeout(400);
  const cases = await p.evaluate(() => { let seed = 20261023; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648, R = (a, c, st) => Math.round((a + rnd() * (c - a)) / st) * st, out = [];
    const run = (id, v) => ({ id, v, num: C(id).run(v).num });
    for (let k = 0; k < 60; k++) out.push(run('loancompare', { a: R(500, 100000, 500), apr1: R(0, 35, 0.25), y1: R(1, 15, 1), apr2: R(0, 35, 0.25), y2: R(1, 15, 1) }));
    for (let k = 0; k < 60; k++) out.push(run('loanafford', { inc: R(500, 15000, 50), ess: R(0, 10000, 50), debt: R(0, 5000, 10), sav: k % 2 ? R(0, 2000, 25) : undefined, apr: R(0, 35, 0.25), y: R(1, 15, 1), share: R(10, 100, 5) }));
    for (let k = 0; k < 80; k++) out.push(run('creditcard', { b: R(100, 30000, 100), apr: R(0, 35, 0.5), p: R(10, 3000, 10), mp: k % 4 === 0 ? 0 : R(1, 10, 0.5), mf: R(0, 100, 0.5), t: R(6, 120, 1) }));
    for (let k = 0; k < 60; k++) out.push(run('debtpay', { b: R(100, 100000, 100), apr: R(0, 35, 0.5), p: R(10, 5000, 10), x: R(0, 1000, 10) }));
    for (let k = 0; k < 80; k++) out.push(run('debtplan', { b1: R(0, 100000, 100), apr1: R(0, 35, 0.5), m1: R(0, 3000, 5), b2: R(0, 100000, 100), apr2: R(0, 35, 0.5), m2: R(0, 3000, 5), b3: R(0, 100000, 100), apr3: R(0, 35, 0.5), m3: R(0, 3000, 5), x: R(0, 2000, 10) }));
    return out; });
  const iEq = r => Math.pow(1 + r / 100, 1 / 12) - 1, pmt = (P, i, n) => i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n, near = (a, c, e) => Math.abs(a - c) <= (e || 0.01);
  const fixed = (P, i, pay) => { if (pay <= P * i + 1e-12) return null; let bal = P, m = 0, ti = 0; while (bal > 0.005 && m < 5000){ const it = bal * i, q = Math.min(bal + it, pay); ti += it; bal = bal + it - q; m++; } return { m, ti }; };
  const minOnly = (P, i, pct, floor) => { let bal = P, m = 0, ti = 0; while (bal > 0.005 && m < 1200){ const it = bal * i, q = Math.min(bal + it, Math.max(floor, pct * bal)); ti += it; bal = bal + it - q; m++; } return bal > 0.005 ? null : { m, ti }; };
  const plan = (debts, extra, how) => { const ds = debts.filter(d => d.b > 0.005).map(d => ({ ...d })), pool = ds.reduce((z, d) => z + d.min, 0) + (how === 'none' ? 0 : extra); let m = 0, ti = 0, paid = 0;
    while (ds.some(d => d.b > 0.005) && m < 1200){ m++; ds.forEach(d => { if (d.b > 0.005){ const it = d.b * d.i; d.b += it; ti += it; d.k = d.b; } });
      let bud = how === 'none' ? ds.reduce((z, d) => z + (d.b > 0.005 ? d.min : 0), 0) : pool; const rem = ds.filter(d => d.b > 0.005);
      rem.forEach(d => { const q = Math.min(d.b, d.min, bud); d.b -= q; bud -= q; paid += q; });
      if (how !== 'none') ds.filter(d => d.b > 0.005).sort(how === 'avalanche' ? (a, c) => c.apr - a.apr : (a, c) => a.k - c.k).forEach(d => { const q = Math.min(d.b, bud); d.b -= q; bud -= q; paid += q; }); }
    return ds.some(d => d.b > 0.005) ? null : { m, ti, paid }; };
  let fails = 0, n = 0; const bad = (what, c) => { fails++; console.log('FAIL', what, JSON.stringify(c.v)); };
  for (const c of cases){ const v = c.v, num = c.num; n++;
    if (c.id === 'loancompare'){ for (const [t, a, y] of [['A', v.apr1, v.y1], ['B', v.apr2, v.y2]]){ const i = iEq(a), m = pmt(v.a, i, y * 12); if (!near(num['Repayment_' + t], m, 1e-6) || !near(num['Total_' + t], m * y * 12, 1e-6) || !near(num['Interest_' + t], m * y * 12 - v.a, 1e-6)) bad('compare ' + t, c); } if (!near(num.Interest_Difference, num.Interest_A - num.Interest_B, 1e-6)) bad('compare diff', c); }
    else if (c.id === 'loanafford'){ const i = iEq(v.apr), nn = v.y * 12, spare = v.inc - v.ess - v.debt - (v.sav || 0), use = Math.max(0, spare) * v.share / 100, L = num.Loan_Amount;
      if (!near(pmt(L, i, nn), use, 1e-6) || !near(num.Repayment_Used, use, 1e-9) || !near(num.Repayment_If_Rate_Up, pmt(L, iEq(v.apr + 3), nn), 1e-6) || !near(num.Total_Interest, use * nn - L, 1e-6)) bad('afford', c); }
    else if (c.id === 'creditcard'){ const i = iEq(v.apr), yp = fixed(v.b, i, v.p), okY = yp ? num.Months_Your_Payment === yp.m && near(num.Interest_Your_Payment, yp.ti) : num.Months_Your_Payment === 'Never';
      const have = v.mp > 0 || v.mf > 0, mo = have ? minOnly(v.b, i, v.mp / 100, v.mf) : undefined, okM = have ? (mo ? num.Months_Minimum === mo.m && near(num.Interest_Minimum, mo.ti) : num.Months_Minimum === 'Never') : num.Months_Minimum === '—';
      let bal = v.b; const pm = num.Payment_Target; for (let k = 0; k < v.t; k++) bal = bal * (1 + i) - pm;
      if (!okY || !okM || !near(num.Interest_This_Month, v.b * i, 1e-9) || !near(bal, 0, 1e-6)) bad('card', c); }
    else if (c.id === 'debtpay'){ const i = iEq(v.apr), a = fixed(v.b, i, v.p + v.x); if (a ? !(num.Months_To_Clear === a.m && near(num.Total_Interest, a.ti)) : num.Months_To_Clear !== 'Never') bad('debtpay', c); }
    else { const ds = [1, 2, 3].map(k => ({ b: v['b' + k], apr: v['apr' + k], i: iEq(v['apr' + k]), min: v['m' + k] })); if (!ds.some(d => d.b > 0.005)) continue;
      for (const [key, how] of [['Highest_Rate', 'avalanche'], ['Smallest_Balance', 'snowball'], ['Minimums', 'none']]){ const r = plan(ds, v.x, how), jm = num['Months_' + key], ji = num['Interest_' + key];
        if (r ? !(jm === r.m && near(ji, r.ti) && near(r.paid + 0, ds.reduce((z, d) => z + d.b, 0) + r.ti, 0.01)) : jm !== 'Never') { bad('plan ' + key, c); break; } }   // payments made = debt + interest
      const live = ds.filter(d => d.b > 0.005); if (live.length === 1){ const s = fixed(live[0].b, live[0].i, live[0].min + v.x); const r = plan(ds, v.x, 'avalanche'); if (s ? !(r && r.m === s.m && near(r.ti, s.ti)) : r) bad('plan single debt', c); } } }
  // the two debt calculators say different things: names, questions, and the minimum rule is never defaulted
  const meta = await p.evaluate(() => ({ cc: C('creditcard'), dp: C('debtpay'), mp: C('creditcard').inputs.find(i => i.k === 'mp').v, mf: C('creditcard').inputs.find(i => i.k === 'mf').v, cats: CATS.map(c => c.id + ':' + CALCS.filter(x => x.cat === c.id).map(x => x.id).join(',')), tools: TOPIC_TOOLS }));
  n += 4; if (meta.cc.q === meta.dp.q) { fails++; console.log('FAIL same question'); } if (meta.mp !== 0 || meta.mf !== 0) { fails++; console.log('FAIL minimum rule has a default'); }
  const want = 'loans:loan,loancompare,loanafford,creditcard,debtpay,debtplan'; if (!meta.cats.includes(want)) { fails++; console.log('FAIL Loans group order', meta.cats); }
  if (JSON.stringify(meta.tools.Loans) !== JSON.stringify(['loan', 'loancompare', 'loanafford', 'creditcard', 'debtpay', 'debtplan'])) { fails++; console.log('FAIL Loans focus page', meta.tools.Loans); }
  // wording and edge rules found in review: a payment below the minimum is flagged and never "saves" a negative amount; a floor-only minimum counts; no "never" mislabelled as 100 years
  const ed = await p.evaluate(() => { const r = (id, v) => C(id).run(v); const below = r('creditcard', { b: 3000, apr: 21, p: 50, mp: 3, mf: 6.35, t: 36 }), floor = r('creditcard', { b: 3000, apr: 21, p: 150, mp: 0, mf: 25, t: 36 }), grow = r('creditcard', { b: 3000, apr: 21, p: 150, mp: 0.5, mf: 0, t: 36 }), aff = r('loanafford', { inc: 3000, ess: 1800, debt: 200, apr: 9, y: 5, share: 100 }), zero = r('debtplan', { b1: 4000, apr1: 20, m1: 100, b2: 1000, apr2: 5, m2: 0, b3: 0, apr3: 5, m3: 0, x: 0 }), one = r('debtplan', { b1: 4000, apr1: 20, m1: 100, b2: 0, apr2: 5, m2: 0, b3: 0, apr3: 5, m3: 0, x: 0 });
    return { belowLine: below.line, belowSaved: below.rows.some(x => x && /saved/.test(x[0])), floorVal: floor.val, floorNum: floor.num.Months_Minimum, growVal: grow.val, affLbl: aff.lbl, affLine: aff.line, zeroLine: zero.line, oneLine: one.line }; });
  const chk = (ok, what) => { n++; if (!ok) { fails++; console.log('FAIL', what); } };
  chk(/below your card/.test(ed.belowLine) && !ed.belowSaved && !/saves about/.test(ed.belowLine), 'payment below the minimum is flagged, no saving shown');
  chk(ed.floorVal === 'Never' && ed.floorNum === 'Never', 'a floor-only minimum below the interest never clears');
  chk(ed.growVal === 'Never', 'a minimum that does not cover the interest says Never, not Over 100 years');
  chk(/supports/.test(ed.affLbl) && /no buffer/.test(ed.affLine) && /more than your spare money/.test(ed.affLine) && /not a lender/.test(ed.affLine), 'affordability is a size that fits, with the buffer and stress warnings');
  chk(/€0 repayment/.test(ed.zeroLine) && !/saves about €0/.test(ed.oneLine) && !/saves about/.test(ed.oneLine), 'debt plan: zero-repayment note, no "saves €0"');
  // refinements: saving is subtracted, high APR note, ranges, snowball ranking, second mortgage kept out of the debt plan
  const rf = await p.evaluate(() => { const r = (id, v) => C(id).run(v), a0 = r('loanafford', { inc: 3000, ess: 1800, debt: 200, apr: 9, y: 5, share: 70 }), a1 = r('loanafford', { inc: 3000, ess: 1800, debt: 200, sav: 300, apr: 9, y: 5, share: 70 }), hi = r('loan', { a: 5000, apr: 33, y: 3 }), lo = r('loan', { a: 5000, apr: 9, y: 3 });
    const mx = id => C(id).inputs.map(i => i.k + ':' + i.max).join(','); loadSample(); S.lists = S.lists || {}; const before = finNums(), card = before.cardBal; { const it = newItem('mort2'); it.f = { owed: 150000, rate: 4, pay: 900, years: 20 }; it.src = { owed: 'typed', rate: 'typed', pay: 'typed', years: 'typed' }; S.lists.mort2 = [it]; } const after = finNums();
    return { s0: a0.num.Spare_Money, s1: a1.num.Spare_Money, l0: a0.num.Loan_Amount, l1: a1.num.Loan_Amount, hi: /unusual/.test(hi.line), lo: /unusual/.test(lo.line), loanMax: mx('loan'), cmpMax: mx('loancompare'), affMax: mx('loanafford'), planMax: mx('debtplan'), balO: before.loanBalO, balO2: after.loanBalO, bal2: after.loanBal, hasM2: after.hasM2, payO: before.loanPayMO, payO2: after.loanPayMO }; });
  chk(rf.s0 === 1000 && rf.s1 === 700 && rf.l1 < rf.l0, 'affordability subtracts the saving from the spare money');
  chk(rf.hi && !rf.lo, 'an APR above about 30% gets a check-it note, 9% does not');
  chk(/apr:35/.test(rf.loanMax) && /y:15/.test(rf.loanMax) && /apr1:35,y1:15,apr2:35,y2:15/.test(rf.cmpMax) && /apr:35/.test(rf.affMax) && /y:15/.test(rf.affMax) && /b1:100000.*b2:100000/.test(rf.planMax), 'ranges widened: terms to 15 years, loan APR to 35%, debt balances to 100,000');
  chk(rf.hasM2 && rf.balO2 === rf.balO && rf.bal2 > rf.balO2 && rf.payO2 === rf.payO, 'a second mortgage stays out of the debt plan "Loan"');
  const sn = await p.evaluate(() => { const ds = [{ n: 'a', b: 1000, apr: 5, i: iEq(5), min: 10 }, { n: 'b', b: 1050, apr: 20, i: iEq(20), min: 100 }]; return debtPlan(ds, 50, 'snowball'); });
  chk(sn && sn.m > 0 && sn.m < 1200, 'snowball ranks by the balance before the month\'s payments (runs to a finish)');
  // every Calculators group is fully listed on its Focus page
  const cov = await p.evaluate(() => { loadSample(); return TOPICS.map(t => { const h = V.XTOPIC(t[1]), html = typeof h === 'string' ? h : h.html, nShown = (html.match(/data-a="calc"/g) || []).length, nGroup = CALCS.filter(x => x.cat === t[4]).length; return [t[1], nShown, nGroup]; }); });
  cov.forEach(([t, a, g]) => { n++; if (a < g) { fails++; console.log('FAIL focus page missing calculators', t, a, 'of', g); } });
  console.log('FAILS ' + fails + ' of ' + n + ' ERRORS ' + errs.length, errs.length ? errs : ''); await b.close();
})();
