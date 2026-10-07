// §24.1 Liabilities (mortgage first, Yes/No, other-property mortgage) and §24.2 What-if card
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load/.test(m.text())&&errs.push(m.text()));
await p.goto(HTML);await p.waitForTimeout(300);const ev=(f,a)=>p.evaluate(f,a);
const liab=(setup)=>ev((src)=>{eval(src);S.app=true;S.shell=true;S.tab='me';S.me='fin';S.fsec=3;lastId=null;render();},setup||'loadSample();');
// engine honesty: the sample's results do not change with the new fields
const base=await ev(()=>{loadSample();const P=project();return JSON.stringify([P.pct,finNums().debt,finNums().mortBal,finNums().loanBal])});
// A1 order
await liab();
const o1=await ev(()=>[...document.querySelectorAll('#main .card')].map(c=>(c.querySelector('b')||{}).textContent||'').filter(Boolean));
chk('Liabilities order: Mortgage, then Credit cards, then Other loans',o1.findIndex(t=>/Mortgage/.test(t))>=0&&o1.findIndex(t=>/Mortgage/.test(t))<o1.findIndex(t=>/Credit cards/.test(t))&&o1.findIndex(t=>/Credit cards/.test(t))<o1.findIndex(t=>/Other loans/.test(t)),o1);
// A2 visible without owning with a mortgage
for(const h of ['Own outright','Rent','Live with family']){await liab("loadSample();S.fin.home='"+h+"';S.src.home='typed';");
 const v=await ev(()=>({q:!!document.querySelector('[data-a=fchoice][data-p="mortYN|Yes"]'),lab:document.querySelector('#main .flabel').textContent.replace(/\s+/g,' ').trim(),add:!!document.querySelector('[data-a=iadd][data-p=mort2]'),main:!!document.getElementById('f-mortBal')}));
 chk('Mortgage block is visible when home = '+h+' (question + add button, no main-mortgage figures)',v.q&&/Do you have a mortgage\?/.test(v.lab)&&v.add&&!v.main,v);}
