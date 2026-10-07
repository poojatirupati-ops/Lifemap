// §23: Emergency fund naming, cover photo, Budget 2027 note
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
const ALLOW=[/\bCushion\b/,/Building a safety net for emergencies/,/No safety net/,/Strong safety net/,/Jumping in before your safety net is in place/];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load/.test(m.text())&&errs.push(m.text()));
await p.goto(HTML);await p.waitForTimeout(300);const ev=(f,a)=>p.evaluate(f,a);
// every JUMP screen: visible text has no "safety net" except the allow-list
const names=await ev(()=>JUMPS.flatMap(g=>g[1].map(s=>s[0])));
const found=[];
for(let i=0;i<names.length;i++){const t=await ev(([i])=>{try{let k=0;for(const g of JUMPS)for(const s of g[1]){if(k++===i){S=fresh();s[2]();lastId=null;render();}}}catch(e){return 'ERR'+e}return document.body.innerText+' '+[...document.querySelectorAll('[aria-label],[placeholder],[title]')].map(e=>(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('placeholder')||'')+' '+(e.getAttribute('title')||'')).join(' ')},[i]);
 for(const m of t.matchAll(/.{0,40}(safety[- ]net|cushion|rainy).{0,30}/gi)) if(!ALLOW.some(a=>a.test(m[0]))) found.push(names[i]+': '+m[0]);}
chk('No visible "safety net" / "cushion" on '+names.length+' screens except the Discover wording',found.length===0,found.slice(0,8));
// sheets and special states
const st=await ev(()=>{loadSample();S.asm={};S.asm.planEnd=90;S.retireSet=true;S.infl=0.02;const o={};S.sheet='assume';render();o.assume=document.body.innerText;S.sheet=null;S.tab='plan';render();o.plan=document.body.innerText;
 o.labels=[ASM.safetyMonths.l,ASM.safetyMonths.n,ASM_GRP.map(x=>x[1]).join('|')];o.gate=chooseTxt({n:ASM.safetyMonths.n});return o});
chk('Emergency fund labels',st.labels[0]==='Emergency fund: months of essential spending'&&st.labels[1]==='emergency fund months'&&/Emergency fund & debt/.test(st.labels[2]),st.labels);
chk('Gate reads "Choose your emergency fund months to see this"',st.gate==='Choose your emergency fund months to see this',st.gate);
chk('"What your plan assumes" row "Emergency fund"',/Emergency fund/.test(st.assume)&&!/Safety net/.test(st.assume),0);
const gl=await ev(()=>{loadSample();S.asm={};delete S.asm.safetyMonths;S.infl=0.02;S.retireSet=true;S.asm.planEnd=90;S.tab='plan';render();const g=document.getElementById('gate-res');return g?g.textContent:'';});
chk('A real gate for the missing emergency fund months is worded as specified (or not the first gate)',!/safety/i.test(gl),gl);
// budget note
const bn=await ev(()=>{loadSample();S.sheet='assume';render();const a=(document.getElementById('b27-sheet')||{}).textContent;S.sheet=null;S.tab='plan';render();const r=(document.getElementById('b27-res')||{}).textContent;return {a,r,txt:document.body.innerText}});
const NOTE="Budget 2027 changes (announced 6 Oct 2026) aren't included yet. We'll update LifeMap once they're final.";
chk('Budget 2027 note in What your plan assumes',bn.a===NOTE,bn.a);chk('Budget 2027 note in the results footnote',bn.r===NOTE,bn.r);
chk('No Budget 2027 figures named (no "€46,500", "€2,125")',!/46,500|2,125|30,300/.test(bn.txt),0);
// cover
await ev(()=>{S=fresh();S.scr='D0';lastId=null;render()});
const cv=await ev(()=>({v:getComputedStyle(document.documentElement).getPropertyValue('--cover-photo').slice(0,30),pos:getComputedStyle(document.querySelector('.cover-photo')).backgroundPosition,note:document.querySelector('#curnote,.cur')?'':''}));
chk('Cover photo slot holds a JPEG data URI at 56% 40%',/data:image\/jpeg;base64/.test(cv.v)&&/56%/.test(cv.pos)&&/40%/.test(cv.pos),cv);

// cover contrast >= 4.5:1 for each text element at four sizes (text hidden, brightest pixel behind each text box vs white)
for(const [w,h] of [[390,844],[360,640],[844,390],[1280,800]]){const q=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
 await q.goto(HTML);await q.waitForTimeout(600);
 await q.addStyleTag({content:'.cover h2,.cover .cover-line,.cover .cover-under,.cover .cover-small .link,.cover .brand{color:transparent!important;text-shadow:none!important}.cover .brand .mark{visibility:hidden}'});
 const items=await q.evaluate(()=>[['brand','.cover .brand'],['h2','.cover h2'],['line','.cover-line'],['under','.cover-under'],['why','.cover-small .link']].map(([n,s])=>{const e=document.querySelector(s);let r=e.getBoundingClientRect();if(n==='brand'){const rg=document.createRange();rg.selectNodeContents(e.lastChild);r=rg.getBoundingClientRect();}return {n,x:r.x,y:r.y,w:r.width,h:r.height}}));
 const buf=await q.screenshot();
 const res=await q.evaluate(async([b64,items])=>{const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return items.map(t=>{const d=g.getImageData(Math.round(t.x*2),Math.round(t.y*2),Math.max(1,Math.round(t.w*2)),Math.max(1,Math.round(t.h*2))).data;let mx=0;for(let k=0;k<d.length;k+=4){const l=.2126*L(d[k])+.7152*L(d[k+1])+.0722*L(d[k+2]);if(l>mx)mx=l}return [t.n,+(1.05/(mx+.05)).toFixed(2)]})},[buf.toString('base64'),items]);
 chk('Cover contrast >= 4.5:1 at '+w+'x'+h+' '+JSON.stringify(res),res.every(r=>r[1]>=4.5),res);await q.close();}
console.log('FAILS',fails,'of',n,'ERRORS',errs.length,errs);await b.close();})();
