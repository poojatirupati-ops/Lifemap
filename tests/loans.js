// Loans group: loan comparison, loan affordability, credit card repayment, debt repayment, debt payoff plan.
// Each result is compared with an independent calculation written here (month-by-month loops and closed forms), over seeded random inputs.
// Usage: NODE_PATH=/opt/node22/lib/node_modules node tests/loans.js     Last line: FAILS n of m
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.resolve(__dirname, '../LifeGoals-Customer-Journey-Prototype.html')); await p.waitForTimeout(400);
  const cases = await p.evaluate(() => { let seed = 20261023; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648, R = (a, c, st) => Math.round((a + rnd() * (c - a)) / st) * st, out = [];
    const run = (id, v) => ({ id, v, num: C(id).run(v).num });
    for (let k = 0; k < 60; k++) out.push(run('loancompare', { a: R(500, 100000, 500), apr1: R(0, 25, 0.25), y1: R(1, 10, 1), apr2: R(0, 25, 0.25), y2: R(1, 10, 1) }));
    for (let k = 0; k < 60; k++) out.push(run('loanafford', { inc: R(500, 15000, 50), ess: R(0, 10000, 50), debt: R(0, 5000, 10), apr: R(0, 25, 0.25), y: R(1, 10, 1), share: R(10, 100, 5) }));
    for (let k = 0; k < 80; k++) out.push(run('creditcard', { b: R(100, 30000, 100), apr: R(0, 35, 0.5), p: R(10, 3000, 10), mp: k % 4 === 0 ? 0 : R(1, 10, 0.5), mf: R(0, 100, 0.5), t: R(6, 120, 1) }));
    for (let k = 0; k < 60; k++) out.push(run('debtpay', { b: R(100, 100000, 100), apr: R(0, 35, 0.5), p: R(10, 5000, 10), x: R(0, 1000, 10) }));
    for (let k = 0; k < 80; k++) out.push(run('debtplan', { b1: R(0, 50000, 100), apr1: R(0, 35, 0.5), m1: R(0, 3000, 5), b2: R(0, 50000, 100), apr2: R(0, 35, 0.5), m2: R(0, 3000, 5), b3: R(0, 100000, 100), apr3: R(0, 35, 0.5), m3: R(0, 3000, 5), x: R(0, 2000, 10) }));
    return out; });
  const iEq = r => Math.pow(1 + r / 100, 1 / 12) - 1, pmt = (P, i, n) => i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n, near = (a, c, e) => Math.abs(a - c) <= (e || 0.01);
  const fixed = (P, i, pay) => { if (pay <= P * i + 1e-12) return null; let bal = P, m = 0, ti = 0; while (bal > 0.005 && m < 5000){ const it = bal * i, q = Math.min(bal + it, pay); ti += it; bal = bal + it - q; m++; } return { m, ti }; };
  const minOnly = (P, i, pct, floor) => { let bal = P, m = 0, ti = 0; while (bal > 0.005 && m < 1200){ const it = bal * i, q = Math.min(bal + it, Math.max(floor, pct * bal)); ti += it; bal = bal + it - q; m++; } return bal > 0.005 ? null : { m, ti }; };
  const plan = (debts, extra, how) => { const ds = debts.filter(d => d.b > 0.005).map(d => ({ ...d })), pool = ds.reduce((z, d) => z + d.min, 0) + (how === 'none' ? 0 : extra); let m = 0, ti = 0, paid = 0;
    while (ds.some(d => d.b > 0.005) && m < 1200){ m++; ds.forEach(d => { if (d.b > 0.005){ const it = d.b * d.i; d.b += it; ti += it; } });
      let bud = how === 'none' ? ds.reduce((z, d) => z + (d.b > 0.005 ? d.min : 0), 0) : pool; const rem = ds.filter(d => d.b > 0.005);
      rem.forEach(d => { const q = Math.min(d.b, d.min, bud); d.b -= q; bud -= q; paid += q; });
      if (how !== 'none') ds.filter(d => d.b > 0.005).sort(how === 'avalanche' ? (a, c) => c.apr - a.apr : (a, c) => a.b - c.b).forEach(d => { const q = Math.min(d.b, bud); d.b -= q; bud -= q; paid += q; }); }
    return ds.some(d => d.b > 0.005) ? null : { m, ti, paid }; };
  let fails = 0, n = 0; const bad = (what, c) => { fails++; console.log('FAIL', what, JSON.stringify(c.v)); };
  for (const c of cases){ const v = c.v, num = c.num; n++;
    if (c.id === 'loancompare'){ for (const [t, a, y] of [['A', v.apr1, v.y1], ['B', v.apr2, v.y2]]){ const i = iEq(a), m = pmt(v.a, i, y * 12); if (!near(num['Repayment_' + t], m, 1e-6) || !near(num['Total_' + t], m * y * 12, 1e-6) || !near(num['Interest_' + t], m * y * 12 - v.a, 1e-6)) bad('compare ' + t, c); } if (!near(num.Interest_Difference, num.Interest_A - num.Interest_B, 1e-6)) bad('compare diff', c); }
    else if (c.id === 'loanafford'){ const i = iEq(v.apr), nn = v.y * 12, spare = v.inc - v.ess - v.debt, use = Math.max(0, spare) * v.share / 100, L = num.Loan_Amount;
      if (!near(pmt(L, i, nn), use, 1e-6) || !near(num.Repayment_Used, use, 1e-9) || !near(num.Repayment_If_Rate_Up, pmt(L, iEq(v.apr + 3), nn), 1e-6) || !near(num.Total_Interest, use * nn - L, 1e-6)) bad('afford', c); }
    else if (c.id === 'creditcard'){ const i = iEq(v.apr), yp = fixed(v.b, i, v.p), okY = yp ? num.Months_Your_Payment === yp.m && near(num.Interest_Your_Payment, yp.ti) : num.Months_Your_Payment === 'Never';
      const mo = v.mp > 0 ? minOnly(v.b, i, v.mp / 100, v.mf) : undefined, okM = v.mp > 0 ? (mo ? num.Months_Minimum === mo.m && near(num.Interest_Minimum, mo.ti) : num.Months_Minimum === 'Never') : num.Months_Minimum === '—';
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
  // every Calculators group is fully listed on its Focus page
  const cov = await p.evaluate(() => { loadSample(); return TOPICS.map(t => { const h = V.XTOPIC(t[1]), html = typeof h === 'string' ? h : h.html, nShown = (html.match(/data-a="calc"/g) || []).length, nGroup = CALCS.filter(x => x.cat === t[4]).length; return [t[1], nShown, nGroup]; }); });
  cov.forEach(([t, a, g]) => { n++; if (a < g) { fails++; console.log('FAIL focus page missing calculators', t, a, 'of', g); } });
  console.log('FAILS ' + fails + ' of ' + n + ' ERRORS ' + errs.length, errs.length ? errs : ''); await b.close();
})();
