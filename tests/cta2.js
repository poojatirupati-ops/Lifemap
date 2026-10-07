const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(400);
 await p.screenshot({path:'build/g-1.png'});
 await p.evaluate(()=>{ loadSample(); S.app=false; S.scr='D10'; lastId=null; render(); }); await p.waitForTimeout(300); await p.screenshot({path:'build/g-2.png'});
 await p.evaluate(()=>{ loadSample(); S.tab='plan'; lastId=null; render(); });
 await p.evaluate(()=>{ const e=document.querySelector('.ends'); if(e) e.scrollIntoView({block:'center'}); }); await p.waitForTimeout(300); await p.screenshot({path:'build/g-3.png'});
 await b.close(); })();
