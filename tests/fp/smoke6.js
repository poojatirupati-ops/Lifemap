const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { loadSample(); const F = finNums(), P = project(); const end = P.rows.findIndex(r => r.fixed < F.debtPayM * 12 + 1 && r.t > 2);
    const rep = C('repayment').run(calcVals(C('repayment'))), ov = C('overpay').run(calcVals(C('overpay')));
    const ret = calcVals(C('retirement')), rr = C('retirement').run(ret), R = S.retireAge, a0 = S.about.age;
    const sur = C('surplus').run(calcVals(C('surplus')));
    return {mortPayM:F.mortPayM, mortRate:F.mortRate, low:F.mortPayLow, firstYearNoMortgageAge:a0 + end, rep:[rep.lbl, rep.val, rep.line, JSON.stringify(rep.rows)], ov:ov.rows, ret:[rr.val, Math.round(P.rows[R - a0 - 1].pen), JSON.stringify(ret)], sur:[sur.val, P.save.surplusM]}; });
  console.log(JSON.stringify(r, null, 1)); console.log('ERR', errs); await b.close(); })();
