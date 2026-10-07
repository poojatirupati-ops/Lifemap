const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);
await p.evaluate(()=>{loadSample();S.tab='explore';S.xs=[{v:'VIDS'}];lastId=null;render();});
await p.addStyleTag({content:'.vthumb.vph b,.vthumb.vph span,.vthumb.vph small{color:transparent!important}'});
const t=(await p.$$('.vthumb'))[0];await t.screenshot({path:'dbg9.png'});await b.close()})();
