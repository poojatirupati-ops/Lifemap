const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:390,height:844},hasTouch:true});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(400);
  const shot = async n => { await p.waitForTimeout(350); await p.screenshot({path:'peek/'+n+'.png'}); };
  await shot('01-welcome');
  const tryClick = async (sel) => { try { await p.locator(sel).first().click({timeout:1500}); return true; } catch(e){ return false; } };
  await tryClick('.wbtn'); await shot('02-why');
  await tryClick('[data-a="dstart"]'); await shot('03-q1');
  for (let i=0;i<6;i++){ await tryClick('.opt >> nth=1'); await p.waitForTimeout(500); }
  await shot('04-after-questions');
  const txt = await p.evaluate(()=>document.getElementById('screen').innerText.slice(0,300));
  console.log(txt.replace(/\n/g,' | '));
  console.log('errors', errs);
  await b.close();
})();
