// FP round 7: the Irish rules audit §4 take-home table (and the §4 combination checks) must match to the euro.
// Run: NODE_PATH=/opt/node22/lib/node_modules node rules.js   → "FAILS n of m" and "ERRORS n".
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const out = await p.evaluate(() => { S = fresh(); applyAssume();
    const blend = prsiRate(2026), r435 = 0.0435, res = [];
    const single = (g, rate) => g - hhTax(P0_({emp:g, age:40}), null, {rate}).total;
    const married1 = (g, rate) => g - hhTax(P0_({emp:g, age:40}), P0_({emp:0, age:40}), {married:true, rate}).total;
    // audit §4: [gross, status, income tax, USC, PRSI 4.35%, PRSI 2026 actual, take-home 2026 actual, take-home at 4.35%]
    const T = [[25000, 'S', 1000.00, 319.82, 1087.50, 1059.38, 22620.81, 22592.68], [25000, 'M', 0.00, 319.82, 1087.50, 1059.38, 23620.81, 23592.68],
      [45000, 'S', 5200.00, 882.82, 1957.50, 1906.88, 37010.31, 36959.68], [45000, 'M', 3000.00, 882.82, 1957.50, 1906.88, 39210.31, 39159.68],
      [80000, 'S', 19200.00, 2430.62, 3480.00, 3390.00, 54979.38, 54889.38], [80000, 'M', 15400.00, 2430.62, 3480.00, 3390.00, 58779.38, 58689.38],
      [150000, 'S', 47200.00, 8030.62, 6525.00, 6356.25, 88413.13, 88244.38], [150000, 'M', 43400.00, 8030.62, 6525.00, 6356.25, 92213.13, 92044.38]];
    const chk = (name, got, exp) => res.push([Math.abs(got - exp) < 1 ? 'PASS' : 'FAIL', name, Math.round(got * 100) / 100, exp]);
    chk('2026 PRSI blend (9 months 4.2% + 3 months 4.35%)', blend * 1e6, 0.042375 * 1e6);
    T.forEach(([g, st, it, us, pr435, pr26, th26, th435]) => { const f = st === 'S' ? single : married1, h = st === 'S' ? hhTax(P0_({emp:g, age:40}), null, {rate:blend}) : hhTax(P0_({emp:g, age:40}), P0_({emp:0, age:40}), {married:true, rate:blend});
      const L = '€' + g.toLocaleString() + ' ' + (st === 'S' ? 'single' : 'married, one earner');
      chk(L + ': income tax', h.it, it); chk(L + ': USC', h.usc, us); chk(L + ': PRSI 2026 actual', h.prsi, pr26);
      chk(L + ': PRSI at 4.35%', hhTax(P0_({emp:g, age:40}), st === 'S' ? null : P0_({emp:0, age:40}), {married:st === 'M', rate:r435}).prsi, pr435);
      chk(L + ': take-home 2026 actual', f(g, blend), th26); chk(L + ': take-home at 4.35%', f(g, r435), th435); });
    // married two earners, income tax only
    [[60000, 30000, 11400], [80000, 50000, 26400], [45000, 45000, 10400]].forEach(([a, b2, e]) => chk('Married two earners €' + a / 1000 + 'k + €' + b2 / 1000 + 'k: income tax', hhTax(P0_({emp:a}), P0_({emp:b2}), {married:true, rate:r435}).it, e));
    // §4 combination checks: the "Correct" column (at 4.35%)
    chk('Married one earner €50k, own pension €5,000, age 45: take-home', (() => { const g = 50000, E = 5000, rel = reliefOn(g, E, 45); return g - E - hhTax(P0_({emp:g, age:45, relief:rel}), P0_({emp:0, age:45}), {married:true, rate:r435}).total; })(), 38792.18);
    chk('Age 67, still working, €60k + full State Pension', 60000 + 15564 - hhTax(P0_({emp:60000, sp:15564, age:67}), null, {rate:r435}).total, 57050.58);
    chk('ARF draw €30k at 62', netRet(30000, 0, 62, r435), 26262.18);
    chk('Retirement lump sum, €1m pot: net', lumpSum(1e6, 0.25).net, 240000);
    chk('Self-employed €20k: PRSI', hhTax(P0_({emp:20000, se:true, age:40}), null, {rate:r435}).prsi, 870);
    chk('Retiree, draw €20k + SP €15,564, age 67', netRet(20000, 15564, 67, r435), 32476.38);
    chk('Pension relief, single, €46k, €5,000, age 45: cost', 5000 - (hhTax(P0_({emp:46000, age:45}), null, {rate:0}).it - hhTax(P0_({emp:46000, age:45, relief:reliefOn(46000, 5000, 45)}), null, {rate:0}).it), 3600);
    chk('Pension relief, €200k earner, €40,000, age 50: cost', 40000 - (hhTax(P0_({emp:200000, age:50}), null, {rate:0}).it - hhTax(P0_({emp:200000, age:50, relief:reliefOn(200000, 40000, 50)}), null, {rate:0}).it), 26200);
    // retired couple: joint assessment applies (married two pensioners vs two single)
    const rc = hhTax(P0_({draw:30000, sp:15564, age:68}), P0_({sp:15564, age:67}), {married:true, rate:r435}).it, rs = hhTax(P0_({draw:30000, sp:15564, age:68}), P0_({sp:15564, age:67}), {married:false, rate:r435}).it;
    res.push([rc < rs ? 'PASS' : 'FAIL', 'Retired couple: joint assessment lowers tax (€' + Math.round(rs) + ' → €' + Math.round(rc) + ')', Math.round(rc), '< ' + Math.round(rs)]);
    // credits
    chk('Lone parent €50k: SPCCC + €48k band adds €2,700', hhTax(P0_({emp:50000}), null, {rate:0}).it - hhTax(P0_({emp:50000}), null, {rate:0, spccc:true}).it, 2700);
    chk('Renter single: Rent Tax Credit €1,000', hhTax(P0_({emp:50000}), null, {rate:0}).it - hhTax(P0_({emp:50000}), null, {rate:0, rent:true}).it, 1000);
    chk('Renter married: Rent Tax Credit €2,000', hhTax(P0_({emp:70000}), P0_({emp:0}), {married:true, rate:0}).it - hhTax(P0_({emp:70000}), P0_({emp:0}), {married:true, rate:0, rent:true}).it, 2000);
    chk('Home Carer, married one earner €70k: €1,950', hhTax(P0_({emp:70000}), P0_({emp:0}), {married:true, rate:0}).it - hhTax(P0_({emp:70000}), P0_({emp:0}), {married:true, rate:0, carer:true}).it, 1950);
    chk('No PRSI at 66+ on pay', hhTax(P0_({emp:60000, age:66}), null, {rate:r435}).prsi, 0);
    chk('USC on State Pension: none', hhTax(P0_({sp:15564, age:67}), null, {rate:r435}).usc, 0);
    return res; });
  out.forEach(r => console.log(r.join(' | ')));
  console.log('FAILS', out.filter(r => r[0] === 'FAIL').length, 'of', out.length); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
