const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');
await p.evaluate(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'compound'}];lastId=null;render()});
await p.fill('#co-r','6');await p.press('#co-r','Enter');await p.waitForTimeout(100);
console.log(JSON.stringify(await p.evaluate(()=>({a:calcA('compound','r'),t:S.calcT,asm:S.asm,h:document.getElementById('co-r').closest('.field').innerHTML.slice(0,400)}))));await b.close()})()
