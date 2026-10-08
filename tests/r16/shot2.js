const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const SCR=[['calc-goalplanner',()=>{loadSample();S.tab='explore';S.xs=[{v:'CALC',p:'goalplanner'}];render();}],['calc-retirement',()=>{loadSample();S.tab='explore';S.xs=[{v:'CALC',p:'retirement'}];render();}],['calc-fees',()=>{loadSample();S.tab='explore';S.xs=[{v:'CALC',p:'fees'}];render();}],
 ['me-asm',()=>{loadSample();ACT.asmopen();document.querySelectorAll('details.asmg').forEach(d=>d.open=true)}],['infl-other',()=>{loadSample();S.inflOther=true;S.inflEdit=true;ACT.asmopen();document.querySelectorAll('details.asmg').forEach(d=>d.open=true)}],
 ['results-wi',()=>{loadSample();S.tab='plan';S.planSeg='results';render();}]];
(async()=>{const b=await chromium.launch();
for (const w of [360,390,1280]){
 for(const [name,fn] of SCR){
 const p=await b.newPage({viewport:{width:w,height:900}});
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(250);
 await p.evaluate(fn); await p.waitForTimeout(250);
 // type long values into every box
 const boxes=await p.$$('.nbox .nb');
 for(const bx of boxes){ try{ await bx.scrollIntoViewIfNeeded({timeout:500}); await bx.click({timeout:500}); await p.keyboard.type('12.345',{delay:5}); }catch(e){} }
 const res=await p.evaluate(()=>[...document.querySelectorAll('.nbox')].map(n=>{const i=n.querySelector('.nb'),r=i.getBoundingClientRect();const c=document.createElement('canvas').getContext('2d');const cs=getComputedStyle(i);c.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;const tw=c.measureText(i.value).width;const us=[...n.querySelectorAll('.nbu')].map(x=>x.getBoundingClientRect());
   const nbr=n.getBoundingClientRect(); const par=n.parentElement.getBoundingClientRect();
   return {v:i.value,tw:Math.round(tw),iw:Math.round(r.width),sc:i.scrollWidth,cw:i.clientWidth,overlapSuffix:us.some(u=>u.left<r.right-1&&u.right>r.left+1&&!(u.left>=r.right-1)&&!(u.right<=r.left+1)), spill:nbr.right>par.right+1||nbr.left<par.left-1}}));
 const bad=res.filter(x=>x.tw>x.iw+1||x.sc>x.cw||x.overlapSuffix||x.spill);
 console.log(w,name,res.length,'boxes; problems:',JSON.stringify(bad.slice(0,4)));
 await p.close();}}
await b.close();})();
