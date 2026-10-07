const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:1900},deviceScaleFactor:2});
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(400);
const phone=f=>p.locator('#phone').screenshot({path:'shots/'+f});
await p.evaluate(()=>{loadSample();S.fin.home='Rent';S.src.home='typed';S.app=true;S.shell=true;S.tab='me';S.me='fin';S.fsec=3;lastId=null;render();});
await p.click('[data-a=fchoice][data-p="mortYN|Yes"]');await p.fill('[data-it^="mort2|"][data-it$="|owed"]','185000');await p.fill('[data-it^="mort2|"][data-it$="|pay"]','950');await p.waitForTimeout(200);await phone('S24-liabilities.png');
await p.evaluate(()=>{loadSample();S.tab='plan';S.planSeg='main';S.planGo='wi';S.wi.m=725;S.wi.g=S.goals[1].id;lastId=null;render();});await p.waitForTimeout(500);
await p.evaluate(()=>{const m=document.getElementById('main');const e=document.getElementById('r-wi');m.scrollTop=e.offsetTop-10});await p.waitForTimeout(300);await phone('S24-whatif.png');
await b.close()})();
