const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  for (const u of ['file://' + __dirname + '/pre-v2.html', 'file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html']) { await p.goto(u); await p.waitForTimeout(300);
  await p.evaluate(() => { const j = JUMPS.flatMap(g => g[1]).find(x => x[0] === 'F2'); j[2](); lastId = null; render(); window.__l = []; const tr = document.getElementById('tl'); tr.addEventListener('pointermove', e => window.__l.push([e.clientX, Math.round(tr.getBoundingClientRect().width), S.about.age]), true); });
  const chip = p.locator('.tl-chip:not(.ret)').first(); const bb = await chip.boundingBox();
  await p.mouse.move(bb.x + bb.width/2, bb.y + bb.height/2); await p.mouse.down(); for (let k=1;k<=3;k++){ await p.mouse.move(bb.x + bb.width/2 + k*9, bb.y + bb.height/2); } await p.mouse.up();
  console.log(u.slice(-20), await chip.getAttribute('aria-valuenow'), JSON.stringify(await p.evaluate(() => window.__l)), await p.evaluate(() => innerWidth + ' ' + document.getElementById('wrap').style.transform)); }
  await b.close(); })();
