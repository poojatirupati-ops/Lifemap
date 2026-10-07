const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const f=process.argv[2], out=process.argv[3]||'shots';
(async()=>{const b=await chromium.launch();
for(const w of [390,1280]){const p=await b.newPage({viewport:{width:w,height:w>600?1500:1900}});
await p.goto('file://'+f);await p.waitForTimeout(400);
await p.evaluate(()=>{loadSample();S.tab='explore';S.xs=[];render();});await p.waitForTimeout(600);
await p.screenshot({path:`${out}/exploreT-${w}.png`});
await p.evaluate(()=>{S.tab='exp';S.exp='home';render();});await p.waitForTimeout(400);
await p.screenshot({path:`${out}/exp00T-${w}.png`});}
await b.close();})();
