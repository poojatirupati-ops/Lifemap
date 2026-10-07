const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const ctx = await b.newContext({viewport:{width:390,height:1500}, hasTouch:true}); const p = await ctx.newPage(); await p.addInitScript(() => addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.id = 'hide'; st.textContent = '.tabs,.askfab,#toast,header.sky{display:none!important}'; document.head.appendChild(st); }));
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const card = () => p.locator('#r-glancec'); const shot = n => card().screenshot({path: __dirname + '/build/v7-' + n + '.png'});
  await p.evaluate(() => { loadSample(); S.view = 'detail'; lastId = null; render(); }); await card().scrollIntoViewIfNeeded();
  const det = () => p.evaluate(() => { const P = project(S.wi), i = S.csel == null ? chartDefaultSel(P.rows) : S.csel, r = P.rows[i], t = document.getElementById('r-cdet').innerText; return {age:r.a, firstShort:(P.rows.find(chartShort) || {}).a, incomeOK:t.includes(eur(r.inflow)), leftOK:t.includes(eur(r.liquid)), head:t.split('\n')[0]}; });
  console.log('default', JSON.stringify(await det())); await shot('chart-default');
  await p.locator('.cchart [data-a="cyr"]').nth(25).click(); console.log('tapped', JSON.stringify(await det())); await shot('chart-selected');
  await p.locator('.cwrap').focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); console.log('keys', JSON.stringify(await det()), 'focus on chart', await p.evaluate(() => document.activeElement.classList.contains('cwrap')));
  await p.locator('[data-a="csave"]').click(); console.log('savings line', await p.locator('.cchart path[stroke="#6E8AA6"]').count()); await shot('chart-savings');
  // live updates: what-if, saving control, cautious
  const sumShort = () => p.evaluate(() => Math.round(project(S.wi).rows.reduce((t, r) => t + rowParts(r).short, 0)));
  const coral = () => p.locator('.cchart rect[fill="var(--alert)"]').count();
  const c0 = await coral(); await p.locator('#r-wi').scrollIntoViewIfNeeded(); await p.locator('[data-a="savem"][data-p="25"]').click(); for (let k = 0; k < 8; k++) await p.locator('[data-a="savem"][data-p="25"]').click();
  console.log('coral years', c0, '-> after +225/mo saving', await coral()); await p.evaluate(()=>{const d=document.querySelector('#r-wi details.wigrow');if(d)d.open=true;});await p.locator('#r-wi [data-a="assume"][data-p="cautious"]').click(); console.log('cautious coral', await coral()); await p.locator('#r-wi [data-a="assume"][data-p="standard"]').click();
  await p.evaluate(() => { const r = document.querySelector('[data-wi="l"]'); r.value = 20000; r.dispatchEvent(new Event('input', {bubbles:true})); }); console.log('lump 20k (live) coral', await coral(), 'summary:', (await p.locator('#r-glance .pnote').innerText()).slice(0, 220));
  // recoloured road + goals
  await p.evaluate(() => { loadSample(); S.view = 'journey'; lastId = null; render(); }); await card().scrollIntoViewIfNeeded(); await shot('road'); await p.locator('.card:has(#r-goals)').screenshot({path: __dirname + '/build/v7-goals.png'});
  await p.evaluate(() => { S.view = 'chapters'; lastId = null; render(); }); await shot('chapters');
  await p.setViewportSize({width:390, height:844}); await p.evaluate(() => { document.getElementById('hide').textContent = '#toast{display:none}'; S.tab = 'home'; lastId = null; render(); }); await p.screenshot({path: __dirname + '/build/v7-home.png'});
  // landscape chart
  await p.evaluate(() => document.getElementById('hide').remove()); await p.setViewportSize({width:844, height:390}); await p.evaluate(() => { S.tab = 'plan'; S.view = 'detail'; lastId = null; render(); }); await p.waitForTimeout(200); await p.locator('#r-glance svg.cchart').scrollIntoViewIfNeeded(); await p.screenshot({path: __dirname + '/build/v7-chart-landscape.png'}); console.log('landscape chart width', await p.evaluate(() => Math.round(document.querySelector('svg.cchart').getBoundingClientRect().width)));
  await p.evaluate(() => openReport()); console.log('report chart', await p.locator('#report svg.cchart').count());
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
