const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log((await p.evaluate(() => { S = fresh(); return Object.keys(EXAMPLES).map(k => { const x = EXAMPLES[k]; return '- ' + FF[k].l + ': ' + (x.o ? '[' + x.o.map(([o, m]) => o + (m ? ': ' + m : '')).join('; ') + '] ' : '') + x.t() + ' 📍 ' + x.w; }); })).join('\n')); await b.close(); })();
