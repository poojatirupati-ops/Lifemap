const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  await p.evaluate(() => { JUMPS[2][1][2][2](); lastId = null; render(); });
  console.log(await p.evaluate(() => { const t = document.getElementById('tl'); return [t.getBoundingClientRect().width, t.clientWidth, [...t.querySelectorAll('.tl-chip')].map(c => c.dataset.g + ':' + c.getAttribute('aria-valuenow') + '@' + Math.round(c.getBoundingClientRect().x)).join(' ')]; }));
  const chip = p.locator('.tl-chip:not(.ret)').first(); const bb = await chip.boundingBox(); console.log(bb);
  await p.mouse.move(bb.x + bb.width/2, bb.y + bb.height/2); await p.mouse.down(); for (let k=1;k<=10;k++){ await p.mouse.move(bb.x + bb.width/2 + k*9, bb.y + bb.height/2); console.log(await chip.getAttribute('aria-valuenow')); } await p.mouse.up();
  await b.close(); })();
