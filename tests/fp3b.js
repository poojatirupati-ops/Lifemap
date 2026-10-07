const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { const out = [];
    for (const penM of [0, 150, 300]) for (const sAmt of [8000, 9600, 10000, 7200]) for (const oneOff of [0]) {
      S = fresh(); S.about = {age:30, partner:false, deps:0}; S.retireAge = 66; S.ans['6'] = 1;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', 'Employed'); put('income', 55000); put('costsM', 2400); put('cash', 6000); put('pension', 12000); put('pensionM', penM); put('oneOffY', oneOff);
      [['safety',2],['home',18],['business',26,'Nice to have'],['wealth',27,'Nice to have']].forEach(([k, y, pr]) => { const g = mkGoal(k); g.age = 30 + y; if (pr) g.prio = pr; S.goals.push(g); }); S.goals[0].amount = sAmt;
      const r = {}; for (const a of ['standard','cautious']) { S.assume = a; const P = project(); r[a] = S.goals.map(g => P.pct[g.id] + (a === 'standard' ? '(' + P.goal[g.id].needM + '/' + P.goal[g.id].nowM + ')' : '')).join(' '); }
      S.assume = 'standard'; out.push('penM ' + penM + ' safety ' + sAmt + ' spare ' + project().save.surplusM + ' | ' + r.standard + ' | cautious ' + r.cautious); }
    return out.join('\n'); }));
  await b.close(); })();
