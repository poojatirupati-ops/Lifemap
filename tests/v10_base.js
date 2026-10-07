const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const res = await p.evaluate(() => { const out = [], num = s => +String(s).replace(/[^\d.-]/g, ''), ok = (name, got, want) => out.push([name, Math.round(got), Math.round(want), Math.abs(got - want) <= 1 ? 'OK' : 'FAIL']);
    const row = (r, label) => num((r.rows.find(x => x[0].startsWith(label)) || [])[1]);
    for (const set of ['standard', 'cautious']) { S = fresh(); S.assume = set; S.infl = set === 'standard' ? 0.02 : 0.035; applyAssume(); const i = AS.infl, d = y => Math.pow(1 + i, y), tag = ' [' + set + ' ' + (i * 100) + '%]';
      let r = C('lumpsum').run({p:10000, r:4, y:15, f:0}); ok('lumpsum value (switch off)' + tag, num(r.val), 10000 * Math.pow(1.04, 15)); S.adjInfl = {lumpsum:true, regularinvest:true}; r = C('lumpsum').run({p:10000, r:4, y:15, f:0}); ok('lumpsum today (switch on)' + tag, row(r, 'Worth in today'), 10000 * Math.pow(1.04, 15) / d(15)); ok('lumpsum headline in today\'s money (switch on)' + tag, num(r.val), 10000 * Math.pow(1.04, 15) / d(15)); S.adjInfl = {};
      r = C('lumpsum').run({p:10000, r:4, y:15, f:1}); const nr = 1.04 * 0.99; ok('lumpsum after 1% fees' + tag, num(r.val), 10000 * Math.pow(nr, 15)); ok('lumpsum fees cost' + tag, row(r, 'Fees cost'), 10000 * (Math.pow(1.04, 15) - Math.pow(nr, 15)));
      const fA = (m, rr, y) => { const j = Math.pow(1 + rr, 1 / 12) - 1, n = y * 12;   /* effective monthly rate (FP round 6) */ return j ? m * (Math.pow(1 + j, n) - 1) / j : m * n; };
      r = C('regularinvest').run({m:300, y:15, g:5, f:1}); const net = fA(300, (1.05 * 0.99 - 1), 15); ok('regular investing net (switch off)' + tag, num(r.val), net); S.adjInfl = {regularinvest:true}; r = C('regularinvest').run({m:300, y:15, g:5, f:1}); ok('regular investing today (switch on)' + tag, row(r, 'Worth in today'), net / d(15)); S.adjInfl = {};
      r = C('compound').run({p:5000, m:200, r:4, y:20}); const cf = 5000 * Math.pow(1.04, 20) + fA(200, 0.04, 20); ok('compound value' + tag, num(r.val), cf); ok('compound today' + tag, row(r, 'Worth in today'), cf / d(20));
      r = C('goalplanner').run({t:15000, y:3, s:2000, r:2}); const fut = 15000 * d(3), mm = (fut - 2000 * Math.pow(1.02, 3)) / fA(1, 0.02, 3); ok('goal planner future cost' + tag, row(r, 'Will cost'), fut); ok('goal planner monthly (on future cost)' + tag, num(r.val), mm);
      r = C('avc').run({m:200, y:15, g:4.5, tr:40}); const av = fA(200, 0.045, 15); ok('AVC value' + tag, num(r.val), av); ok('AVC today' + tag, row(r, 'Worth in today'), av / d(15));
      r = C('contrib').run({sal:60000, inc:2, y:25, g:4.5, tr:40}); const cv = fA(100, 0.045, 25); ok('contribution value' + tag, num(r.val), cv); ok('contribution today' + tag, row(r, 'Worth in today'), cv / d(25));
      r = C('retirement').run({age:40, ra:65, pot:60000, m:500, d:40000, o:15000, g:4.5}); ok('retirement today' + tag, row(r, 'Worth in today'), num(r.val) / d(25));
      // drawdown / will my money last: spending rises with inflation (no new input)
      ok('will my money last (silent inflation)' + tag, +C('lastmoney').run({pot:400000, w:24000, g:3}).val.match(/\d+/)[0], lasts(400000, 24000, 3, i * 100));
      ok('drawdown balanced (silent inflation)' + tag, +C('drawdown').run({pot:400000, w:20000}).val.match(/\d+/)[0], lasts(400000, 20000, 4, i * 100));
      if (set === 'standard') { ok('will my money last at 2% (as before)', +C('lastmoney').run({pot:400000, w:24000, g:3}).val.match(/\d+/)[0], 18); out.push(['no inflation slider', C('lastmoney').inputs.concat(C('drawdown').inputs).some(x => x.k === 'i') ? 1 : 0, 0, C('lastmoney').inputs.concat(C('drawdown').inputs).some(x => x.k === 'i') ? 'FAIL' : 'OK']); }
    }
    const removed = ['realreturn','inflation'].map(id => CALCS.some(c => c.id === id)), redirect = [C('realreturn').id, C('inflation').id];
    return {checks:out, removed, redirect}; });
  res.checks.forEach(c => console.log(c.join(' | '))); console.log('removed from lists:', JSON.stringify(res.removed), 'redirects:', JSON.stringify(res.redirect), 'fails:', res.checks.filter(c => c[3] === 'FAIL').length);
  // UI: section names, topic page order, lump-sum fees from a statement without charges
  await p.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; lastId = null; render(); });
  console.log('sections:', (await p.locator('#main .sec h3').allInnerTexts()).join(' | '), '| inflation tool tiles', await p.locator('[data-p="realreturn"],[data-p="inflation"]').count()); await p.screenshot({path: __dirname + '/build/v10-explore.png', fullPage:false});
  await p.locator('[data-a="topic"][data-p="Mortgages"]').click(); await p.waitForTimeout(150);
  console.log('topic order:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#main h3, #main [data-a="expertfor"], #main [data-a="cat"], #main .livebadge')].map(e => e.tagName === 'H3' ? e.textContent : e.dataset.a || 'LIVE'))));
  await p.screenshot({path: __dirname + '/build/v10-topic-mortgages.png'});
  await p.evaluate(() => { S.xs = [{v:'CALC', p:'lumpsum'}]; lastId = null; render(); }); console.log('lump sum fee default', await p.inputValue('#c-f'), '| result rows:', (await p.locator('#cout').innerText()).replace(/\n/g, ' · ').slice(0, 200)); await p.screenshot({path: __dirname + '/build/v10-lumpsum.png'});
  await p.evaluate(() => { S.xs = []; ACT.calc('realreturn'); }); console.log('link to realreturn opens:', await p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]));
  // ---- editable value boxes beside sliders
  const typeIn = async (sel, txt, commit) => { const l = p.locator(sel); await l.click(); await l.fill(''); await l.type(txt); if (commit) await l.press('Enter'); await p.waitForTimeout(120); };
  await p.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'borrow'}]; lastId = null; render(); });
  const o1 = await p.locator('#cout').innerText(); await typeIn('#co-inc', '61250'); console.log('calc typed live: slider', await p.inputValue('#c-inc'), '| result changed', o1 !== await p.locator('#cout').innerText(), '| box', await p.inputValue('#co-inc'));
  await typeIn('#co-inc', '250000', true); console.log('calc above slider top (valid): value', await p.evaluate(() => S.calcV.borrow.inc), 'slider', await p.inputValue('#c-inc'), 'slider max', await p.getAttribute('#c-inc', 'max'), 'box', await p.inputValue('#co-inc'), 'hint', JSON.stringify(await p.locator('#nh-ck-inc').innerText()));
  await typeIn('#co-inc', '99000000', true); console.log('calc beyond real limit: value', await p.evaluate(() => S.calcV.borrow.inc), 'hint', await p.locator('#nh-ck-inc').innerText());
  await p.evaluate(() => { S.xs = [{v:'CALC', p:'repayment'}]; lastId = null; render(); }); await typeIn('#co-rate', '3.85', true); console.log('rate keeps precision', await p.evaluate(() => S.calcV.repayment.rate), 'box', await p.inputValue('#co-rate'));
  await typeIn('#co-rate', '12', true); console.log('rate above max → clamp', await p.evaluate(() => S.calcV.repayment.rate), 'hint', await p.locator('#nh-ck-rate').innerText());
  await p.evaluate(() => { const r = document.getElementById('c-term'); r.value = 22; r.dispatchEvent(new Event('input', {bubbles:true})); }); console.log('drag updates box', await p.inputValue('#co-term'));
  await p.screenshot({path: __dirname + '/build/v10-calc-typed.png'});
  // what-if monthly + one-off, my monthly saving
  await p.evaluate(() => { loadSample(); S.planGo = 'wi'; lastId = null; render(); }); await p.locator('#r-wi').scrollIntoViewIfNeeded();
  const g0 = await p.locator('#r-goals').innerText(); await typeIn('#wim-v', '400', true); console.log('what-if typed', await p.evaluate(() => S.wi.m), 'slider', await p.inputValue('[data-wi="m"]'), 'goals changed', g0 !== await p.locator('#r-goals').innerText(), 'box', await p.inputValue('#wim-v'));
  await typeIn('#wim-v', '2500', true); console.log('what-if above slider top', await p.evaluate(() => S.wi.m), 'slider max', await p.getAttribute('[data-wi="m"]', 'max'));
  await typeIn('#wil-v', '75000', true); console.log('one-off typed', await p.evaluate(() => S.wi.l), 'slider', await p.inputValue('[data-wi="l"]'));
  const sp = await p.evaluate(() => project().save.surplusM); await typeIn('#r-save .nb', '100', true); console.log('saving typed', await p.evaluate(() => [S.saveM, project().save.saveM].join('/')));
  await typeIn('#r-save .nb', '99999', true); console.log('saving above spare money → capped at', await p.evaluate(() => S.saveM), '(spare ' + sp + ') hint', JSON.stringify(await p.locator('#nh-save-m').innerText()));
  await p.locator('#r-wi').screenshot({path: __dirname + '/build/v10-whatif-typed.png'});
  // age in the plan builder
  await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'B1')[2](); lastId = null; render(); }); await typeIn('#age-v', '45', true); console.log('age typed', await p.evaluate(() => S.about.age), 'slider', await p.inputValue('input[data-in="age"]'));
  await typeIn('#age-v', '95', true); console.log('age above 80 → clamp', await p.evaluate(() => S.about.age), 'hint', await p.locator('#nh-age-a').innerText().catch(() => ''));
  console.log('boxes labelled', await p.evaluate(() => [...document.querySelectorAll('input[data-nb]')].every(i => i.getAttribute('aria-labelledby') && document.getElementById(i.getAttribute('aria-labelledby')))));
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
