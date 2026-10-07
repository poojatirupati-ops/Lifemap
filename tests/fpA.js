const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:1300}})).newPage(); await p.addInitScript(() => addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = '.tabs,.askfab,#toast{display:none!important}'; document.head.appendChild(st); }));
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => {
    S = fresh(); Object.assign(S.ans, {'2':0,'4':1,'7':1,'8':2,'9':2,'12':1,'6':1}); S.about = {age:30, partner:false, deps:0}; S.retireAge = 66; S.acct = Object.assign(S.acct, {name:'Pooja', ev:true, sv:true});
    const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('name', 'Pooja'); put('age', 30); put('retireAge', 66); put('work', 'Employed'); put('income', 55000); put('costsM', 2400); put('cash', 6000); put('pension', 12000); put('pensionM', 300);
    [['safety',2],['home',18],['business',26,'Nice to have'],['wealth',27,'Nice to have']].forEach(([k, y, pr]) => { const g = mkGoal(k); g.age = 30 + y; if (pr) g.prio = pr; S.goals.push(g); }); S.goals[0].amount = 10000;
    S.app = true; S.shell = true; S.tab = 'plan'; S.checked = true; lastId = null; render();
    const pc = wi => { const x = project(wi); return S.goals.map(g => x.pct[g.id]).join('/'); };
    return JSON.stringify({std:pc(), minus100:pc({g:S.goals[1].id, m:-100, l:0}), lump10k:pc({g:S.goals[3].id, m:0, l:10000}), save:project().save, purple:(project().rows.find(isShort) || {}).a, cautious:(S.assume = 'cautious', pc()), _:(S.assume = 'standard', render(), 1)}); }));
  await p.locator('#r-goals').scrollIntoViewIfNeeded(); await p.locator('#r-goals').evaluate(e => e.closest('.card').scrollIntoView());
  await p.locator('#r-goals').evaluate(e => e.closest('.card')).then(() => {}); const card = p.locator('.card:has(#r-goals)'); await card.screenshot({path: __dirname + '/build/v4-honest.png'});
  console.log((await p.locator('#r-goals').innerText()).replace(/\n/g, ' | '));
  // saving control
  await p.locator('#r-save').scrollIntoViewIfNeeded(); await p.locator('[data-a="savem"][data-p="25"]').click(); console.log('save +25 ->', await p.evaluate(() => [S.saveM, project().save.saveM].join('/')), (await p.locator('#r-goals').innerText()).replace(/\n/g, ' | ').slice(0, 200));
  await p.evaluate(() => { S.saveM = 1025; render(); }); await p.locator('[data-a="savem"][data-p="25"]').click(); console.log('cap note:', await p.locator('#r-save .small').innerText());
  await p.locator('[data-a="savereset"]').click(); console.log('reset ->', await p.evaluate(() => [S.saveM, project().save.saveM].join('/')));
  await p.evaluate(() => { S.sheet = 'assume'; render(); }); console.log('assume:', (await p.locator('.sheet').innerText()).replace(/\n/g, ' | ').slice(0, 700));
  await p.evaluate(() => { S.sheet = 'explain|gap'; render(); }); console.log('explain gap:', (await p.locator('.sheet').innerText()).replace(/\n/g, ' | '));
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
