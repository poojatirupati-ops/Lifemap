const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(500);
console.log(await p.evaluate(()=>{const e=document.querySelector('.cover .brand');const rg=document.createRange();rg.selectNodeContents(e.lastChild);const r=rg.getBoundingClientRect();return [r.x,r.y,r.width,r.height,getComputedStyle(e).color, document.querySelector('.cover-shade').getBoundingClientRect().height, getComputedStyle(document.querySelector('.cover-shade'),'::before').height]}));
await b.close()})();
