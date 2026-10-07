// §26 + developer fix round: no invented age, What-if order, labelled example figures, dialogs/focus, targets, ring, tags, banners, print, report size
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(w,h,init)=>{const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load|ERR_FAILED/.test(m.text())&&errs.push(m.text()));if(init)await p.addInitScript(init);await p.goto(HTML);await p.waitForTimeout(250);return p;};
const p=await mk(390,844);const ev=(f,a)=>p.evaluate(f,a);
// ---- 1 invented age
chk('fresh(): no age',await ev(()=>fresh().about.age===null),0);
chk('sample customer keeps age 38',await ev(()=>{loadSample();return S.about.age===38}),0);
await ev(()=>{S=fresh();S.shell=true;S.tab='me';S.me='details';lastId=null;render();});
chk('Me details: Age shows "Not given yet"',await ev(()=>/Age\s*Not given yet/.test(document.getElementById('screen').innerText.replace(/\n/g,' '))),await ev(()=>document.getElementById('screen').innerText.slice(0,300)));
await ev(()=>{S=fresh();S.shell=true;S.pb=true;S.tab='plan';S.scr='B1';lastId=null;render();});
chk('B1: age box blank and Next disabled',await ev(()=>document.getElementById('age-v').value===''&&document.querySelector('.foot .btn').disabled),0);
await p.click('[data-a=partner][data-p=No]');await p.click('[data-a=deps][data-p="0"]');
chk('B1: still disabled with partner + children answered but no age',await ev(()=>document.querySelector('.foot .btn').disabled),0);
await p.click('[data-a=age][data-p="x|1"]');
chk('B1: tapping + gives an age and enables Next',await ev(()=>S.about.age>=18&&!document.querySelector('.foot .btn').disabled),await ev(()=>S.about.age));
await ev(()=>{S=fresh();S.shell=true;S.pb=true;S.tab='plan';S.scr='B1';S.about.partner=false;S.about.deps=0;lastId=null;render();});
await p.focus('input[data-in=age]');await p.keyboard.press('ArrowRight');
chk('B1: the slider sets age and enables Next without a re-render',await ev(()=>S.about.age>=18&&!document.querySelector('.foot .btn').disabled),await ev(()=>S.about.age));
// no NaN anywhere pre-plan
const bad=[];
for(const id of await ev(()=>CALCS.map(c=>c.id))){await ev(id=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:id}];lastId=null;render();},id);const t=await ev(()=>document.getElementById('screen').innerText);if(/NaN|undefined|Infinity|\bnull\b/.test(t))bad.push(id);}
chk('All 28 calculators without any data show no NaN/undefined/null',bad.length===0,bad);
for(const sc of ['HOME-0','XPL-01','PLAN-0','VID-01']){await ev(sc=>{S=fresh();Object.assign(S.ans,{'2':0,'4':1});S.shell=true;S.tab=sc==='HOME-0'?'home':sc==='PLAN-0'?'plan':'explore';S.xs=sc==='VID-01'?[{v:'VID',p:'v2'}]:[];lastId=null;render();},sc);const t=await ev(()=>document.getElementById('screen').innerText);chk('No NaN/undefined on '+sc+' with no age',!/NaN|undefined|Infinity|\bnull\b/.test(t),t.slice(0,100));}
await ev(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'retirement'}];lastId=null;render();});
const ra=await ev(()=>({age:document.getElementById('co-age')?document.getElementById('co-age').value:null,lab:!document.getElementById('exlab').hidden,txt:document.getElementById('exlab').textContent,aboutAge:S.about.age,srcTag:!!document.querySelector('#screen .tag.pre')}));
chk('Retirement calculator, no age given: S.about.age stays null, the tool shows its own example age and the example label',ra.aboutAge===null&&ra.lab&&ra.txt==='Example figures. Change them to yours.',ra);
await ev(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'retirement'}];lastId=null;render();});
await p.click('[data-a=calcadd][data-p=retirement]').catch(()=>{});
await ev(()=>{const m=calcMissing(C('retirement'));S.calcExK=S.calcExK;});
await ev(()=>{S.sheet='calcadd|retirement';lastId=null;render();});
chk('Add to my plan with no age asks for age first (no goal at a made-up age), with a way to add it',await ev(()=>/Add your age first/.test(document.querySelector('.sheet').innerText)&&!!document.querySelector('.sheet [data-a=makeplan]')&&S.goals.length===0),await ev(()=>document.querySelector('.sheet').innerText.slice(0,120)));
// ---- 3 example label
await ev(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'borrow'}];lastId=null;render();});
chk('Example label shown at the top of an Explore tool without data, exact words',await ev(()=>{const e=document.getElementById('exlab');return !e.hidden&&e.textContent==='Example figures. Change them to yours.'&&e.getBoundingClientRect().top<document.querySelector('#main .eyebrow').getBoundingClientRect().top}),0);
await ev(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'deposit'}];lastId=null;render();});
chk('The result made from examples carries the label',await ev(()=>/Example figures\. Change them to yours\./.test(document.getElementById('cout').innerText)),await ev(()=>document.getElementById('cout').innerText.slice(0,200)));
await ev(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'borrow'}];lastId=null;render();});
// typing replaces: type into every input
const ks=await ev(()=>C('borrow').inputs.map(i=>i.k));
for(const k of ks){const el=await p.$('#co-'+k);if(el){await el.fill('12345');await el.press('Enter');}else{const c=await p.$('[data-a=ckset][data-p^="'+k+'|"]');if(c)await c.click();}}
const after=await ev(()=>({hidden:document.getElementById('exlab').hidden,res:/Example figures/.test(document.getElementById('cout').innerText)}));
chk('Once every figure is the customer\'s own typing, the label goes (top and result)',after.hidden&&!after.res,after);
await ev(()=>{S=fresh();S.shell=true;S.tab='explore';S.xs=[{v:'CALC',p:'borrow'}];lastId=null;render();});
const el1=await p.$('#co-'+ks[0]);await el1.fill('55555');await el1.press('Enter');
chk('Typing one figure keeps that figure (precedence: typed > example) and the label stays while others are still examples',await ev(k=>{const v=calcVals(C('borrow'));return v[k]===55555&&!document.getElementById('exlab').hidden},ks[0]),0);
await ev(()=>{loadSample();S.tab='explore';S.xs=[{v:'CALC',p:'borrow'}];lastId=null;render();});
chk('With a plan the label is not shown (own figures)',await ev(()=>document.getElementById('exlab').hidden&&!/Example figures/.test(document.getElementById('cout').innerText)),0);
// ---- 2 What-if order
await ev(()=>{loadSample();S.tab='plan';S.planSeg='main';lastId=null;render();});
const ord=await ev(()=>{const c=document.getElementById('r-wi'),ids=['wi-base','wi-extra','wi-live','wi-out'].map(i=>c.querySelector('#'+i)),d=c.querySelector('details.wigrow'),pos=e=>e?[...c.querySelectorAll('*')].indexOf(e):-1,chips=c.querySelector('[aria-label="Goal for the what-if"]'),hs=[...c.querySelectorAll('h4,summary,.fl')].map(x=>x.textContent.trim().slice(0,30));
  return {pos:ids.map(pos).concat([pos(d)]),open:d&&d.open,chips:pos(chips),infl:!!d.querySelector('[data-a=infl],[data-a=inflchoice],.chip'),hs,btn:pos(c.querySelector('[data-a=wisave]'))}});
