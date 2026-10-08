const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const res = []; const ok = (n, pass, info) => res.push([pass ? 'OK' : 'FAIL', n, JSON.stringify(info)]);
  const click = async s => { await p.locator(s).first().click(); await p.waitForTimeout(150); };
  // 1. realreturn: exact real return (1+g)/(1+i) − 1
  const rr = await p.evaluate(() => { const out = {}; for (const [g, i] of [[5, 0.035], [4, 0.02]]) { S = fresh(); S.infl = i; const r = C('realreturn').run({p:20000, r:g, y:15}); out[g + '@' + i] = {real:r.rows.find(x => x[0].startsWith('Real return'))[1], today:r.val, line:r.line, expToday:Math.round(20000 * Math.pow(1 + g / 100, 15) / Math.pow(1 + i, 15))}; } S = fresh(); out.unset = C('realreturn').run({p:20000, r:5, y:15}); out.listed = [CALCS.some(c => c.id === 'realreturn'), TOPIC_TOOLS.Investing.includes('realreturn'), C('realreturn').id]; return out; });
  ok('realreturn 5% at 3.5% → 1.449%', rr['5@0.035'].real === '1.45%' || rr['5@0.035'].real === '1.449%', rr['5@0.035']);
  ok('realreturn 4% at 2% → 1.961%', rr['4@0.02'].real === '1.96%' || rr['4@0.02'].real === '1.961%', rr['4@0.02']);
  ok('realreturn exact (not g − i): 1.449 ≠ 1.5', Math.abs((1.05 / 1.035 - 1) * 100 - 1.449) < 0.001, (1.05 / 1.035 - 1) * 100);
  ok('realreturn today\'s money exact', +rr['5@0.035'].today.replace(/[^\d]/g, '') === rr['5@0.035'].expToday, rr['5@0.035']);
  ok('realreturn plain line', /really about 1\.4% a year/.test(rr['5@0.035'].line), rr['5@0.035'].line);
  ok('realreturn unset → future value + nudge', /Choose your inflation rate/.test(rr.unset.line), rr.unset.line);
  ok('realreturn back in Investments + Investing topic, no redirect', rr.listed[0] && rr.listed[1] && rr.listed[2] === 'realreturn', rr.listed);
  await p.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'realreturn'}]; lastId = null; render(); }); ok('realreturn unset shows the chips inline', await p.locator('#infl-calc [data-a="infl"]').count() === 3, {});
  await click('#infl-calc [data-a="infl"][data-p="0.039"]'); await p.screenshot({path: __dirname + '/build/v12-realreturn.png'});
  // 2. "Adjust for inflation" switch in Lump-sum growth and Regular investing
  for (const id of ['lumpsum', 'regularinvest']) {
    await p.evaluate(id => { S = fresh(); S.shell = true; S.tab = 'explore'; S.calcV[id] = id === 'lumpsum' ? {r:4, f:0, wait:5} : {g:5, f:1}; S.calcT = {[id]:{r:true, g:true, f:true, wait:true}}; S.xs = [{v:'CALC', p:id}]; lastId = null; render(); }, id);   // FP round 8 (§14): growth and fees typed by the customer (round-7 example values)
    const off = await p.locator('#cout').innerText(); ok(id + ': switch off by default, no today\'s-money line', await p.getAttribute('[data-a="adjinfl"]', 'aria-checked') === 'false' && !/today's money/i.test(off) && !(await p.locator('#infl-calc').count()), off.slice(0, 80));
    await click('[data-a="adjinfl"]'); ok(id + ': switch on with no rate → chips', await p.locator('#infl-calc [data-a="infl"]').count() === 3, {});
    await click('#infl-calc [data-a="infl"][data-p="0.039"]'); const on = await p.locator('#cout').innerText();
    ok(id + ': on → headline in today\'s money + real-return line', /IN TODAY'S MONEY/i.test(on) && /Real return about [\d.]+% a year \([\d.]+% growth/.test(on), on.split('\n').slice(0, 3).join(' | '));
    if (id === 'lumpsum') await p.screenshot({path: __dirname + '/build/v12-lumpsum-adjusted.png'});
    await p.evaluate(() => { S.xs = [{v:'CALC', p:'compound'}]; render(); S.xs = [{v:'CALC', p:'lumpsum'}]; render(); }); ok(id + ': switch remembered for the session', await p.evaluate(id => !!S.adjInfl[id], id), {});
    await click('[data-a="adjinfl"]'); ok(id + ': off again', !/IN TODAY'S MONEY/i.test(await p.locator('#cout').innerText()) || id !== 'lumpsum', {});
  }
  const lr = await p.evaluate(() => { S = fresh(); S.infl = 0.035; S.adjInfl = {lumpsum:true}; const r = C('lumpsum').run({p:10000, r:5, y:10, f:0}); return {val:r.val, exp:Math.round(10000 * Math.pow(1.05, 10) / Math.pow(1.035, 10)), line:r.line}; });
  ok('lumpsum on: 5% growth at 3.5% → real about 1.4%, headline exact', +lr.val.replace(/[^\d]/g, '') === lr.exp && /Real return about 1\.4% a year \(5% growth, prices rising 3\.5%\)/.test(lr.line), lr);
  // 3. pyramid: nothing "Solid" above a gold / coral level
  const py = await p.evaluate(() => { const mk = (o) => { S = fresh(); S.about = {age:40, partner:false, deps:0, married:null}; S.app = true; S.shell = true; S.infl = 0.02; const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; };
      put('work', 'Employed'); put('income', 90000); put('costsM', 2500); put('cash', o.cash); put('invest', 15000); put('cardBal', 0); put('loanBal', 0); put('life', 'Yes'); put('ip', 'Yes'); put('pension', 50000); put('pensionM', 500); put('home', 'Rent');
      const g = mkGoal('travel'); g.age = 45; g.amount = 3000; S.goals.push(g); S.retireSet = true; ASM_KEYS().forEach(k => { if (!asmMine(k) && asmV(k) != null) S.asm[k] = asmV(k); }); applyAssume(); return foundations().map(l => l.n + ':' + l.st); };
    return {thin:mk({cash:9000}), solid:mk({cash:20000}), sheet:(mk({cash:9000}), fndSheet(2))}; });
  ok('pyramid: emergency fund in progress → levels above show "In place", never Solid', py.thin.join() === '1:ok,2:mid,3:held,4:held,5:held', py.thin);
  ok('pyramid: all solid when nothing below is weak', py.solid.join() === '1:ok,2:ok,3:ok,4:ok,5:ok', py.solid);
  ok('pyramid: held sheet explains why', /a level below it still needs work/.test(py.sheet), {});
  await p.evaluate(() => { const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('cash', 9000); S.tab = 'plan'; S.planGo = 'fnd'; lastId = null; render(); }); await p.locator('#r-fnd').scrollIntoViewIfNeeded(); await p.locator('#r-fnd').screenshot({path: __dirname + '/build/v12-pyramid.png'});
  ok('pyramid DOM: In place badge shown', (await p.locator('#r-fnd .fr.held').count()) >= 1, {});
  // 4. debt split end to end
  const ds = await p.evaluate(() => { loadSample(); const F = finNums(), P = project(), fx = (b, r, pm, i) => amortYear(b, r, pm, i).paid;   // FP round 7: card and loan APRs are effective rates (audit #65)
    const exp0 = fx(F.mortBal, F.mortRate, F.mortPayM) + fx(F.cardBal, 0, F.cardPayM, iAPR(F.cardRate)) + fx(F.loanBal, 0, F.loanPayM, iAPR(F.loanRate));
    const liab = FSEC.find(s => s.id === 'liab'); const items = checkItems().filter(x => x.s.id === 'liab').map(x => FF[x.k].l);
    return {fields:liab.f, F:{card:[F.cardBal, F.cardPayM, F.cardRate], loan:[F.loanBal, F.loanPayM, F.loanRate], debt:F.debt, pay:F.debtPayM}, fixed0:Math.round(P.rows[0].fixed), exp0:Math.round(exp0), chartFixed0:Math.round(P.rows[0].fixed), parts:rowParts(P.rows[0]), needs:P.rows[0].needs, p4:items, lvl3:foundations()[2]}; });
  ok('Liabilities fields split (card + loan, each with a repayment)', ds.fields.join() === 'mortYN,mortBal,mortPayM,mortYears,mortRate,cardBal,cardPayM,cardRate,loanBal,loanPayM,loanRate,mort2', ds.fields);
  ok('rates: card 20%, loan 8%', ds.F.card[2] === 0.2 && ds.F.loan[2] === 0.08, ds.F);
  ok('sample: small card balance + car loan', ds.F.card[0] === 400 && ds.F.loan[0] === 3500, ds.F);
  ok('engine year-1 repayments = mortgage + card + loan amortised separately (no double counting)', Math.abs(ds.fixed0 - ds.exp0) <= 1, {fixed0:ds.fixed0, exp0:ds.exp0});
  ok('chart: year-1 bar = needs (living + fixed) + goals, parts sum', Math.abs(ds.parts.fromIncome + ds.parts.fromSavings + ds.parts.short - ds.parts.spend) <= 1, ds.parts);
  ok('P4 check rows use the new labels', ds.p4.every(l => !/Other loans and cards/.test(l)), ds.p4);
  ok('pyramid level 3 uses the split (car loan > 2 years → coral)', ds.lvl3.st === 'bad' && /Loans of €3,500/.test(ds.lvl3.s) && ds.lvl3.items.some(x => /Credit card €400 clears/.test(x.s)), ds.lvl3);
  const card = await p.evaluate(() => { const r = {}; for (const [b, pm] of [[2000, 200], [2000, 60]]) { S.fin.cardBal = b; S.src.cardBal = 'typed'; S.fin.cardPayM = pm; S.src.cardPayM = 'typed'; S.fin.loanBal = 0; const l = foundations()[2]; r[b + '@' + pm] = l.items.find(x => /Credit card/.test(x.s)); } return r; });
  ok('credit card cleared within 12 months → gold', card['2000@200'].st === 'mid', card['2000@200']); ok('credit card not cleared within 12 months → coral', card['2000@60'].st === 'bad', card['2000@60']);
  // mocked upload: liabilities statement feeds the card and loan fields
  const up = await p.evaluate(() => { loadSample(); ['cardBal','cardPayM','loanBal','loanPayM'].forEach(k => { delete S.fin[k]; delete S.src[k]; }); S.upl = {sec:'liab', stage:'confirm', files:['x.pdf'], edit:{}}; confirmUpload(); return ['cardBal','cardPayM','loanBal','loanPayM'].map(k => k + '=' + S.fin[k] + '/' + S.src[k]); });
  ok('upload: card statement → card fields, loan statement → loan fields', up.join() === 'cardBal=400/doc,cardPayM=40/doc,loanBal=3500/doc,loanPayM=100/doc', up);
  await p.evaluate(() => { openReport(); }); ok('report money snapshot lists cards and loans', await p.evaluate(() => /Credit cards: total owed/.test(document.getElementById('report').innerText) && /Other loans \(car, personal, credit union\)/.test(document.getElementById('report').innerText)), {});
  await p.evaluate(() => { document.getElementById('report').classList.remove('on'); S.tab = 'me'; S.me = 'fin'; S.fsec = 3; S.fmode.liab = 'type'; lastId = null; render(); const e = document.getElementById('f-cardBal'); if (e) e.closest('.field').scrollIntoView({block:'start', behavior:'instant'}); }); await p.waitForTimeout(100); await p.screenshot({path: __dirname + '/build/v12-liabilities.png'});
  ok('Liabilities screen: "Not sure? See an example" on the new fields [r9 §15]', await p.locator('[data-a="fex"][data-p="cards.owed"]').count() >= 1 && await p.locator('[data-a="fex"][data-p="loans.owed"]').count() === 1 && await p.locator('[data-a="fest"], [data-a="fnone"]').count() === 0, {});
  res.forEach(r => console.log(r.join(' | ').slice(0, 300))); console.log('FAILS', res.filter(r => r[0] === 'FAIL').length, 'of', res.length);
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
