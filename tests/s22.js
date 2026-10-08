// §22: Step 7 skippable. 3 required choices, standards button, Skip, banner
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load resource/.test(m.text())&&errs.push(m.text()));
await p.goto(HTML);await p.waitForTimeout(300);
const ev=(f,a)=>p.evaluate(f,a);
const toP4=()=>ev(()=>{loadSample();S.app=false;S.shell=true;S.pb=true;S.tab='plan';S.scr='P4';S.retireSet=false;S.infl=null;S.asm={};S.fin.pIncome=0;S.pRetSet=false;S.checked=false;render();});
await toP4();
const a=await ev(()=>({h:[...document.querySelectorAll('#p4-3 h3')].map(x=>x.textContent),tick:!!document.querySelector('[data-chk]'),txt:document.body.innerText.includes('These details are right'),cnt:document.getElementById('p4-count').textContent,dis:[document.getElementById('seeres').disabled,document.getElementById('skipres').disabled],skipTxt:document.getElementById('skipres').textContent,first:document.querySelector('#p4-asm').compareDocumentPosition(document.querySelector('.ck'))&4,miss:req3Missing().map(m=>m.k)}));
chk('[s27] Step 7 has a "Choose 3 things" card showing 0 of 3 chosen',a.h[0]==='Choose 3 things'&&/^0 of 3 chosen/.test(a.cnt),a);
chk('The required tick is gone',!a.tick&&!a.txt,a);
chk('Both buttons locked until the 3 are chosen; secondary reads "Skip, show my results"',a.dis[0]&&a.dis[1]&&a.skipTxt==='Skip, show my results',a);
chk('[s27] The 3 things are retirement age, plan-until age, inflation (screen order); none defaulted',JSON.stringify(a.miss)==='["retireAge","planEnd","infl"]',a);
chk('3 choices are shown above the checklist',a.first===4,a);
chk('[s27] No "Use the standards for the rest" button any more (standards are set from the start)',await ev(()=>!document.querySelector('[data-a=useall]')),0);
const u=await ev(()=>({other:ASM_KEYS().filter(k=>asmStd(k)&&!asmMine(k)&&!ASM[k].req).length,rest:!!document.querySelector('#p4-rest summary')&&/What we've set for you \(change any\)/.test(document.querySelector('#p4-rest summary').textContent),openRest:document.querySelector('#p4-rest').open}));
chk('[s27] Standards need no choosing; they are under "What we\'ve set for you (change any)", collapsed',u.rest&&!u.openRest,u);
await p.click('#p4-infl [data-a="infl"][data-p="0.02"]');
let c=await ev(()=>({cnt:document.getElementById('p4-count').textContent,dis:document.getElementById('skipres').disabled,need:document.getElementById('p4-need').textContent}));
chk('1 of 3 chosen: still locked, says what is next',/^1 of 3/.test(c.cnt)&&c.dis&&/retirement age/.test(c.need),c);
await p.fill('[data-nb="ret|a"]','65');await p.press('[data-nb="ret|a"]','Enter');await p.fill('[data-nb="asm|planEnd"]','90');await p.press('[data-nb="asm|planEnd"]','Enter');await p.waitForTimeout(150);
c=await ev(()=>({cnt:document.getElementById('p4-count').textContent,dis:[document.getElementById('seeres').disabled,document.getElementById('skipres').disabled],miss:planMissing().map(m=>m.k)}));
chk('All 3 chosen: both buttons work, no tick needed',/^3 of 3/.test(c.cnt)&&!c.dis[0]&&!c.dis[1],c);
// skip with missing details: make 3 details missing
await ev(()=>{['cash','savings','pensionM'].forEach(k=>{});const m=missingFlags().length;window.__m=m;});
await p.click('#skipres');await p.waitForTimeout(2200);
let r=await ev(()=>({app:S.app,tab:S.tab,checked:S.checked,ban:(document.getElementById('miss-banner')||{}).textContent||'',n:missingFlags().length,gate:!!document.querySelector('[id^=gate-]'),gtxt:(document.getElementById('gate-res')||{}).textContent||''}));
chk('Skip goes to results with the banner',r.app&&r.tab==='plan'&&!r.checked&&r.ban.length>0,r);
chk('Banner wording: "Based on what you\'ve told us. N details missing. Missing figures count as €0 (merged with the rough-picture note, one banner)" (or singular)',new RegExp("^ℹ️Based on what you've told us\\. "+r.n+(r.n===1?' detail missing\\. Missing figures count as €0, so this is a rough picture\\.Add it':' details missing\\. Missing figures count as €0, so this is a rough picture\\.Add them')+'$').test(r.ban),r);
chk('[s27] Once the 3 are chosen no "Choose your ... to see this" gate remains; the banner counts what is missing',!r.gate&&r.n>0,r);
// plural + singular + zero via flags
const forceN=async k=>ev(k=>{loadSample();S.app=true;S.shell=true;S.pb=false;S.tab='plan';S.planSeg='main';S.retireSet=true;S.infl=0.02;S.asm.planEnd=90;useAllStd();const ks=[];FSEC.forEach(s=>s.f.filter(fieldVisible).filter(x=>x!=='retireAge'&&!FF[x].opt).forEach(x=>ks.push(x)));
 ks.forEach(x=>{S.src[x]='typed';delete S.look[x];}); // all present
 Object.keys(S.look).forEach(x=>delete S.look[x]);ks.slice(0,k).forEach(x=>{delete S.src[x];delete S.fin[x];});render();return {n:missingFlags().length,ban:(document.getElementById('miss-banner')||{}).textContent||''}},k);
for(const k of [0,1,3]){const o=await forceN(k);const want=!o.n?'':o.n===1?'1 detail missing. Missing figures count as €0, so this is a rough picture.Add it':o.n+' details missing. Missing figures count as €0, so this is a rough picture.Add them';chk('Banner for '+o.n+' missing → '+(want||'no banner'),want?o.ban.includes(want):o.ban==='',o);}
const o3=await forceN(3);
const mm=await ev(()=>{const cnt=missingFlags().length;document.querySelector('[data-a=addmiss]')&&document.querySelector('[data-a=addmiss]').click();return {cnt,tab:S.tab,me:S.me,list:document.querySelectorAll('#main .mini').length,ck:[...document.querySelectorAll('#main .card')].map(c=>c.textContent).find(t=>/To sharpen your plan/.test(t))||''}});
chk('"Add them" opens My money, whose checklist lists the same count',mm.tab==='me'&&mm.me==='money'&&(mm.ck.match(/Fix/g)||[]).length===mm.cnt,mm);
const o1=await forceN(1);
const s1=await ev(()=>{document.querySelector('[data-a=addmiss]').click();return {tab:S.tab,fsec:S.fsec}});
chk('"Add it" (1 missing) opens that item\'s section in Your finances',s1.fsec!=null,s1);
// main button also works and sets checked
await toP4();await ev(()=>{S.retireSet=true;S.retireAge=65;S.infl=0.02;S.asm.planEnd=90;useAllStd();render();});await p.click('#seeres');await p.waitForTimeout(2200);
chk('"See my results" works with no tick',await ev(()=>S.app&&S.checked===true),0);
chk('No console errors',errs.length===0,errs);
console.log('FAILS',fails,'of',n,'ERRORS',errs.length);await b.close();})();
