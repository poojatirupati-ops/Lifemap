const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { JUMPS[2][1][2][2](); lastId = null; render(); const t = document.getElementById('tl'); const c = t.querySelector('.tl-chip'); const r1 = c.style.left; try { layoutTL(); } catch (e) { return 'layout err ' + e.message; } return [r1, c.style.left, getComputedStyle(c).position, c.offsetWidth]; }));
  await b.close(); })();
