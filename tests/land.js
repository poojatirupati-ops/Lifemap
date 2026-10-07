const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:844,height:390},hasTouch:true});
  const p = await ctx.newPage();
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  await p.evaluate(() => { loadSample(); lastId = null; S.view='journey'; render(); }); await p.waitForTimeout(200);
  const r = await p.evaluate(() => { const sv=document.querySelector('#r-glance svg[role=img]'); const m=document.getElementById('main'); const top=sv.getBoundingClientRect().top - m.getBoundingClientRect().top + m.scrollTop - 10; m.scrollTo({top, behavior:'instant'}); const b=sv.getBoundingClientRect(); return {w:b.width,h:b.height, mainH:m.clientHeight}; });
  console.log(JSON.stringify(r)); await p.waitForTimeout(150); await p.screenshot({path:'land-road.png'}); await b.close();
})();
