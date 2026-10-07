const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
 console.log(await p.evaluate(()=>{ loadSample(); const t=performance.now(); for(let i=0;i<100;i++) project(); const P=project(); return {ms:(performance.now()-t)/100, goals:S.goals.map(g=>[g.name,P.pct[g.id],P.goal[g.id]&&P.goal[g.id].needM,P.goal[g.id]&&P.goal[g.id].nowM,P.goal[g.id]&&P.goal[g.id].avgM])}; }));
 await b.close(); })();
