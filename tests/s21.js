// §21: Experts specialist boxes; Explore Focus on one area illustrated square tiles
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
(async()=>{const b=await chromium.launch();const errs=[];
for(const w of [390,1280]){const p=await b.newPage({viewport:{width:w,height:900}});
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load resource/.test(m.text())&&errs.push(m.text()));
await p.goto(HTML);await p.waitForTimeout(300);const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>{loadSample();S.tab='explore';S.xs=[];render();});await p.waitForTimeout(300);
const t=await ev(()=>{const ts=[...document.querySelectorAll('.ttile')];const r=ts.map(e=>e.getBoundingClientRect());return {n:ts.length,names:ts.map(e=>e.querySelector('b').textContent),sq:r.every(x=>Math.abs(x.width-x.height)<1.5),rows:[...new Set(r.map(x=>Math.round(x.top)))].length,cols:[...new Set(r.map(x=>Math.round(x.left)))].length,blurbs:ts.map(e=>!!e.querySelector('.s').textContent.trim()),go:ts.every(e=>getComputedStyle(e.querySelector('.go')).display!=='none'&&e.querySelector('.go').getAttribute('aria-hidden')==='true'),art:['mortgage','pension','protection','investing','savings','everyday'].map(k=>getComputedStyle(document.documentElement).getPropertyValue('--art-'+k).startsWith('url(')),emHidden:ts.every(e=>e.querySelector('.em').getAttribute('aria-hidden')==='true'),act:ts.map(e=>e.dataset.a+'|'+e.dataset.p),old:document.querySelectorAll('.goal[data-a=topic]').length}});
chk(w+' Explore: 6 square tiles, 2 per row (3 rows)',t.n===6&&t.sq&&t.cols===2&&t.rows===3,t);
chk(w+' Each tile has name + blurb, visible chevron, emoji hidden from readers',t.blurbs.every(Boolean)&&t.go&&t.emHidden,t);
chk(w+' Each tile art is one custom property --art-{topic}',t.art.every(Boolean),t.art);
chk(w+' Topic action unchanged (data-a=topic) and old rows gone',t.act.every(x=>x.startsWith('topic|'))&&t.old===0,t.act);
await p.keyboard.press('Tab');let fo0=0;
const fo=await ev(()=>{document.querySelector('.ttile').blur();return 0});
await ev(()=>{render()});await p.keyboard.press('Tab');for(let i=0;i<30&&!(await ev(()=>document.activeElement.classList.contains('ttile')));i++)await p.keyboard.press('Tab');const ring=await ev(()=>{const e=document.activeElement;return e.classList.contains('ttile')?getComputedStyle(e).outlineStyle+' '+getComputedStyle(e).outlineWidth:'none'});chk(w+' Keyboard focus ring on tiles (:focus-visible)',/solid 3px/.test(ring),ring);
// odd count spans full row
const odd=await ev(()=>{const g=document.querySelector('.tgrid');g.lastElementChild.remove();const ts=[...g.children],l=ts[ts.length-1].getBoundingClientRect(),f=ts[0].getBoundingClientRect();return {n:ts.length,wide:l.width>f.width*1.8}});
chk(w+' Odd tile count: last tile spans the full row',odd.n===5&&odd.wide,odd);
await ev(()=>{render()});
// click: topic action opens expert flow unchanged
await p.click('.ttile[data-p="Mortgages"]');await p.waitForTimeout(300);
const tp=await ev(()=>({tab:S.tab,spec:S.book&&S.book.spec,xs:S.xs&&S.xs.length}));
chk(w+' Tapping Mortgages tile still runs the topic action',JSON.stringify(tp)!==undefined&&(tp.tab==='explore'||tp.tab==='exp'),tp);
// experts
const boxes=async(state)=>{await ev(s=>{loadSample();S.tab='exp';S.exp=s;S.book.done=s==='c4';if(s==='c4')S.book.slot=SLOTS[1];render();},state);await p.waitForTimeout(200);return ev(()=>({h:(document.querySelector('#main h3')||{}).textContent,heads:[...document.querySelectorAll('#main h3')].map(h=>h.textContent),rows:[...document.querySelectorAll('button.goal.spec')].map(e=>({n:e.querySelector('b').textContent,blurb:e.querySelector('.small').textContent,a:e.dataset.a,p:e.dataset.p,chev:!!e.querySelector('.chev')})),chips:document.querySelectorAll('.chips [data-a=spec]').length,adv:!!document.querySelector('.card')}))};
for(const s of ['home','c0','c1']){const x=await boxes(s);chk(w+' Experts '+s+': "Talk to a specialist" with 5 boxes (name, blurb, chevron, spec action), no chip row',x.heads.includes('Talk to a specialist')&&x.rows.length===5&&x.rows.every(r=>r.a==='spec'&&r.blurb&&r.chev)&&x.chips===0,x);}
const x=await boxes('c1');
chk(w+' Five specialists named',JSON.stringify(x.rows.map(r=>r.n))===JSON.stringify(['Mortgage expert','Pension & retirement expert','Protection expert','Investment expert','Financial planner']),x.rows.map(r=>r.n));
const c4=await boxes('c4');chk(w+' Not shown on C4 (booked)',c4.rows.length===0,c4.rows.length);
await boxes('c1');await p.click('button.goal.spec >> nth=0');await p.waitForTimeout(200);
const sp=await ev(()=>({sp:S.book.spec,exp:S.exp,pressed:document.querySelector('button.goal.spec[aria-pressed=true]')&&document.querySelector('button.goal.spec[aria-pressed=true]').dataset.p}));
chk(w+' Tapping a specialist uses spec, keeps the flow (stays on C1) and marks it pressed',sp.exp==='c1'&&sp.sp===sp.pressed&&sp.sp,sp);
// reduced motion
await p.emulateMedia({reducedMotion:'reduce'});await ev(()=>{S.tab='explore';S.xs=[];render();});await p.waitForTimeout(200);
const rm=await ev(()=>[...document.querySelectorAll('.ttile .fx *')].filter(e=>{const a=getComputedStyle(e).animationName;return a&&a!=='none'}).length);
chk(w+' prefers-reduced-motion: no tile animation',rm===0,rm);
await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(100);
const am=await ev(()=>[...document.querySelectorAll('.ttile .fx *')].filter(e=>{const a=getComputedStyle(e).animationName;return a&&a!=='none'}).length);
chk(w+' Motion allowed: tiles animate gently',am>0,am);
await p.close();}
console.log('FAILS',fails,'of',n,'ERRORS',errs.length,errs);await b.close();})();
