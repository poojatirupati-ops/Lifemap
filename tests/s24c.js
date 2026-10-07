// §24.3: saving files through the downloads capability (mocked), PDF -> HTML -> print fallbacks, meeting details
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),cp=require('child_process');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
const LIB='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/s23/lib/';
const JSPDF=LIB+'x-jspdf/package/dist/jspdf.umd.min.js',H2C=LIB+'x-html2canvas/package/dist/html2canvas.min.js';
const OUT='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/s23/out/';fs.mkdirSync(OUT,{recursive:true});
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
const MOCK=`window.__saves=[];window.__files={};window.claude={use:async(n)=>{if(n!=='downloads')return null;return {save:async(o)=>{const b=o.data;const r=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(b)});window.__saves.push({filename:o.filename,type:b.type,size:b.size});window.__files[o.filename]=r.split(',')[1];}}}};`;
async function mk(b,{mock,libs}){const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load resource|cdnjs/.test(m.text())&&errs.push(m.text()));
 if(mock)await p.addInitScript(MOCK);
 await p.addInitScript(()=>{window.__print=0;window.print=()=>{window.__print++}});
 await p.route('https://cdnjs.cloudflare.com/**',r=>{const u=r.request().url();if(!libs)return r.abort();r.fulfill({status:200,contentType:'application/javascript',body:fs.readFileSync(/jspdf/.test(u)?JSPDF:H2C)})});
 await p.goto(HTML);await p.waitForTimeout(400);await p.evaluate(()=>{loadSample();});return {p,errs,ctx};}
