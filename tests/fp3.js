const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const mk = (o) => { S = fresh(); S.about = {age:o.age, partner:!!o.pInc, deps:0}; S.retireAge = o.ra || 66; S.ans['6'] = o.q6; S.app = true; S.shell = true;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', 'Employed'); put('income', o.inc); if (o.pInc){ put('pIncome', o.pInc); put('pAge', o.age); } put('costsM', o.costs); put('cash', o.cash || 0); put('invest', o.inv || 0); put('pension', o.pen || 0); put('pensionM', o.penM || 0);
      if (o.mort){ put('home', 'Own with mortgage'); put('mortBal', o.mort); put('mortPayM', o.mortPay); put('mortYears', 25); }
      o.goals.forEach(([k, y, prio, amt]) => { const g = mkGoal(k); if (k !== 'retire' && y != null) g.age = o.age + y; if (prio) g.prio = prio; if (amt) g.amount = amt; S.goals.push(g); }); };
    const run = () => { const out = {}; for (const a of ['standard','cautious']) { S.assume = a; const P = project(); out[a] = {save:P.save, goals:S.goals.map(g => g.name + ' ' + P.pct[g.id] + (P.goal[g.id] ? ' (' + P.goal[g.id].needM + '/' + P.goal[g.id].nowM + ')' : '') + ' ' + g.amount), purple:(P.rows.find(isShort) || {}).a}; } S.assume = 'standard'; return out; };
    const A = {age:30, inc:55000, costs:2400, cash:6000, pen:12000, q6:1, goals:[['safety',2],['home',18],['business',26,'Nice to have'],['wealth',27,'Nice to have']]};
    const res = {};
    mk(A); res.A = run();
    // A checks
    S.assume = 'standard'; const P = (wi) => { const x = project(wi); return S.goals.map(g => x.pct[g.id]).join('/'); };
    res.A_minus100 = P({g:S.goals[0].id, m:-100, l:0}); res.A_lump10k = P({g:S.goals.find(g => g.k === 'wealth').id, m:0, l:10000}); S.ans['6'] = 3; res.A_over750 = P(); S.ans['6'] = 1;
    mk({age:40, inc:75000, pInc:45000, costs:4000, mort:220000, mortPay:1200, cash:30000, inv:20000, q6:3, ra:65, goals:[['car',3,'Nice to have'],['edu',10],['mfree',15,'Nice to have'],['retire']]}); res.B = run();
    mk({age:26, inc:32000, costs:2000, cash:1500, q6:0, goals:[['travel',2,'Nice to have'],['wedding',3],['home',5],['retire']]}); res.C = run();
    mk({age:50, inc:120000, costs:4500, cash:80000, inv:250000, pen:400000, q6:3, ra:63, goals:[['helpfam',8],['wealth',10],['retire'],['legacy']]}); res.D = run();
    return res; });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
