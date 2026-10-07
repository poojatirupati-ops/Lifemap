const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const click = async s => { await p.locator(s).first().click(); await p.waitForTimeout(120); }, cur = () => p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]);
  await click('text=Start · about 1 min'); console.log('D1 chips', await p.locator('[data-a="why"]').count(), await p.locator('h2').first().innerText());
  for (const k of ['change','safety','other']) await click('[data-a="why"][data-p="' + k + '"]'); await p.fill('#why-note', 'Moving abroad'); await p.screenshot({path: __dirname + '/build/v5-d1.png'});
  console.log('F1 order', await p.evaluate(() => { S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'F1'; lastId = null; render(); return [...document.querySelectorAll('.gtile')].slice(0, 6).map(t => t.dataset.p).join(','); }));
  // topic -> Experts with the right specialist (before a plan)
  await p.evaluate(() => { const why = S.why; JUMPS.flatMap(g => g[1]).find(x => x[0] === 'XPL-01')[2](); S.why = why; lastId = null; render(); });
  const want = {Mortgages:'Mortgage expert', Pensions:'Pension & retirement expert', Protection:'Protection expert', Investing:'Investment expert', Savings:'Financial planner', 'Everyday money':'Financial planner'};
  for (const [t, ex] of Object.entries(want)) { await click('[data-a="tab"][data-p="explore"]'); await click('[data-a="topic"][data-p="' + t + '"]'); const inline = await p.locator('#main .adv, #main [data-a="book"]').count(); const link = await p.locator('[data-a="expertfor"]').last().innerText();
    if (t === 'Mortgages') await p.screenshot({path: __dirname + '/build/v5-topic-mortgages.png'});
    await p.locator('[data-a="expertfor"]').last().click(); await p.waitForTimeout(120);
    const sel = await p.locator('[data-a="spec"].sel').innerText(); console.log(t, '| link:', link, '| inline contact:', inline, '| at', await cur(), '| selected:', sel, sel === ex ? 'OK' : 'WRONG', '| card:', (await p.locator('.adv .small').first().innerText())); }
  await p.screenshot({path: __dirname + '/build/v5-experts-before-plan.png'}); await p.evaluate(() => document.getElementById('main').scrollTo({top:9999, behavior:'instant'})); await p.waitForTimeout(100); await p.screenshot({path: __dirname + '/build/v5-experts-before-plan-more.png'});
  // booking before a plan
  await click('[data-a="book"]'); console.log('book ->', await cur()); if (await cur() === 'C0') await click('[data-a="exp"][data-p="c1"]'); console.log('match nudge', await p.locator('.nudge:has-text("Make your plan first")').count()); await click('.foot .btn');
  console.log('share items before plan:', (await p.locator('[data-share]').evaluateAll(es => es.map(e => e.dataset.share))).join(','), 'nudge', await p.locator('.nudge:has-text("Make your plan first")').count());
  await p.check('[data-share="um"]'); await p.check('[data-agree]'); await click('#sharego'); await click('.slot >> nth=1'); await click('text=Confirm booking'); console.log('booked ->', await cur(), await p.evaluate(() => S.book.done));
  // after a plan
  await p.evaluate(() => { loadSample(); S.tab = 'exp'; lastId = null; render(); document.getElementById('toast').innerHTML = ''; }); await p.screenshot({path: __dirname + '/build/v5-experts-with-plan.png'}); console.log('with plan, auto specialist:', await p.locator('[data-a="spec"].sel').innerText());
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
