const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); for (const f of process.argv.slice(2)) { const p = await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + f); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { loadSample(); const P = project(); const std = SV('inv'), pcs = {}; S.goals.forEach(g => pcs[g.k] = P.pct[g.id]); return {inv:std, AS_inv:AS.inv, cautious:SET.inv.vc, by:SET.inv.by, pcs, short:P.rows.filter(isShort).length}; });
  console.log(f.split('/').pop(), JSON.stringify(r), errs); await p.close(); } await b.close(); })();
