const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  for (const u of ['file://' + __dirname + '/pre-v2.html', 'file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html']) { await p.goto(u); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { const j = JUMPS.flatMap(g => g[1]).find(x => x[0] === 'F2'); j[2](); lastId = null; render(); const c = document.querySelector('#tl .tl-chip'); const cs = getComputedStyle(c); return [c.offsetWidth, cs.display, cs.padding, cs.fontSize, [...c.children].map(x => x.className + ':' + x.offsetWidth + ':' + getComputedStyle(x).display).join(' ')]; })); }
  await b.close(); })();
