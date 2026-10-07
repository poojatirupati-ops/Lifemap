const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
 console.log(await p.evaluate(()=>{ loadSample(); const P=project(); return S.goals.map(g=>g.name+' '+P.pct[g.id]+'% | '+goalLine(P,g)); }));
 // check: adding the stated extra actually reaches 100
 console.log(await p.evaluate(()=>{ const P=project(); return S.goals.filter(g=>P.goal[g.id]&&P.pct[g.id]<100).map(g=>{const e=extraTo100(g); return g.name+' extra '+e+' -> '+project({g:g.id,m:e,l:0}).pct[g.id]+'%';}); }));
 console.log('errors', errs); await b.close(); })();
