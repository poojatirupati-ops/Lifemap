const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'B4')[2](); lastId = null; render(); });
  console.log('header:', await p.locator('header .sub').innerText()); await p.setViewportSize({width:390, height:1400}); await p.addStyleTag({content:'.foot,.tabs,.askfab,#toast{display:none!important}'});
  for (const k of ['d6','u9','u10','u12','u14','u4','u11']) { const card = p.locator('.card:has([data-a="umpick"][data-p^="' + k + '|"])'); await card.scrollIntoViewIfNeeded(); await card.screenshot({path: __dirname + '/build/v3-q-' + k.replace('d', 'q') + '.png'}); console.log(k, (await card.locator('.small').first().innerText()), '| tags', await card.locator('.otag').count()); }
  await p.locator('[data-a="umpick"][data-p="u9|3"]').click(); console.log('after 1:', await p.locator('header .sub').innerText());
  // scoring checks (FP round 2)
  console.log(JSON.stringify(await p.evaluate(() => { const t = (a, chips) => { S = fresh(); Object.assign(S.ans, {'2':0,'4':1,'6':3,'7':0,'8':3,'9':3,'12':2}); Object.assign(S.um.a, Object.assign({u9:3,u10:3,u11:2,u12:3,u4:0,u14:3}, a)); S.um.chips = chips || []; const r = riskRead(true); return [r.label, r.limit, r.misKey, r.can]; };
    return {base:t({}), u10_2:t({u10:2}), u14_0:t({u14:0}), u14_1:t({u14:1}), u11_3:t({u11:3}), u11_3_shares:t({u11:3}, ['Shares or funds']), traits:(S.um.a.u4 = 3, S.um.a.u11 = 3, myTerms().flatMap(x => x.tags).filter(x => /Procrast|Overconf/.test(x)))}; })));
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