chk('What-if order: monthly saving, extra (chips, extra, one-off), live total, result, THEN growth settings, then the buttons',ord.pos.every((x,i,a)=>x>0&&(i===0||x>a[i-1]))&&ord.btn>ord.pos[4]&&ord.chips>ord.pos[0]&&ord.chips<ord.pos[2],ord);
chk('What-if: the first heading is "Your monthly saving"; growth block is collapsed and one tap away',ord.hs[0]==='Your monthly saving'&&ord.open===false,ord.hs);
await p.click('details.wigrow summary');await p.waitForTimeout(150);
chk('What-if: tapping the summary opens the growth and inflation block (growth chips and inflation choice inside)',await ev(()=>{const d=document.querySelector('details.wigrow');return d.open&&/Growth assumptions/.test(d.innerText)&&/inflation|Prices/i.test(d.innerText)}),0);
await ev(()=>{S.wi.m=50;render();});
chk('The open state survives a re-render',await ev(()=>document.querySelector('details.wigrow').open),0);
// ---- 3 dialogs
const names=[];
for(const sh of ['ask','whyask','invite','save','saveprompt','money','assume','history','delete','profile','other','explain|str','explain|gap','ex|cash','calcadd|borrow']){await ev(sh=>{document.getElementById('report').classList.remove('on');loadSample();S.sheet=sh;lastId=null;render();},sh);
 const r=await ev(()=>{const d=document.querySelector('.sheet'),l=d.getAttribute('aria-labelledby'),el=l&&document.getElementById(l);return {al:d.getAttribute('aria-label'),name:el?el.innerText.trim():null,focusIn:d.contains(document.activeElement)}});
 if(!(r.name&&r.name.length>3&&!/^[a-z|]+$/.test(r.name)&&!r.al&&r.focusIn))names.push([sh,r]);}
