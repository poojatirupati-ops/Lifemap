const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { loadSample(); const out = {}; for (const a of ['standard','cautious']) { S.assume = a; const P = project(); out[a] = S.goals.map(g => g.name + ' ' + P.pct[g.id]).join(', ') + ' | short yrs ' + P.rows.filter(isShort).length + ' | extraFor worst ' + extraFor(S.goals.slice().sort((x, y) => P.pct[x.id] - P.pct[y.id])[0]); } return out; }));
  await b.close(); })();
