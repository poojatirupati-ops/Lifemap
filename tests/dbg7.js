const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:844,height:390}, hasTouch:true})).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'F2')[2](); lastId = null; render(); const h1 = document.querySelector('.tl-board').offsetHeight; const ch1 = [...document.querySelectorAll('.tl-chip')].map(c => c.offsetWidth + 'x' + c.offsetHeight).join(' '); layoutTL(); const h2 = document.querySelector('.tl-board').offsetHeight; return [h1, h2, ch1, [...document.querySelectorAll('.tl-chip')].map(c => c.offsetWidth + 'x' + c.offsetHeight + '@' + c.style.top).join(' ')]; }));
  await b.close(); })();
