const { chromium } = require('playwright');
const OUT = __dirname + '/ux/';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto('file:///home/user/lifegoals-prototype/Lifecast%20User%20Jouney%20Prototype.html');
  await p.waitForTimeout(800);
  // resolved vars before navy
  const vars = async () => p.evaluate(() => { const cs = getComputedStyle(document.documentElement); const ks=['ink','ink2','muted','line','mist','card','sun','sun-l','sea','sea-d','sea-l','sky','sky-l','storm','storm-l','coral','sand','r','plain1','plain2','mark1','mark2','mark3','q1','q2','q3','qsub','acc-d','wx-sun','wx-sun-l','c1','c2','c3','c4','c5','c6','c7','c8']; const o={}; ks.forEach(k=>o[k]=cs.getPropertyValue('--'+k).trim()); return o; });
  console.log('DEFAULT', JSON.stringify(await vars()));
  await p.evaluate(() => applyTheme('navy'));
  console.log('NAVY', JSON.stringify(await vars()));
  const ids = ['ONB-01','DSC-C1','DSC-Q01','DSC-Q11','DSC-R','RC-01','ACC-01','PLN-01','PLN-02','PLN-02T2','PLN-03','HOME-01','PLAN-MAP','PLAN-CHAP','PLAN-MONEY','ME-01','ME-Q','EXPT-03','SHT-EDIT','SHT-LEVER'];
  for (const id of ids) {
    await p.click(`.side button[data-id="${id}"]`); await p.waitForTimeout(250);
    await p.screenshot({ path: OUT + 'lc-' + id + '.png', clip: { x: 300, y: 0, width: 980, height: 900 } });
  }
  // DSC-Q08 ride & Q09 scenario
  for (const i of [7,8]) { await p.evaluate(i => { loadNew(); S.onb='discover'; S.d.i=i; S.d.intro=false; render(true); }, i); await p.waitForTimeout(200); await p.screenshot({ path: OUT + 'lc-DSC-Q0'+(i+1)+'.png', clip:{x:300,y:0,width:980,height:900} }); }
  // drag test on LifeMap
  await p.click(`.side button[data-id="PLN-01"]`); await p.waitForTimeout(300);
  const chip = await p.$('.gchip'); const bb = await chip.boundingBox();
  const before = await chip.textContent();
  await p.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await p.mouse.down(); await p.mouse.move(bb.x+bb.width/2+120, bb.y+bb.height/2, {steps:8}); await p.mouse.up(); await p.waitForTimeout(300);
  const after = await (await p.$('.gchip')).textContent();
  console.log('LM drag', before, '=>', after);
  await p.screenshot({ path: OUT + 'lc-PLN-01-afterdrag.png', clip: { x: 300, y: 0, width: 980, height: 900 } });
  // mobile viewport
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch:true, isMobile:true });
  await m.goto('file:///home/user/lifegoals-prototype/Lifecast%20User%20Jouney%20Prototype.html'); await m.waitForTimeout(600);
  await m.evaluate(() => { applyTheme('navy'); JUMPS[1][1][1][2](); render(true); }); await m.waitForTimeout(300);
  await m.screenshot({ path: OUT + 'lc-mobile-PLN-01.png' });
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
