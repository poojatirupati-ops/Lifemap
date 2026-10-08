const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();
for (const w of [360,390,1280]){
 const p=await b.newPage({viewport:{width:w,height:900}});
 await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);
 await p.evaluate(()=>{loadSample(); S.asm.cash=0.12345; S.asm.investShare=1; S.asm.ownShare=1; S.asm.wage=0.06; S.asm.noAnswer=5000; S.asmOpen='prices'; ACT.asmopen();});
 await p.waitForTimeout(300);
 await p.evaluate(()=>{document.querySelectorAll('details.asmg').forEach(d=>d.open=true)});
 const info=await p.evaluate(()=>[...document.querySelectorAll('.nbox')].map(n=>{const i=n.querySelector('.nb'), u=n.querySelectorAll('.nbu'); const r=i.getBoundingClientRect(); const o=[...u].map(x=>x.getBoundingClientRect()); const tw=(()=>{const c=document.createElement('canvas').getContext('2d'); const cs=getComputedStyle(i); c.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily; return c.measureText(i.value).width})(); return {v:i.value, inputW:Math.round(r.width), textW:Math.round(tw), clip:i.scrollWidth>i.clientWidth, overlap:o.some(x=>x.left<r.right-0.5 && x.right>r.left+0.5 && Math.abs(x.left-r.right)<0)}}));
 console.log(w, JSON.stringify(info.filter(x=>x.clip||x.textW>x.inputW).slice(0,6)), info.length);
 const el=await p.$('.asmf[data-k=cash]'); if(el){ await el.scrollIntoViewIfNeeded(); await el.screenshot({path:'nb_'+w+'.png'}); }
 await p.close();}
await b.close();})();
