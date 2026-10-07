const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const res = await p.evaluate(() => {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => Math.round(a + rnd() * (b - a));
    const keys = ['home','family','edu','travel','business','mfree','safety','wealth','helpfam','wedding','car','health','retire','legacy'];
    const build = o => { S = fresh(); Object.assign(S.ans, {'2':0,'4':1,'7':1,'8':2,'9':2,'12':1}); if (o.q6 != null) S.ans['6'] = o.q6; S.about = {age:o.age, partner:!!o.pInc, deps:o.deps}; S.retireAge = o.ra; S.assume = o.set; S.app = true; S.shell = true;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', o.self ? 'Self-employed' : 'Employed'); put('income', o.inc); if (o.pInc){ put('pIncome', o.pInc); put('pAge', o.age); } put('costsM', o.costs); put('cash', o.cash); put('invest', o.inv); put('pension', o.pen); put('pensionM', o.penM); put('debt', o.debt); put('debtPayM', o.debtPay); put('oneOffY', o.oneOff);
      if (o.mort){ put('home', 'Own with mortgage'); put('mortBal', o.mort); put('mortPayM', o.mortPay); put('mortYears', 20); }
      o.goals.forEach(([k, y, pr]) => { const g = mkGoal(k); if (k !== 'retire' && k !== 'legacy') g.age = Math.min(89, o.age + y); if (pr) g.prio = pr; S.goals.push(g); }); };
    const custs = []; for (let i = 0; i < 30; i++){ const age = ri(22, 62), n = ri(1, 6), ks = [...new Set(Array.from({length:n}, () => pick(keys)))];
      custs.push({age, inc:ri(18, 160) * 1000, pInc:rnd() < 0.4 ? ri(10, 80) * 1000 : 0, deps:ri(0, 3), costs:ri(12, 70) * 100, cash:ri(0, 60) * 1000, inv:rnd() < 0.5 ? ri(0, 150) * 1000 : 0, pen:ri(0, 400) * 1000, penM:pick([0, 100, 300, 600]), debt:rnd() < 0.3 ? ri(1, 30) * 1000 : 0, debtPay:ri(50, 500), oneOff:pick([0, 1000, 3000]),
        mort:rnd() < 0.4 ? ri(50, 400) * 1000 : 0, mortPay:ri(600, 2200), ra:pick([60, 63, 66, 68]), q6:pick([null, 0, 1, 2, 3, 4]), set:pick(['standard','cautious']), self:rnd() < 0.2, goals:ks.map(k => [k, ri(1, 30), rnd() < 0.3 ? 'Nice to have' : null])}); }
    const fails = []; let rowsChecked = 0, shortYears = 0, domChecks = 0;
    custs.forEach((o, ci) => { build(o); const P = project(); const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind));
      P.rows.forEach(r => { rowsChecked++; const q = rowParts(r); const sum = q.fromIncome + q.fromSavings + q.short;
        if (Math.abs(sum - q.spend) > 1) fails.push(ci + ' age ' + r.a + ' sum ' + Math.round(sum) + ' != ' + Math.round(q.spend));
        if (q.fromIncome < -0.01 || q.fromSavings < -0.01 || q.short < -0.01) fails.push(ci + ' age ' + r.a + ' negative part');
        if (Math.abs(r.living + r.fixed - r.needs) > 1) fails.push(ci + ' age ' + r.a + ' needs mismatch');
        if (Math.abs(r.goalCost - (r.dueG || []).reduce((t, x) => t + x.cost, 0)) > 1) fails.push(ci + ' goalCost mismatch'); });
      // shortfall years == goal % < 100 years ∪ living-not-covered years
      const want = new Set(P.rows.filter(r => r.shortLiving > 0.5).map(r => r.a)); fg.forEach(g => { if (P.pct[g.id] < 100) want.add(Math.min(g.age, P.rows[P.rows.length - 1].a)); });
      const got = new Set(P.rows.filter(chartShort).map(r => r.a)); shortYears += got.size;
      const same = want.size === got.size && [...want].every(a => got.has(a)); if (!same) fails.push(ci + ' short years chart ' + [...got].join(',') + ' vs expected ' + [...want].join(','));
      // DOM: savings line = liquid; coral bars = shortfall years
      if (ci % 5 === 0){ S.view = 'detail'; S.csave = true; S.csel = null; lastId = null; render(); const svg = document.querySelector('#r-glance svg.cchart'); const coral = [...svg.querySelectorAll('rect[fill="var(--alert)"]')].length; domChecks++;
        if (coral !== got.size) fails.push(ci + ' DOM coral bars ' + coral + ' vs ' + got.size);
        const sav = svg.querySelector('path[stroke="#6E8AA6"]'); if (!sav) fails.push(ci + ' no savings line'); S.csave = false; }
    });
    // direction checks on a base customer
    const base = {age:32, inc:52000, pInc:0, deps:1, costs:2600, cash:5000, inv:0, pen:15000, penM:200, debt:0, debtPay:0, oneOff:1000, mort:0, mortPay:0, ra:66, q6:1, set:'standard', self:false, goals:[['safety',2],['home',6],['edu',15],['wealth',20,'Nice to have'],['retire']]};
    const metric = o => { build(o); const P = project(); return {short:P.rows.reduce((t, r) => t + rowParts(r).short, 0), pct:S.goals.reduce((t, g) => t + P.pct[g.id], 0), inc:P.rows.reduce((t, r) => t + rowParts(r).fromIncome, 0)}; };
    const m0 = metric(base), dirs = {};
    const chk = (name, o, f) => { const m = metric(Object.assign({}, base, o)); dirs[name] = [Math.round(m0.short), Math.round(m.short), m0.pct, m.pct, f(m) ? 'OK' : 'WRONG']; };
    chk('income up', {inc:70000}, m => m.short <= m0.short + 1 && m.pct >= m0.pct);
    chk('costs up', {costs:3200}, m => m.short >= m0.short - 1 && m.pct <= m0.pct);
    chk('cautious', {set:'cautious'}, m => m.short >= m0.short - 1 && m.pct <= m0.pct);
    chk('save more (Q6 €300-750)', {q6:2}, m => m.pct >= m0.pct);
    chk('save less (Q6 under €100)', {q6:0}, m => m.pct <= m0.pct);
    build(base); S.saveM = 50; const lo = project(); S.saveM = 600; const hi = project(); dirs['My monthly saving 50 → 600'] = [S.goals.reduce((t, g) => t + lo.pct[g.id], 0), S.goals.reduce((t, g) => t + hi.pct[g.id], 0), S.goals.reduce((t, g) => t + hi.pct[g.id], 0) >= S.goals.reduce((t, g) => t + lo.pct[g.id], 0) ? 'OK' : 'WRONG'];
    build(base); const w0 = project(), w1 = project({g:S.goals[3].id, m:200, l:0}), w2 = project({g:S.goals[3].id, m:-100, l:0}); dirs['what-if +200 to wealth / -100'] = [w0.pct[S.goals[3].id], w1.pct[S.goals[3].id], w2.pct[S.goals[3].id], w1.pct[S.goals[3].id] >= w0.pct[S.goals[3].id] && w2.pct[S.goals[3].id] <= w0.pct[S.goals[3].id] ? 'OK' : 'WRONG'];
    return {customers:custs.length, rowsChecked, shortYears, domChecks, fails:fails.slice(0, 15), nFails:fails.length, dirs};
  });
  console.log(JSON.stringify(res, null, 1)); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
