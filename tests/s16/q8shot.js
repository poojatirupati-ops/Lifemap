const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  await p.evaluate(() => { S = fresh(); S.scr = 'D5'; S.di = 3; lastId = null; render(); }); await p.screenshot({ path: __dirname + '/q8.png' });
  await p.evaluate(() => { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'F1'; lastId = null; render(); }); await p.screenshot({ path: __dirname + '/f1.png' }); await b.close(); })();
