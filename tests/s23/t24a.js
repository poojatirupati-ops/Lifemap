const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:2400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(400);
const show=async(name)=>{await p.waitForTimeout(150);await p.screenshot({path:'shots/'+name+'.png'});};
// sample
await p.evaluate(()=>{loadSample();S.app=true;S.shell=true;S.tab='me';S.me='fin';S.fsec=3;lastId=null;render();});
console.log(await p.evaluate(()=>[...document.querySelectorAll('#main .field label, #main .field .flabel, #main > .card > b, [data-list] > b')].map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,50))));
await show('liab-sample');
// fresh renter
await p.evaluate(()=>{loadSample();S.fin.home='Rent';S.src.home='typed';delete S.fin.mortBal;delete S.src.mortBal;S.app=true;S.shell=true;S.tab='me';S.me='fin';S.fsec=3;lastId=null;render();});
await p.click('[data-a=fchoice][data-p="mortYN|Yes"]');await p.waitForTimeout(200);
console.log(await p.evaluate(()=>({home:S.fin.home,yn:S.fin.mortYN,items:LI('mort2').length,vis:[...document.querySelectorAll('#main .flabel')].map(e=>e.textContent.trim().slice(0,30))})));
await p.fill('[data-it^="mort2|"][data-it$="|owed"]','185000');await p.fill('[data-it^="mort2|"][data-it$="|pay"]','950');await p.waitForTimeout(100);
console.log(await p.evaluate(()=>({F:finNums().debt,loan:finNums().loanBal,fin:S.fin.mort2Bal,mf:finNums().mortBal,miss:planMissing().map(m=>m.k)})));
await show('liab-renter');
// sync with Your home
await p.evaluate(()=>{loadSample();S.fin.home='Own outright';S.src.home='typed';S.app=true;S.shell=true;S.tab='me';S.me='fin';S.fsec=3;lastId=null;render();});
await p.click('[data-a=fchoice][data-p="mortYN|Yes"]');await p.waitForTimeout(200);
console.log('own outright -> yes', await p.evaluate(()=>S.fin.home));
await p.click('[data-a=fchoice][data-p="mortYN|No"]');await p.waitForTimeout(200);console.log('-> no',await p.evaluate(()=>S.fin.home));
console.log(errs);await b.close();})();
