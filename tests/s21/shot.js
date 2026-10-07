const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const f=process.argv[2], out=process.argv[3]||'shots';
(async()=>{const b=await chromium.launch();const errs=[];
for(const w of [390,1280]){const p=await b.newPage({viewport:{width:w,height:w>600?900:844}});p.on('console',m=>m.type()==='error'&&errs.push(m.text()));p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+f);await p.waitForTimeout(500);
const run=async(name,fn)=>{await p.evaluate(fn);await p.waitForTimeout(500);await p.screenshot({path:`${out}/${name}-${w}.png`,fullPage:true});};
await run('explore',()=>{loadSample();S.tab='explore';S.xs=[];render();});
await run('exp00',()=>{loadSample();S.tab='exp';S.exp='home';render();});
await run('c1',()=>{loadSample();S.tab='exp';S.exp='c1';render();});
await run('c0',()=>{loadSample();S.tab='exp';S.exp='c0';render();});
}
console.log('errors',errs);await b.close();})();
