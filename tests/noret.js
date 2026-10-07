const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  for (const vp of [{width:390,height:844}, {width:1280,height:900}, {width:844,height:390}]) {
    const p = await (await b.newContext({viewport:vp, hasTouch:vp.width < 1000})).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
    await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
    // picker: retirement is a normal tile
    const pick = await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'F1')[2](); S.goals = S.goals.filter(g => g.kind !== 'retire'); S.about.age = 50; lastId = null; render();
      const t = () => document.querySelector('.gtile[data-p="retire"]'); const r = {lock:t().textContent.includes('🔒'), disabled:t().getAttribute('aria-disabled'), firstSuggested:document.querySelector('.gtiles .gtile').dataset.p, pre:t().classList.contains('sel'), always:/always on your timeline/i.test(document.body.innerText)};
      t().click(); r.on = !!retireGoal() && t().classList.contains('sel'); document.querySelector('.gtile[data-p="retire"]').click(); r.off = !retireGoal(); return r; });
    // plan without a retirement goal
    await p.evaluate(() => { loadSample(); S.goals = S.goals.filter(g => g.kind !== 'retire'); lastId = null; render(); });
    const out = {pick};
    for (const v of ['journey','chapters','detail']) { await p.evaluate(v => { S.view = v; S.chapOpen = 0; lastId = null; render(); }, v); out[v] = await p.evaluate(() => { const g = document.getElementById('r-glance'); return {retireText:/Retire \d|You retire|retire<|Retirement begins/.test(g.innerHTML), flag:!!g.querySelector('path[fill="#E4518A"]')}; }); }
    out.timelineRetChip = await p.locator('.tl-chip.ret').count();
    out.goals = (await p.locator('#r-goals').innerText()).replace(/\s+/g, ' ').slice(0, 120);
    await p.evaluate(() => { S.tab = 'home'; lastId = null; render(); }); out.home = await p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]);
    await p.evaluate(() => { S.sheet = 'ask'; render(); }); out.askPret = await p.evaluate(() => /What happens when I retire/.test(document.body.innerText)); await p.evaluate(() => { S.sheet = 'assume'; render(); }); out.assume = await p.evaluate(() => /Work income stops at/.test(document.querySelector('.sheet').innerText)); await p.evaluate(() => { S.sheet = null; render(); openReport(); });
    out.report = await p.evaluate(() => { const r = document.getElementById('report'); return {on:r.classList.contains('on'), retireText:/Retire \d|You retire/.test(r.innerHTML), stops:/Work income stops at/.test(r.innerText)}; });
    console.log(vp.width, JSON.stringify(out)); }
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