chk('Every dialog is named by its own heading (no internal keys) and takes focus inside',names.length===0,names);
// focus return for each opener
const opener=[['[data-a=ask]','home'],['[data-a=sheet]','home']];
for(const [sel,tab] of opener){for(const how of ['Escape','close']){await ev(t=>{loadSample();S.tab=t;lastId=null;render();},tab);await p.focus(sel);await p.keyboard.press('Enter');await p.waitForTimeout(80);
 if(how==='Escape')await p.keyboard.press('Escape');else await p.click('.sheet .sx');await p.waitForTimeout(80);
 const f=await ev(()=>{const a=document.activeElement;return a&&a.dataset?a.dataset.a+'|'+(a.dataset.p||''):String(a&&a.tagName)});
 chk('Focus returns to the opener ('+sel+') after '+how,f.startsWith(sel.slice(8,-1)+'|'),f);}}
await ev(()=>{loadSample();S.tab='home';lastId=null;render();});
await p.focus('[data-a=ask]');await p.keyboard.press('Enter');await p.waitForTimeout(80);await p.click('.sheet .askq >> nth=0').catch(()=>{});await p.keyboard.press('Escape');await p.waitForTimeout(80);
chk('After the Ask sheet closes with changes made inside, focus is never on the page body',await ev(()=>document.activeElement!==document.body),0);
await ev(()=>{loadSample();S.sheet='profile';lastId=null;render();});
chk('Profile sheet: focus is inside the dialog on open',await ev(()=>document.querySelector('.sheet').contains(document.activeElement)),0);
// report dialog
await ev(()=>{loadSample();S.tab='plan';lastId=null;render();});
await p.focus('[data-a=report]');await p.keyboard.press('Enter');await p.waitForTimeout(200);
chk('Report opens with focus inside it',await ev(()=>!!document.activeElement.closest('#report')),0);
let out=false;for(let i=0;i<30;i++){await p.keyboard.press('Tab');if(!await ev(()=>!!document.activeElement.closest('#report')))out=true;}
chk('Report: 30 Tabs never leave the dialog',!out,0);
chk('Report: the page behind is inert',await ev(()=>document.querySelector('.stage').inert===true),0);
let outS=false;for(let i=0;i<30;i++){await p.keyboard.press('Shift+Tab');if(!await ev(()=>!!document.activeElement.closest('#report')))outS=true;}
chk('Report: 30 Shift+Tabs never leave the dialog',!outS,0);
await p.keyboard.press('Escape');await p.waitForTimeout(100);
chk('Report: Esc returns focus to the Download button and un-inerts the page',await ev(()=>document.activeElement.dataset.a==='report'&&document.querySelector('.stage').inert===false),await ev(()=>document.activeElement.outerHTML.slice(0,80)));
// ---- ring contrast
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const rc=await ev(()=>{loadSample();S.tab='home';lastId=null;render();const bt=document.querySelector('.tb-btn');bt.focus();const cs=getComputedStyle(bt);return {o:cs.outlineColor,w:cs.outlineWidth,sh:cs.boxShadow}});
const oc=rc.o.match(/\d+/g).map(Number);
chk('Focus ring: ink outline, 3px, contrast >= 3:1 on white and on the sand background',cr(oc,[255,255,255])>=3&&cr(oc,[248,245,238])>=3&&rc.w==='3px',[rc,cr(oc,[255,255,255])]);
chk('Focus ring halo is white (shows on dark surfaces)',/255, 255, 255/.test(rc.sh),rc.sh);
// tag colours
const tg=await ev(()=>{const t=document.createElement('span');const out={};for(const c of ['pre','doc']){t.className='tag '+c;document.body.appendChild(t);const cs=getComputedStyle(t);out[c]=[cs.color,cs.backgroundColor];t.remove()}return out});
for(const c of ['pre','doc']){const f=tg[c][0].match(/\d+/g).map(Number),g=tg[c][1].match(/\d+/g).map(Number);chk('Tag "'+c+'" text contrast >= 4.5:1',cr(f,g)>=4.5,cr(f,g));}
chk('Pill mint/ok text contrast >= 4.5:1',await ev(()=>{const l=(c)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const cs=getComputedStyle(document.documentElement);const px=n=>{const t=document.createElement('i');t.style.color=cs.getPropertyValue(n);document.body.appendChild(t);const c=getComputedStyle(t).color.match(/\d+/g).map(Number);t.remove();return c};const q=(a,b)=>{const x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};return q(px('--sea-d'),px('--sea-l'))>=4.5&&q(px('--ok-t'),px('--ok-l'))>=4.5}),0);
chk('Explorer watch-out says emergency fund (ours); Contented line kept',await ev(()=>/before your emergency fund/.test(JSON.stringify(Object.values(TYPES||{})))||document.documentElement.innerHTML.includes("before your emergency fund is in place")&&document.documentElement.innerHTML.includes('Putting off decisions, such as pension top-ups.')),0);
await p.close();
// ---- tap targets and layout at 360 and 390
for(const w of [360,390]){const q=await mk(w,w===360?640:844);const e=(f,a)=>q.evaluate(f,a);
 const small=new Map();
 const scr=await e(()=>JUMPS.flatMap((g,gi)=>g[1].map((j,k)=>[gi,k,j[0]])));
 for(const [gi,k,id] of scr){await e(([gi,k])=>{JUMPS[gi][1][k][2]();lastId=null;render();},[gi,k]);
  const r=await e(()=>{const o=[];document.querySelectorAll('#screen .link,#screen .chip.sm,#screen summary,#screen .seg button,#screen .stepper button,#screen .sx').forEach(x=>{const r=x.getBoundingClientRect();if(!r.width||x.closest('[aria-hidden=true]'))return;if(r.height<43.5||r.width<43.5)o.push(x.className+' '+Math.round(r.width)+'x'+Math.round(r.height)+' '+(x.textContent||'').trim().slice(0,18))});return o});
  r.forEach(x=>small.set(x,id));}
 chk('At '+w+': links, small chips, summary rows, segmented buttons, steppers and close buttons are all >= 44 px (39 screens)',small.size===0,[...small.entries()].slice(0,8));
 // pseudo-extended
 await e(()=>{loadSample();S.tab='home';lastId=null;render();});
 const ext=await e(()=>{const f=document.querySelector('.askfab'),r=f.getBoundingClientRect(),cs=getComputedStyle(f,'::after');return {h:r.height+parseFloat(cs.top)*-1+parseFloat(cs.bottom)*-1,w:r.width}});
 chk('At '+w+': Ask button tap area is >= 44 px high (hit area extended, look unchanged)',ext.h>=44,ext);
 // About you tag overflow
 await e(()=>{loadSample();S.app=true;S.tab='me';S.me='fin';S.fsec=0;lastId=null;render();});
 const ov=await e(()=>{const c=[...document.querySelectorAll('#main .card')],o=[];c.forEach(card=>{const r=card.getBoundingClientRect();card.querySelectorAll('*').forEach(x=>{const q=x.getBoundingClientRect();if(q.width&&(q.right>r.right+1||q.left<r.left-1))o.push(x.className+' '+Math.round(q.right-r.right))})});return {o:o.slice(0,5),h:document.getElementById('main').scrollWidth>document.getElementById('main').clientWidth+1}});
 chk('At '+w+': About you (Retirement age row etc.) has nothing running outside its card',ov.o.length===0&&!ov.h,ov);
 // banners
 await e(()=>{loadSample();S.fin.insp=undefined;S.fin.pension=null;delete S.src.pension;delete S.fin.pensionM;delete S.src.pensionM;S.tab='plan';S.planSeg='main';lastId=null;render();});
 const bn=await e(()=>({miss:!!document.getElementById('miss-banner'),rough:!!document.getElementById('r-rough'),prelim:!!document.querySelector('#r-res .prelim'),flags:missingFlags().length,roughQ:qualityCount()}));
 chk('At '+w+': results never show both the missing-details and rough-picture banners',!(bn.miss&&bn.rough),bn);
 await e(()=>{loadSample();S.tab='plan';lastId=null;render();document.getElementById('main').scrollTop=0;});
 chk('At '+w+': no horizontal scroll on the plan',await e(()=>document.getElementById('main').scrollWidth<=document.getElementById('main').clientWidth+1),0);
 await q.close();}
