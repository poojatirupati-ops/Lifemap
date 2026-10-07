const { open } = require('./lib');
(async () => { const { browser, page } = await open();
console.log(await page.evaluate(()=>{loadSample();S.app=true;S.goals.forEach(g=>{if(g.k!=='retire'){g.amount=5000000;g.auto=false}});S.retireAge=58;S.about.age=50;const P=project();const f=findings(P);return [f.sT,S.goals.map(g=>g.name+':'+P.pct[g.id])]}));
await browser.close()})();
