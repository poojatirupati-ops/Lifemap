const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { const out = []; const pmt = (P, r, y) => { const i = r / 1200, n = y * 12; return P * i / (1 - Math.pow(1 + i, -n)); };
    for (const mp of [Math.round(pmt(220000, 3.8, 15)), 1500]) for (const penM of [0, 300, 500]) for (const deps of [0, 1, 2]) {
      S = fresh(); S.about = {age:40, partner:true, deps}; S.retireAge = 65; S.ans['6'] = 3;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', 'Employed'); put('income', 75000); put('pIncome', 45000); put('pAge', 40); put('costsM', 4000); put('cash', 30000); put('invest', 20000); put('home', 'Own with mortgage'); put('mortBal', 220000); put('mortPayM', mp); put('mortYears', 15); put('pensionM', penM);
      [['car',3,'Nice to have'],['edu',10],['mfree',15,'Nice to have'],['retire']].forEach(([k, y, pr]) => { const g = mkGoal(k); if (y) g.age = 40 + y; if (pr) g.prio = pr; S.goals.push(g); });
      const r = {}; for (const a of ['standard','cautious']) { S.assume = a; const P = project(); r[a] = S.goals.map(g => P.pct[g.id] + (P.goal[g.id] ? '(' + P.goal[g.id].needM + '/' + P.goal[g.id].nowM + ')' : '')).join(' '); }
      S.assume = 'standard'; const P = project(); out.push('mp ' + mp + ' penM ' + penM + ' deps ' + deps + ' save ' + P.save.saveM + '/' + P.save.surplusM + ' | ' + r.standard + ' | c ' + r.cautious); }
    return out.join('\n'); }));
  await b.close(); })();
