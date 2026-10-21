const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await(await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/lifemap/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(500);
const d=await p.evaluate(()=>{window.__TODAY='2026-10-21';loadSample();S.asm=S.asm||{};S.asm.startYear=2026;S.taxYearOverride=2026;RULES_DIRTY=true;
 Object.assign(S.fin,{invest:60000,invCost:48000,invYears:3,otherAssets:25000,othCost:15000,altInv:8000,altCost:6000});applyAssume();const P=project();
 const f=finNums();
 return {rows:P.rows.map(r=>({yr:r.yr,a:r.a,retired:r.retired,gross:r.gross,tax:r.tax,inflow:r.inflow,living:r.living,fixed:r.fixed,goalPaid:r.goalPaid,goalGap:r.goalGap,short:r.short,saved:r.saved,spent:r.spent,liquid:r.liquid,pen:r.pen,exitDeemed:r.exitDeemed,taxOnSales:r.taxOnSales,polIn:r.polIn,downIn:r.downIn,due:r.due,cf:r.cf})),
  taxEvents:P.taxEvents, goals:S.goals.map(g=>({name:g.name,age:g.age,amount:g.amount,kind:g.kind,pct:P.pct[g.id]})),
  fin:{age:f.age,R:f.R,income:f.income,costsM:f.costsM,cash:f.cash,invest:f.invest,otherAssets:f.otherAssets,altInv:f.altInv,pension:f.pension,mortBal:f.mortBal,partner:f.partner},
  reg:taxRegister().map(r=>({path:r.path,cat:r.cat,name:r.name,v26:r.v26,status26:r.status26,eff:r.eff,src:r.src,note:r.note})),
  asm:assumeRows().map(r=>[r[0],String(r[1]),r[2]||'',r[3]||'']),
  std:Object.entries(SETTINGS.s).map(([k,x])=>[x.grp,x.n,typeof x.v==='object'?JSON.stringify(x.v):x.v,x.by||'',x.src||'',x.asat||'']),
  cgt:{rate:RI.sav.cgt,before:RI.sav.cgtBefore,ex:RI.sav.cgtExempt,exit:RI.sav.exit,dirt:RI.sav.dirt,deemed:RI.sav.deemed}};});
fs.writeFileSync(process.argv[2],JSON.stringify(d));console.log(d.rows.length,'rows',d.reg.length,'reg',d.asm.length,'asm',d.std.length,'std','errs',errs);await b.close();})();
