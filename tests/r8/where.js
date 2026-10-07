const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { loadSample(); render(); const h = document.body.innerHTML; const i = h.indexOf('Choose your'); return h.slice(Math.max(0, i - 300), i + 100); })); await b.close(); })();
