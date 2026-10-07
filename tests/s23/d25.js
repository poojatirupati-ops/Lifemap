const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{loadSample();S.tab='home';lastId=null;render();return [S.tab,S.app,document.querySelectorAll('.vthumb').length,document.querySelector('#main h2')&&document.querySelector('#main h2').textContent, planReady(), videosForYou().slice(0,3).map(v=>v.t)]}));
await b.close()})();