// ---- print fallback + report html size
const pp=await mk(390,844,'window.__pr=0;window.print=()=>{window.__pr++};');
await pp.evaluate(()=>{loadSample();render();openReport();});await pp.click('[data-r=print]');await pp.waitForTimeout(900);
chk('Print silently blocked (no beforeprint): the message says nothing opened',/Nothing opened/.test(await pp.evaluate(()=>document.getElementById('rep-msg').textContent)),await pp.evaluate(()=>document.getElementById('rep-msg').textContent));
await pp.close();
const pq=await mk(390,844,'window.print=()=>{dispatchEvent(new Event("beforeprint"))};');
await pq.evaluate(()=>{loadSample();render();openReport();});await pq.click('[data-r=print]');await pq.waitForTimeout(900);
chk('Print that opens (beforeprint fires): message stays "Opening the print window"',/Opening the print window/.test(await pq.evaluate(()=>document.getElementById('rep-msg').textContent)),0);
await pq.close();
const pr=await mk(390,844,'window.__s=[];window.claude={use:async()=>({save:async o=>{window.__s.push([o.filename,o.data.size||o.data.byteLength]);if(o.data.text)window.__t=await o.data.text()}})};');
await pr.route(/cdnjs/,r=>r.abort());await pr.evaluate(()=>{loadSample();render();openReport();});await pr.click('[data-r=print]');await pr.waitForTimeout(2500);
const sv=await pr.evaluate(()=>({s:window.__s,hasPhoto:/data:image\/jpeg;base64,\/9j/.test(window.__t||''),hasSvgArt:/--art-[a-z]+:url/.test(window.__t||'')}));
chk('Saved report .html is small (< 120 KB) and carries no photo variables',sv.s[0]&&sv.s[0][0]==='LifeMap-plan.html'&&sv.s[0][1]<120000&&!sv.hasPhoto&&!sv.hasSvgArt,sv);
await pr.close();
console.log('FAILS '+fails+' of '+n+' ERRORS '+errs.length,errs.slice(0,5));await b.close();})();
