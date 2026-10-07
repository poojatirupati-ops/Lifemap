const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { loadSample(); const out = [];
    for (const m of [null, 62, 100, 150, 200, 300, 500]){ S.saveM = m; const P = project(); out.push({m, save:P.save, pct:S.goals.map(g => g.k + ':' + P.pct[g.id]).join(' '), short:P.rows.filter(isShort).map(r => r.a).join(','),
      neg:P.rows.filter(r => r.saved + r.spent < 0 || r.used > 1).map(r => r.a + ':' + Math.round(r.used)).join(' ')}); }
    return out; });
  r.forEach(x => console.log(JSON.stringify(x))); console.log('ERR', errs); await b.close(); })();
