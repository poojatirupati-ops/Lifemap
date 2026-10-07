const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const click = async s => { await p.locator(s).first().click(); await p.waitForTimeout(150); }, cur = () => p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]);
  // unverified customer who only saved an email, no plan yet
  await p.evaluate(() => { S = fresh(); Object.assign(S.ans, {'2':0,'4':1,'7':1,'8':2,'9':2,'12':1}); S.save = {email:'aoife@example.ie', done:true, asked:true, comms:false}; S.acct.email = 'aoife@example.ie'; S.shell = true; S.tab = 'explore'; lastId = null; render(); });
  await click('[data-a="cat"][data-p="retire"]'); console.log('at', await cur(), 'card', await p.locator('.card.pst').count(), 'tools', await p.locator('[data-a="calc"]').count()); await p.screenshot({path: __dirname + '/build/v8-card.png'});
  await click('[data-a="pstup"]'); console.log('gate ->', await cur(), 'email prefilled', await p.inputValue('#a-email'), 'builder bar shown', await p.locator('.pbbar').count());
  await p.fill('#a-name', 'Aoife'); await p.fill('#a-mob', '087 123 4567'); await p.check('[data-acct="c1"]'); await click('#acctgo');
  for (let k = 0; k < 2; k++){ await p.keyboard.type('123456'); await click('.foot .btn'); } console.log('->', await cur()); await click('text=Not now');
  console.log('after verify ->', await cur(), '(not the plan builder)'); await p.waitForTimeout(1600); console.log('->', await cur()); await p.screenshot({path: __dirname + '/build/v8-confirm.png'});
  console.log('confirm rows', await p.locator('[data-pv]').count(), 'old flag', await p.locator('text=Statement is over 12 months old').count(), 'low-confidence', await p.locator('.tag.look').count());
  await p.fill('[data-pv="youM"]', '300'); await click('[data-a="pstok"]');
  console.log('opened', await cur(), 'tags', await p.locator('.tag.doc:has-text("From your statement")').count(), 'pot', await p.inputValue('#c-pot'), 'm', await p.inputValue('#c-m'), 'ra', await p.inputValue('#c-ra')); await p.screenshot({path: __dirname + '/build/v8-tool-prefilled.png'});
  for (const t of ['contrib','avc','lastmoney','drawdown']) { const n = await p.evaluate(t => (S.calcSrc[t] || []).join(','), t); console.log(t, 'pre-filled:', n); }
  await click('[data-a="xback"]'); console.log('category uploaded row', (await p.locator('.card.pst .mini').innerText()).replace(/\n/g, ' '));
  console.log('finances', JSON.stringify(await p.evaluate(() => ({pension:[S.fin.pension, S.src.pension, S.conf.pension], pensionM:[S.fin.pensionM, S.src.pensionM], sp:[S.fin.sp, S.src.sp], look:S.look.pension}))));
  // plan builder: Pension shows as already filled
  await click('[data-a="tab"][data-p="plan"]'); await click('[data-a="makeplan"]'); console.log('builder at', await cur());
  console.log('pension section', await p.evaluate(() => secStatus(FSEC.find(s => s.id === 'pension'))), 'P2 jump:', await p.evaluate(() => { S.scr = 'P2'; render(); return document.querySelector('[data-a="fsec"][data-p="5"]').innerText.replace(/\n/g, ' '); }));
  // verified customer with a plan: straight to the reader, toast "Added to your plan too"
  await p.evaluate(() => { loadSample(); S.tab = 'explore'; S.xs = [{v:'XCAT', p:'retire'}]; lastId = null; render(); }); await click('[data-a="pstup"]'); console.log('verified ->', await cur()); await p.waitForTimeout(1600); await click('[data-a="pstok"]'); console.log('toast:', await p.locator('#toast').innerText());
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
