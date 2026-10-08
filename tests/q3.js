const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');
console.log(JSON.stringify(await p.evaluate(()=>{const out=[];for(const c of CALCS){S=fresh();S.infl=null;S.adjInfl={};CALCS.forEach(x=>S.adjInfl[x.id]=true);S.asm={};applyAssume();const v={};c.inputs.forEach(i=>v[i.k]=i.v);let r;try{r=c.run(v)}catch(e){out.push([c.id,'ERR '+e.message]);continue}
 const txt=[r.line||'',r.val||'',...(r.rows||[]).map(x=>x.join(': '))];
 const line=r.line||'';const m=line.match(/.{0,40}(to see (this|it)).{0,10}/g);
 if(m) out.push([c.id,line.slice(0,400)]);}
 return out})));await b.close()})()