// A3 sync with Your home
await liab("loadSample();S.fin.home='Own outright';S.src.home='typed';");
await p.click('[data-a=fchoice][data-p="mortYN|Yes"]');let h=await ev(()=>({home:S.fin.home,fields:!!document.getElementById('f-mortBal')}));
chk('Yes on an owned home sets Your home = Own with mortgage and shows balance, repayment, years, rate',h.home==='Own with mortgage'&&h.fields&&await ev(()=>!!document.getElementById('f-mortRate')&&!!document.getElementById('f-mortYears')),h);
await p.click('[data-a=fchoice][data-p="mortYN|No"]');h=await ev(()=>S.fin.home);chk('No sets Your home = Own outright',h==='Own outright',h);
await liab("loadSample();S.fin.home='Rent';S.src.home='typed';");await p.click('[data-a=fchoice][data-p="mortYN|Yes"]');
h=await ev(()=>({home:S.fin.home,items:LI('mort2').length,note:document.querySelector('#main').innerText.includes('You said "Rent"')}));
chk('Yes while renting keeps Your home = Rent and opens a mortgage-on-another-property item',h.home==='Rent'&&h.items===1&&h.note,h);
await ev(()=>{S.fin.home='Own with mortgage';delete S.fin.mortYN;S.src.home='typed';lastId=null;render();});
chk('Changing Your home to Own with mortgage shows Yes in Liabilities',await ev(()=>mortYNval()==='Yes'&&!!document.querySelector('[data-a=fchoice][data-p="mortYN|Yes"][aria-pressed=true]')),0);
// A4 other-property mortgage = debt, not main mortgage-free
await liab("loadSample();S.fin.home='Own outright';S.src.home='typed';");
await p.click('[data-a=iadd][data-p=mort2]');const sel='[data-it^="mort2|"]';
await p.fill(sel+'[data-it$="|owed"]','150000');await p.fill(sel+'[data-it$="|pay"]','900');await p.fill(sel+'[data-it$="|years"]','20');await p.fill(sel+'[data-it$="|rate"]','4.2');await p.waitForTimeout(100);
const d=await ev(()=>{const F=finNums(),P=project();return {debt:F.debt,loan:F.loanBal,mortBal:F.mortBal,mfree:S.goals.some(g=>g.kind==='mfree'),pay:F.loanPayM,sum:S.fin.mort2Bal,rate:S.fin.mort2Rate}});
chk('Other-property mortgage counted as debt (balance and repayment), main mortgage stays €0',d.loan>=150000&&d.mortBal===0&&Math.round(d.pay)>=900&&d.sum===150000,d);
// blanks stay 0
await ev(()=>{S.lists.mort2.forEach(i=>{i.f={};i.src={}});syncLists();});chk('Blank mortgage item counts as €0',await ev(()=>finNums().loanBal===3500),0);
// engine honesty
const after=await ev(()=>{loadSample();const P=project();return JSON.stringify([P.pct,finNums().debt,finNums().mortBal,finNums().loanBal])});
chk('Sample customer results unchanged',after===base,[base.slice(0,80),after.slice(0,80)]);
// examples
const ex=await ev(()=>['mortYN','mortRate','mort2.owed','mort2.pay','mort2.years','mort2.rate'].map(k=>[k,!!EXAMPLES[k]&&!!exHTML(k)]));
chk('Example cards exist for every new field',ex.every(x=>x[1]),ex);
const exd=await ev(()=>{S.sheet='ex|mort2.owed';render();return document.querySelector('.sheet').innerText});chk('Example card opens and says it never fills the field',/Example: Mortgage left on this property/.test(exd)&&/Example only/.test(exd),exd.slice(0,120));
// B what-if
await ev(()=>{S.sheet=null;loadSample();S.tab='plan';S.planSeg='main';S.planGo='wi';lastId=null;render();});await p.waitForTimeout(400);
const w0=await ev(()=>({base:!!document.getElementById('wi-base'),extra:!!document.getElementById('wi-extra'),sep:document.getElementById('wi-base').querySelector('.wih').textContent,h:document.getElementById('wi-extra-h').textContent,order:document.getElementById('wi-base').compareDocumentPosition(document.getElementById('wi-extra'))&4,labels:[...document.querySelectorAll('#r-wi .flabel')].map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,30)),nudge:!!document.getElementById('r-savenudge'),inBase:!!document.querySelector('#wi-base #r-save'),extraHas:!!document.querySelector('#wi-extra [data-wi=m]')&&!document.querySelector('#wi-extra #r-save')}));
chk('What-if: "Your monthly saving" and "Try an extra amount for …" are separate sections, base first',w0.base&&w0.extra&&w0.sep==='Your monthly saving'&&/^Try an extra amount for /.test(w0.h)&&w0.order===4&&w0.inBase&&w0.extraHas,w0);
chk('What-if labels: "Your saving today", "Extra each month", "One-off amount"',w0.labels.includes('Your saving today')&&w0.labels.includes('Extra each month')&&w0.labels.some(x=>/^One-off amount/.test(x)),w0.labels);
const live=async()=>ev(()=>{const e=document.getElementById('wi-live'),P=project();return {t:e.innerText.replace(/\s+/g,' '),over:e.classList.contains('over'),base:P.save.saveM,sp:P.save.surplusM}});
let L=await live();chk('No extra: the line states today\'s saving and the spare money',/Your saving today is €\d+ a month/.test(L.t)&&!L.over,L);
await ev(()=>{S.wi.m=40;liveUpdate()});L=await live();
chk('Extra +€40: "With this what-if you\'d save €X a month (€base + €40 extra) · spare money about €Y"',L.t.includes('With this what-if you\'d save €'+(Math.round(L.base)+40)+' a month (€'+Math.round(L.base)+' + €40 extra) · spare money about €'+Math.round(L.sp))&&!L.over,L);
await ev(()=>{S.wi.m=725;liveUpdate()});L=await live();chk('Extra above the spare money: gentle warning appears',L.over&&/more than your spare money/.test(L.t),L);
await ev(()=>{S.wi.m=-25;liveUpdate()});L=await live();chk('Negative extra: the line says less',/\(€\d+ − €25 less\)/.test(L.t)&&!L.over,L);
// base change flows into the line
await p.click('#wi-base [data-a=savem][data-p="25"]');await p.waitForTimeout(300);const L2=await live();chk('Changing the base saving updates the live line',L2.base!==L.base&&L2.t.includes('€'+Math.round(L2.base)),[L.base,L2.base,L2.t]);
await ev(()=>{S.wi.m=0;render();});await ev(()=>{S.fin.income=140000;S.saveM=null;S.wi.m=0;lastId=null;render();});chk('💡 nudge kept, inside the "Your monthly saving" section',await ev(()=>!!document.querySelector('#wi-base #r-savenudge')),await ev(()=>[document.getElementById('r-savenudge')&&1,project().save.surplusM,project().save.saveM]));
// save keeps behaviour
await ev(()=>{S.wi.g=S.goals[0].id;S.wi.m=50;render();});await p.click('[data-a=wisave]');chk('"Save as my preferred plan" still saves',await ev(()=>!!S.pref&&S.pref.m===50),0);
console.log('FAILS',fails,'of',n,'ERRORS',errs.length,errs);await b.close();})();
