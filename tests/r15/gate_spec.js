// builds the gate test spec: per calculator, rounds with assumption items omitted; app expectations
const {chromium}=require('playwright');const fs=require('fs');
const MAP=JSON.parse(fs.readFileSync('/home/user/lifegoals-prototype/tools/ui_calc_map.json'));
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.route('https://fonts.*/**',r=>r.abort());
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);
const res=await p.evaluate((MAP)=>{
 const NOI='Choose your inflation rate to see this'; const out=[];
 CALCS.forEach(c=>{
  const items=[]; // assumption-bound items: {key, kind:'in'|'x'}
  c.inputs.forEach(i=>{ if(calcA(c.id,i.k)) items.push({key:i.k,kind:'in'}); });
  (CALC_X[c.id]||[]).forEach(k=>{ if(!ASM[k].opt) items.push({key:k,kind:'x'}); });
  const rounds=[]; const N=items.length;
  const mk=(omit,infl)=>{ rounds.push({omit,infl}); };
  mk(items.map(x=>x.key),null); for(let k=0;k<N;k++) mk([items[k].key],0.02); mk([],null); mk([],0.02);
  const exp=rounds.map(r=>{
    S=fresh();S.shell=true;S.app=false;S.tab='explore';S.xs=[{v:'CALC',p:c.id}];S.infl=r.infl;S.inflOther=false;S.asm={};S.calcT={};S.calcT[c.id]={};
    const vals={},given={};
    c.inputs.concat(c.wi||[]).forEach(i=>{ const s=calcA(c.id,i.k); if(s&&r.omit.includes(i.k)) return; vals[i.k]=i.v; S.calcT[c.id][i.k]=true; given[i.k]=i.v; });
    S.calcV[c.id]=vals; const asmg={};
    (CALC_X[c.id]||[]).forEach(k=>{ const d=ASM[k]; if(r.omit.includes(k)) return; let v=d.sug?d.sug():null; if(v==null) v=d.t==='pct'?0.03:(d.min!=null?d.min:1); S.asm[k]=v; asmg[k]=v; });
    // assumption-bound inputs that are given: also set the asm (so asmMine) in case the run reads it
    applyAssume();
    const miss=calcMissing(c); let gate=miss.length?missTxt(miss[0])+' to see this':'', infl=false, err=null;
    if(!miss.length){ try{ const rr=c.run(calcVals(c)); infl=JSON.stringify([rr.val,rr.rows,rr.line,rr.num]).includes(NOI); }catch(e){err=e.message;} }
    return {gate,infl,err,given,asmg,n:miss.length};
  });
  out.push({id:c.id,items,rounds,exp});
 });
 return out;},MAP);
fs.writeFileSync('gate_spec.json',JSON.stringify(res));
let n=0;res.forEach(r=>n+=r.rounds.length);console.log('calculators',res.length,'cases',n);
await b.close();})();
