const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();
for(const w of [390,1280]){const p=await b.newPage({viewport:{width:w,height:w>600?1500:1900},deviceScaleFactor:w>600?1:2});
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(400);
const phone=f=>p.locator('#phone').screenshot({path:'shots/'+f+'-'+w+'.png'});
await p.evaluate(()=>{loadSample();S.tab='explore';S.xs=[];lastId=null;render();});await p.waitForTimeout(600);await phone('S25-explore');
await p.evaluate(()=>{S.xs=[{v:'VIDS'}];lastId=null;render();});await p.waitForTimeout(400);await phone('S25-library');
await p.evaluate(()=>{S.xs=[{v:'VID',p:'v8'}];lastId=null;render();});await p.waitForTimeout(1500);await phone('S25-player');
await p.evaluate(()=>{S=fresh();S.shell=true;S.app=false;S.tab='home';lastId=null;render();});await p.waitForTimeout(500);await phone('S25-home');
await p.close();}
await b.close()})();
