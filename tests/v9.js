const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const click = async s => { await p.locator(s).first().click(); await p.waitForTimeout(150); }, cur = () => p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]);
  const fresh0 = () => p.evaluate(() => { S = fresh(); Object.assign(S.ans, {'2':0,'4':1,'7':1,'8':2,'9':2,'12':1}); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); });
  const verify = async () => { await p.fill('#a-name', 'Aoife'); await p.fill('#a-email', 'aoife@example.ie'); await p.fill('#a-mob', '087 123 4567'); await p.check('[data-acct="c1"]'); await click('#acctgo'); for (let k = 0; k < 2; k++){ await p.keyboard.type('123456'); await click('.foot .btn'); } await click('text=Not now'); };
  const tagsOf = () => p.evaluate(() => { const t = S.xs[S.xs.length - 1]; return t.p + ' tags:' + (S.calcSrc[t.p] || []).join(',') + ' shown:' + document.querySelectorAll('.tag.doc').length; });
  const val = id => p.evaluate(id => { const v = S.calcV[id]; return JSON.stringify(v); }, id);
  for (const [cat, tools] of [['home', ['repayment','overpay','ratechange','term']], ['invest', ['regularinvest','lumpsum','fees','riskreturn','realreturn']]]) {
    await fresh0(); await click('[data-a="cat"][data-p="' + cat + '"]'); console.log(cat, 'card:', (await p.locator('.card.pst b').first().innerText()), '| reads:', (await p.locator('.card.pst .small').first().innerText()).slice(0, 90));
    if (cat === 'home') await p.screenshot({path: __dirname + '/build/v9-mortgage-card.png'});
    await click('[data-a="pstup"]'); console.log(' gate ->', await cur()); await verify(); await p.waitForTimeout(1600); console.log(' after verify ->', await cur());
    await p.screenshot({path: __dirname + '/build/v9-' + (cat === 'home' ? 'mortgage' : 'investment') + '-confirm.png'});
    await click('[data-a="pstok"]'); console.log(' opened', await cur(), '|', await tagsOf()); await p.screenshot({path: __dirname + '/build/v9-' + (cat === 'home' ? 'mortgage' : 'investment') + '-tool.png'});
    for (const t of tools) console.log('  ', t, 'tagged:', await p.evaluate(t => (S.calcSrc[t] || []).join(','), t), 'values:', await val(t));
    console.log(' finances', JSON.stringify(await p.evaluate(cat => cat === 'home' ? {home:S.fin.home, mortBal:[S.fin.mortBal, S.src.mortBal], mortPayM:[S.fin.mortPayM, S.src.mortPayM], mortYears:S.fin.mortYears, homeValue:[S.fin.homeValue, S.src.homeValue]} : {invest:[S.fin.invest, S.src.invest, S.conf.invest]}, cat)));
    await click('[data-a="xback"]'); console.log(' uploaded row:', (await p.locator('.card.pst .mini').innerText()).replace(/\n/g, ' '));
    console.log(' plan builder section:', await p.evaluate(cat => secStatus(FSEC.find(s => s.id === (cat === 'home' ? 'liab' : 'assets'))) + ' / ' + (cat === 'home' ? secSummary(FSEC.find(s => s.id === 'liab')) : secSummary(FSEC.find(s => s.id === 'assets'))), cat));
  }
  // no-charges cases: clear the optional charges field on the confirm screen → no deduction, no default charge
  const noChg = async (cat) => { await p.evaluate(cat => { S = fresh(); S.acct.ev = S.acct.sv = true; S.shell = true; S.tab = 'explore'; S.xs = [{v:'XCAT', p:cat}]; S.calcV = {}; lastId = null; render(); }, cat);
    await click('[data-a="pstup"]'); await p.waitForTimeout(1600); await p.fill('[data-pv="chg"]', ''); await p.locator('[data-pv="chg"]').dispatchEvent('input'); await click('[data-a="pstok"]'); };
  await noChg('retire'); console.log('pension, charges cleared → growth g:', await p.evaluate(() => [S.calcV.retirement.g, S.calcV.contrib.g, S.calcV.avc.g].join('/')), '(defaults 4.5) tagged g?', await p.evaluate(() => (S.calcSrc.retirement || []).includes('g')));
  await p.evaluate(() => { S = fresh(); S.acct.ev = S.acct.sv = true; S.shell = true; S.tab = 'explore'; S.xs = [{v:'XCAT', p:'retire'}]; lastId = null; render(); }); await click('[data-a="pstup"]'); await p.waitForTimeout(1600); await click('[data-a="pstok"]'); console.log('pension with 1% charges → g:', await p.evaluate(() => [S.calcV.retirement.g, S.calcV.contrib.g].join('/')), 'tagged', await p.evaluate(() => S.calcSrc.retirement.includes('g')));
  await noChg('invest'); console.log('investment, charges cleared → regular investing fee f:', await p.evaluate(() => S.calcV.regularinvest.f), 'tagged f?', await p.evaluate(() => (S.calcSrc.regularinvest || []).includes('f')), '| fees tool a:', await p.evaluate(() => S.calcV.fees.a), 'tagged a?', await p.evaluate(() => (S.calcSrc.fees || []).includes('a')));
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
