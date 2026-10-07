const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(JSON.stringify(await p.evaluate(() => { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'B1'; lastId = null; render(); const o = {noPartner:document.querySelectorAll('[data-a="married"]').length};
    S.about.partner = true; render(); o.withPartner = document.querySelectorAll('[data-a="married"]').length; o.preselected = document.querySelectorAll('[data-a="married"].on').length; document.querySelector('[data-a="married"][data-p="Yes"]').click(); o.after = S.about.married;
    S.fin.home = 'Rent'; S.scr = 'F1'; render(); const t = document.querySelector('.gtile[data-p="mfree"]'); o.mfreeDisabled = t.getAttribute('aria-disabled'); o.hint = t.querySelector('.ghint').textContent; t.click(); o.mfreeAdded = S.goals.some(g => g.k === 'mfree'); return o; })));
  await p.evaluate(() => { S.scr = 'B1'; render(); }); await p.screenshot({path: __dirname + '/build/v7-b1-married.png'});
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
