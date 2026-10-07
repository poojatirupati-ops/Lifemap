const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { loadSample(); const out = []; for (const sm of [null, 300, 500, 700, 900]) { S.saveM = sm; const P = project(); out.push('saveM ' + sm + ' -> ' + P.save.saveM + '/' + P.save.surplusM + ' pct ' + S.goals.map(g => g.k + ':' + P.pct[g.id]).join(' ') + ' | short yrs ' + P.rows.filter(chartShort).map(r => r.a).join(',') + ' | liv short ' + P.rows.filter(r => r.shortLiving > 0.5).length); } return out.join('\n'); }));
  await b.close(); })();
