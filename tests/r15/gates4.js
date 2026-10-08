// the assumption-bound items of every calculator: which still gate (customer's own / required) and which are LifeMap standards (never gate, start from the standard)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.route('https://fonts.*/**',r=>r.abort());
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);
const out=await p.evaluate(()=>{const o={};CALCS.forEach(c=>{S=fresh();S.shell=true;S.app=false;S.tab='explore';
 const items=[];
 c.inputs.forEach(i=>{const s=calcA(c.id,i.k); if(s){const txt=((GATE_N[c.id]||{})[i.k]&&s.ty===2&&!s.a)?(GATE_N[c.id]||{})[i.k]:s.n; items.push({kind:'input',key:i.k,std:calcStdItem(s),text:missTxt(txt)});}});
 (CALC_X[c.id]||[]).forEach(k=>{ items.push({kind:ASM[k].opt?'asm-opt':'asm',key:k,std:!!asmStd(k),text:missTxt(ASM[k].n)});});
 o[c.id]=items;});
 return o;});
fs.writeFileSync('gates_static.json',JSON.stringify(out,null,1));
for(const [id,v] of Object.entries(out)) console.log(id, v.map(x=>(x.std?'STD ':'')+x.kind[0]+':'+x.key).join(' | '));
await b.close();})();
