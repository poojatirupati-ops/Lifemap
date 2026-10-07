const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(400);
const r=await p.evaluate(()=>{const out={rules:[],settings:[]};
 const walk=(o,path)=>{ if(o&&typeof o==='object'&&'verify' in o&&'src' in o){ out.rules.push({k:path,v:o.v,src:o.src,eff:o.eff,verify:o.verify,by:o.by}); return;} if(o&&typeof o==='object'&&!Array.isArray(o)) for(const k in o) walk(o[k],path?path+'.'+k:k); };
 try{ walk(RULES_IE_2026,'') }catch(e){ out.err=String(e) }
 try{ for(const k in SETTINGS.s){ const x=SETTINGS.s[k]; out.settings.push({k,n:x.n,v:x.v,u:x.u,src:x.src,asat:x.asat,verify:x.verify,by:x.by}); } }catch(e){ out.err2=String(e)}
 return out});
require('fs').writeFileSync('reg.json',JSON.stringify(r,null,1));console.log(Object.keys(r),r.rules.length,r.settings.length,r.err,r.err2,r.rules.filter(x=>x.verify).length,r.settings.filter(x=>x.verify).length);await b.close()})();
