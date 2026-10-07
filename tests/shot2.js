const { chromium } = require('playwright');
const OUT = __dirname + '/ux/';
(async () => {
  const b = await chromium.launch();
  for (const vw of [{n:'d',w:1200,h:900},{n:'m',w:390,h:844}]) {
  const p = await b.newPage({ viewport: { width: vw.w, height: vw.h }, hasTouch: vw.n==='m' });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/reference/LifeGoals-2.0-Plan-Prototype-decoded.html');
  await p.waitForTimeout(500);
  await p.evaluate(() => { ['baby','house','education','second','retire'].forEach(t=>state.selectedGoals.add(t)); renderGoals(); buildTimeline(); go(3); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + `p2-${vw.n}-timeline.png` });
  // drag first chip
  const chip = await p.$('.tl-chip'); const bb = await chip.boundingBox(); const t0 = await chip.textContent();
  await p.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await p.mouse.down(); await p.mouse.move(bb.x+bb.width/2+100, bb.y+bb.height/2, {steps:6}); await p.mouse.up();
  await p.waitForTimeout(200);
  console.log(vw.n, 'drag', t0, '=>', JSON.stringify(await p.$$eval('.tl-chip', cs=>cs.map(c=>c.textContent+'@'+c.style.left+'/'+c.style.bottom))));
  await p.evaluate(() => { go(4); choosePath('idp'); showFinForm(true); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + `p2-${vw.n}-finances.png`, fullPage:false });
  await p.evaluate(() => { runPlan(); window.scrollTo(0,0); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + `p2-${vw.n}-results-full.png`, fullPage:true });
  for (const v of ['journey','chapters','detail']) { await p.evaluate(v => setFutureView(v), v); await p.waitForTimeout(150); const el = await p.$('#futureView'); await (await el.evaluateHandle(e=>e.closest('.card'))).asElement().screenshot({ path: OUT + `p2-${vw.n}-${v}.png` }); }
  await p.evaluate(() => { document.getElementById('wiExtra').value=500; wiLabels(); applyWhatIf(); });
  await p.waitForTimeout(150);
  const wi = await p.$('#wiBanner'); await (await wi.evaluateHandle(e=>e.closest('.card'))).asElement().screenshot({ path: OUT + `p2-${vw.n}-whatif.png` });
  await p.evaluate(() => openBooking()); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + `p2-${vw.n}-booking.png` });
  console.log(vw.n, 'ERRORS', JSON.stringify(errs));
  }
  await b.close();
})();
