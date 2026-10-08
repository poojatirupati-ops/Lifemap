const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(400);
const expr=process.argv[2]; if(expr){ try{ console.log(JSON.stringify(await p.evaluate(expr)));}catch(e){console.log('EVAL ERR',e.message)} }
console.log('page errors:',JSON.stringify(errs));await b.close();})();
