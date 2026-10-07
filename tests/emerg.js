const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ loadSample(); S.tab='explore'; lastId=null; render(); });
 await p.evaluate(()=>ACT.calc('emergency')); await p.waitForTimeout(300);
 await p.screenshot({path:'build/emergency-tip.png'}); console.log(await p.locator('.note').first().innerText(), 'ERRORS', errs); await b.close(); })();
