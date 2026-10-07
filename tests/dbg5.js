const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { const j = JUMPS.flatMap(g => g[1]).find(x => x[0] === 'P2'); j[2](); S.fin = {}; S.src = {}; S.about.partner = true; prefillAbout(); return FSEC.map(s => s.id + ':' + secStatus(s) + ' req ' + s.f.filter(fieldVisible).filter(k => !FF[k].opt).map(k => k + '=' + S.src[k]).join(',')).join(' | '); }));
  await b.close(); })();