(async()=>{const b=await chromium.launch();
// 1. PDF path
{const {p,errs,ctx}=await mk(b,{mock:true,libs:true});await p.evaluate(()=>{S.tab='plan';S.planSeg='main';render();openReport();});
 const lbl=await p.textContent('[data-r=print]');chk('Report bar button still reads "Print / save as PDF"',/Print \/ save as PDF/.test(lbl),lbl);
 await p.click('[data-r=print]');await p.waitForFunction(()=>window.__saves.length>0,null,{timeout:120000});
 const s=await p.evaluate(()=>({saves:window.__saves,msg:document.getElementById('rep-msg').textContent,print:window.__print,scripts:[...document.querySelectorAll('script[data-lib]')].map(x=>x.dataset.lib)}));
 chk('PDF: downloads.save called once with filename LifeMap-plan.pdf',s.saves.length===1&&s.saves[0].filename==='LifeMap-plan.pdf',s.saves);
 chk('PDF: libraries were loaded lazily from cdnjs on click',s.scripts.length===2&&s.scripts.every(x=>/cdnjs\.cloudflare\.com/.test(x)),s.scripts);
 chk('PDF: the blob is non-empty (>20 KB) and the success message names the file',s.saves[0].size>20000&&/Saved LifeMap-plan\.pdf \(\d+ pages?\)/.test(s.msg),[s.saves[0].size,s.msg]);
 chk('PDF: window.print not used when downloads exists',s.print===0,s.print);
 const buf=Buffer.from(await p.evaluate(()=>window.__files['LifeMap-plan.pdf']),'base64');fs.writeFileSync(OUT+'LifeMap-plan.pdf',buf);
 const info=cp.execSync('pdfinfo '+OUT+'LifeMap-plan.pdf').toString();const pages=+/Pages:\s+(\d+)/.exec(info)[1];const size=/Page size:\s+(.*)/.exec(info)[1];
 chk('PDF: valid A4, several pages ('+pages+')',/^%PDF/.test(buf.toString('latin1',0,5))&&pages>=3&&/595|A4/.test(size),[pages,size]);
 const txt=cp.execSync('pdftotext -layout '+OUT+'LifeMap-plan.pdf -').toString();
 chk('PDF: every page has the header, footer and "Page n of N"',(txt.match(/Page \d+ of \d+/g)||[]).length===pages&&(txt.match(/LifeMap/g)||[]).length>=pages,txt.slice(0,200));
 cp.execSync('cd '+OUT+' && rm -f pg-*.png && pdftoppm -r 40 -png LifeMap-plan.pdf pg');
 // cut-off check: no page may have content touching the bottom margin band (18 mm) other than the footer
 const sharp=cp.execSync("python3 - <<'PY'\nfrom PIL import Image\nimport glob\nr=[]\nfor f in sorted(glob.glob('"+OUT+"pg-*.png')):\n  im=Image.open(f).convert('L');w,h=im.size;top=int(h*0.0);y0=int(h*(297-17)/297);y1=int(h*(297-15)/297)\n  band=im.crop((0,y0,w,y1));r.append(min(band.getdata()))\nprint(r)\nPY").toString();
 console.log('bottom-band darkest pixel per page',sharp.trim());
 chk('PDF: no console errors',errs.length===0,errs);await ctx.close();}
// 2. libs fail -> html
{const {p,errs,ctx}=await mk(b,{mock:true,libs:false});await p.evaluate(()=>{S.tab='plan';S.planSeg='main';render();openReport();});
 await p.click('[data-r=print]');await p.waitForFunction(()=>window.__saves.length>0,null,{timeout:120000});
 const s=await p.evaluate(()=>({saves:window.__saves,msg:document.getElementById('rep-msg').textContent,html:atob(window.__files['LifeMap-plan.html']||'')}));
 chk('Fallback: library blocked -> saved as LifeMap-plan.html',s.saves.length===1&&s.saves[0].filename==='LifeMap-plan.html'&&/text\/html/.test(s.saves[0].type),s.saves);
 chk('Fallback: the .html is self-contained (doctype, styles, the report, no external script)',/^<!doctype html>/i.test(s.html)&&/<style>/.test(s.html)&&/1\. Summary/.test(s.html)&&!/<script/i.test(s.html),s.html.slice(0,100));
 chk('Fallback: message says what happened',/saved your plan as LifeMap-plan\.html/.test(s.msg),s.msg);
 fs.writeFileSync(OUT+'LifeMap-plan.html',s.html);await ctx.close();}
// 3. no downloads -> print
{const {p,errs,ctx}=await mk(b,{mock:false,libs:true});await p.evaluate(()=>{S.tab='plan';S.planSeg='main';render();openReport();});
 await p.click('[data-r=print]');await p.waitForTimeout(500);
 const s=await p.evaluate(()=>({print:window.__print,msg:document.getElementById('rep-msg').textContent,libs:document.querySelectorAll('script[data-lib]').length}));
 chk('No downloads capability -> window.print() is used, nothing is loaded',s.print===1&&s.libs===0,s);await ctx.close();}
// 3b. downloads present but save always fails and html too
{const {p,ctx}=await mk(b,{mock:false,libs:true});await p.evaluate(()=>{window.claude={use:async()=>({save:async()=>{throw new Error('blocked')}})};S.tab='plan';S.planSeg='main';render();openReport();});
 await p.click('[data-r=print]');await p.waitForFunction(()=>/couldn't save/.test(document.getElementById('rep-msg').textContent),null,{timeout:120000});
 chk('Both saves fail -> a clear failure message, no crash',true,0);await ctx.close();}
// 4. meeting details
{const {p,ctx}=await mk(b,{mock:true,libs:true});await p.evaluate(()=>{S.tab='exp';S.exp='c4';S.book.done=true;S.book.slot=SLOTS[1];render();});
 const l=await p.textContent('[data-a=ics]');chk('Booked screen button reads "Save meeting details (.txt)" when downloads exists',/Save meeting details \(\.txt\)/.test(l),l);
 await p.click('[data-a=ics]');await p.waitForFunction(()=>window.__saves.length>0);
 const s=await p.evaluate(()=>({saves:window.__saves,txt:atob(window.__files['LifeMap-meeting.txt']||'')}));
 chk('Meeting: saved as LifeMap-meeting.txt (not .ics) with the details',s.saves[0].filename==='LifeMap-meeting.txt'&&/Your LifeMap adviser meeting/.test(s.txt)&&/With: /.test(s.txt),s);await ctx.close();}
{const {p,ctx}=await mk(b,{mock:false,libs:true});await p.evaluate(()=>{S.tab='exp';S.exp='c4';S.book.done=true;S.book.slot=SLOTS[1];render();});
 const l=await p.textContent('[data-a=ics]');const [d]=await Promise.all([p.waitForEvent('download'),p.click('[data-a=ics]')]);
 chk('Opened locally: the .ics download still works',/Add to my calendar/.test(l)&&d.suggestedFilename()==='lifemap-meeting.ics',[l,d.suggestedFilename()]);await ctx.close();}
console.log('FAILS',fails,'of',n);await b.close();})();
