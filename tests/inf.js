const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
 for (const id of ['lastmoney','drawdown']) { await p.evaluate(()=>{ loadSample(); S.tab='explore'; lastId=null; render(); }); await p.evaluate(i=>ACT.calc(i), id); await p.waitForTimeout(300); await p.screenshot({path:'build/inf-'+id+'.png'}); }
 await b.close(); })();
