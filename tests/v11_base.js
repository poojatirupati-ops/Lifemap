const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const cases = await p.evaluate(() => {
    const mk = (o, goals) => { S = fresh(); Object.assign(S.ans, {'2':0,'4':1,'6':1,'7':1,'8':2,'9':2,'12':1}); S.about = {age:o.age || 35, partner:!!o.partner, deps:o.deps || 0, married:null}; S.retireAge = 66; S.app = true; S.shell = true; S.checked = true; S.acct.ev = S.acct.sv = true;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; };
      put('work', 'Employed'); put('income', o.inc == null ? 60000 : o.inc); put('costsM', o.costs == null ? 2500 : o.costs); if (o.cash !== undefined) put('cash', o.cash); if (o.inv != null) put('invest', o.inv);
      if (o.card != null){ put('cardBal', o.card); if (o.cardPay != null) put('cardPayM', o.cardPay); } put('loanBal', o.debt || 0); if (o.debtPay != null) put('loanPayM', o.debtPay); if (o.prot !== false){ put('life', o.life || 'Yes'); put('ip', o.ip || 'Yes'); } put('pension', o.pen == null ? 40000 : o.pen); put('pensionM', o.penM == null ? 400 : o.penM); put('home', 'Rent');
      (goals || [['travel', 3]]).forEach(([k, y, amt]) => { const g = mkGoal(k); if (y != null) g.age = (o.age || 35) + y; if (amt) g.amount = amt; S.goals.push(g); });
      const L = foundations(), nx = fndNext(L); return {levels:L.map(l => l.n + ':' + l.st + ' (' + l.s + ')'), next:nx ? nx.t + '. ' + nx.d : 'none', home:nextStep().t}; };
    return {
      'negative surplus': mk({inc:28000, costs:3200, cash:5000}),
      'no emergency fund': mk({cash:500}),
      'credit-card debt (no repayment set)': mk({cash:20000, card:6000}),
      'car loan clearing in a year': mk({cash:20000, debt:3000, debtPay:280}),
      'emergency fund thin, rest solid (no Solid above it)': mk({cash:9000, inv:15000, inc:90000, costs:2500}, [['travel', 5, 3000], ['retire']]),
      'no life cover with kids': mk({cash:20000, deps:2, life:'No'}),
      'all solid': mk({cash:20000, inv:15000, inc:90000, costs:2500}, [['travel', 5, 3000], ['retire']]),
      'missing assets': mk({cash:undefined}),
      'missing protection, partner': mk({cash:20000, partner:true, prot:false})
    }; });
  for (const [k, v] of Object.entries(cases)) console.log(k.padEnd(38), '| ' + v.levels.join(' | ') + '\n'.padEnd(41) + '→ Next: ' + v.next + ' | Home card: ' + v.home);
  // UI: results card, Home compact, tapped sheet
  await p.evaluate(() => { loadSample(); lastId = null; render(); }); await p.waitForTimeout(150);
  const order = await p.evaluate(() => ['#r-found', '#r-fnd', '#r-wi'].map(q => Math.round(document.querySelector(q).getBoundingClientRect().top + document.getElementById('main').scrollTop)));
  console.log('results order (found < foundations < what-if):', order.join(' < '), order[0] < order[1] && order[1] < order[2] ? 'OK' : 'WRONG', '| ol items', await p.locator('#r-fnd ol.fnd > li').count(), '| first li (bottom):', (await p.locator('#r-fnd ol.fnd > li').first().innerText()).replace(/\n/g, ' '));
  await p.locator('#r-fnd').scrollIntoViewIfNeeded(); await p.locator('#r-fnd').screenshot({path: __dirname + '/build/v11-results-pyramid.png'});
  await p.locator('#r-fnd .fr').nth(1).click(); await p.waitForTimeout(250); console.log('sheet:', (await p.locator('.sheet').innerText()).replace(/\n/g, ' · ').slice(0, 260)); await p.screenshot({path: __dirname + '/build/v11-sheet.png'});
  await p.locator('.sheet [data-a="calc"]').click(); await p.waitForTimeout(150); console.log('sheet action →', await p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]));
  await p.evaluate(() => { S.tab = 'home'; S.sheet = null; lastId = null; render(); }); console.log('home compact', await p.locator('#h-fnd ol.fnd li').count(), '| next step card:', (await p.locator('.card:has-text("Your next best step")').innerText()).replace(/\n/g, ' · ').slice(0, 160)); await p.screenshot({path: __dirname + '/build/v11-home.png'});
  await p.evaluate(() => openReport()); console.log('report section', await p.locator('#report h2:has-text("Your financial foundations")').count());
  // ---- inflation is the client's own choice (S.infl)
  await p.evaluate(() => { document.getElementById('report').classList.remove('on'); S = fresh(); S.adjInfl = {lumpsum:true}; S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'lumpsum'}]; lastId = null; render(); });
  console.log('fresh: S.infl', await p.evaluate(() => S.infl), '| chips inline', await p.locator('#infl-calc [data-a="infl"]').count(), '| pre-selected', await p.locator('#infl-calc .chip.sel').count(), '| nudge:', (await p.locator('#cout').innerText()).includes('Pick an inflation rate'), '| today row', await p.locator('#cout:has-text("Worth in today")').count());
  await p.locator('#infl-calc [data-a="infl"][data-p="0.035"]').click(); await p.waitForTimeout(150);
  console.log('picked 3.5%: AS.infl', await p.evaluate(() => (applyAssume(), AS.infl)), '| line:', (await p.locator('#cout').innerText()).split('\n').find(x => x.startsWith('Worth about')), '| change line', await p.locator('[data-a="infledit"]').count(),
    '| exact', await p.evaluate(() => { const r = C('lumpsum').run(calcVals(C('lumpsum'))), fv = 10000 * Math.pow(1.04, 15); return Math.abs(+r.rows.find(x => x && x[0].startsWith('Worth'))[1].replace(/[^\d]/g, '') - Math.round(fv / Math.pow(1.035, 15))) <= 1; }));
  await p.locator('[data-a="infledit"]').click(); await p.locator('#infl-calc [data-a="infl"][data-p="other"]').click(); await p.waitForTimeout(150); const l = p.locator('#infl-v-calc'); await l.fill(''); await l.type('4.2'); await l.press('Enter'); await p.waitForTimeout(150);
  console.log('Other 4.2%: S.infl', await p.evaluate(() => S.infl), '| tool line', (await p.locator('#cout').innerText()).includes('4.2%'));
  await p.evaluate(() => { loadSample(); S.infl = 0.035; lastId = null; render(); }); console.log('sample + 3.5%: engine AS.infl', await p.evaluate(() => (project(), AS.infl)), '| assumptions row', await p.evaluate(() => assumeRows().find(r => r[0].startsWith('Prices'))[1]));
  await p.evaluate(() => openReport()); console.log('report shows 3.5% + source', await p.evaluate(() => /3\.5% a year \(your choice.*CSO, May 2026/.test(document.getElementById('report').innerText)));
  await p.evaluate(() => document.getElementById('report').classList.remove('on'));
  // what-if card + Assumptions sheet
  await p.locator('#infl-wi').scrollIntoViewIfNeeded(); const g0 = await p.locator('#r-goals').innerText(); await p.locator('#infl-wi [data-a="infl"][data-p="0.02"]').click(); await p.waitForTimeout(200); console.log('what-if: switched to 2%', await p.evaluate(() => S.infl), 'results changed', g0 !== await p.locator('#r-goals').innerText());
  await p.evaluate(() => { S.sheet = 'assume'; render(); }); console.log('assumptions sheet chips', await p.locator('.sheet #infl-sheet [data-a="infl"]').count()); await p.evaluate(() => { S.sheet = null; render(); });
  // step-7 gate
  await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'P4')[2](); S.infl = null; S.checked = true; lastId = null; render(); }); console.log('step 7 without a choice: results disabled', await p.locator('#seeres').isDisabled()); await p.locator('#p4-infl [data-a="infl"][data-p="0.02"]').click(); await p.waitForTimeout(150); console.log('after choosing 2%: enabled', !(await p.locator('#seeres').isDisabled()));
  await p.screenshot({path: __dirname + '/build/v11-step7-inflation.png'});
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
