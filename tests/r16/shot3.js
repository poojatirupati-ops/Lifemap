const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const tag=process.argv[2]||'before';
(async()=>{const b=await chromium.launch();
for (const w of [360,390,1280]){
 const p=await b.newPage({viewport:{width:w,height:900}});
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(250);
 await p.evaluate(()=>{loadSample(); S.fin.home='Own with mortgage'; ACT.fix(String(FSEC.findIndex(s=>s.id==='liab'))); });
 await p.waitForTimeout(300);
 const inp=await p.$('#f-mortRate'); if(!inp){console.log('no field',w); await p.close(); continue;}
 for (const val of ['12.345','100']){ await inp.fill(val); await p.waitForTimeout(100); const box=await p.$('#f-mortRate'); const par=await box.evaluateHandle(e=>e.closest('.field')); await par.asElement().screenshot({path:`shots/${tag}-mortrate-${val.replace('.','_')}-${w}.png`}); }
 // geometry: does the % glyph box overlap the text?
 const g=await p.evaluate(()=>{const i=document.querySelector('#f-mortRate'),c=i.parentElement.querySelector('.cur');const ir=i.getBoundingClientRect(),cr=c.getBoundingClientRect();const cv=document.createElement('canvas').getContext('2d');const cs=getComputedStyle(i);cv.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;const tw=cv.measureText(i.value).width;const pl=parseFloat(cs.paddingLeft),pr=parseFloat(cs.paddingRight);return {textStart:Math.round(ir.left+pl),textEnd:Math.round(ir.left+pl+tw),sufLeft:Math.round(cr.left),sufRight:Math.round(cr.right),pr, overlap:(ir.left+pl+tw)>cr.left && ir.left+pl<cr.right}});
 console.log(tag,w,JSON.stringify(g));
 await p.close();}
await b.close();})();
