const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.route('https://fonts.*/**',r=>r.abort());
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);
const out=await p.evaluate(()=>{const o={};CALCS.forEach(c=>{
 const rows=[];
 const setup=(omit)=>{S=fresh();S.shell=true;S.app=false;S.tab='explore';S.xs=[{v:'CALC',p:c.id}];S.infl=0.02;S.inflOther=false;
   const vals={};c.inputs.concat(c.wi||[]).forEach(i=>{ if(!omit.includes(i.k)) vals[i.k]=i.v;});
   S.calcV[c.id]=vals;S.calcT={};S.calcT[c.id]={};Object.keys(vals).forEach(k=>S.calcT[c.id][k]=true);
   // assumptions chosen (suggested) so only the omitted item is missing
   S.asm={};(CALC_X[c.id]||[]).concat(c.inputs.map(i=>{const s=calcA(c.id,i.k);return s&&s.a?s.a:null;}).filter(Boolean)).forEach(k=>{const d=ASM[k];if(d&&d.sug){S.asm[k]=d.sug();}else if(d){S.asm[k]=d.t==='pct'?0.03:(d.min!=null?d.min:1);}});
   // personal assumption-bound inputs (calcA with n) :
   applyAssume();};
 c.inputs.forEach(i=>{ setup([i.k]); let miss; try{miss=calcMissing(c);}catch(e){miss=['ERR '+e.message];} rows.push({k:i.k,l:i.l,miss:miss.map(m=>missTxt(m)),first:miss.length?missTxt(miss[0])+' to see this':''}); });
 o[c.id]=rows;});return o;});
fs.writeFileSync('gates_omit.json',JSON.stringify(out,null,1));
for(const [id,v] of Object.entries(out)) console.log(id, v.map(x=>x.k+'→'+x.first).join(' | '));
await b.close();})();
