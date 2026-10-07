const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}, hasTouch:true});
  await p.route('**/fonts.g*/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/Lifecast%20User%20Jouney%20Prototype.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { applyTheme('navy'); const j = JUMPS.flatMap(g => g[1]).find(x => x[0] === 'PLAN-CHAP'); j[2](); render(true); }); await p.waitForTimeout(300);
  await p.screenshot({path: __dirname + '/ux/lc-m-chapters.png'}); await b.close(); })();
