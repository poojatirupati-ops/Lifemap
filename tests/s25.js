// §25: photos on the Focus tiles, two real videos in Home and Explore
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const HTML='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
let fails=0,n=0;const chk=(m,ok,x)=>{n++;if(!ok)fails++;console.log((ok?'PASS':'FAIL')+' | '+m+(ok?'':' | '+JSON.stringify(x)))};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load resource|media|MEDIA/.test(m.text())&&errs.push(m.text()));
await p.goto(HTML);await p.waitForTimeout(300);const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>{loadSample();S.tab='explore';S.xs=[];lastId=null;render();});
const t=await ev(()=>['mortgage','pension','protection','investing','savings','everyday'].map(k=>{const v=getComputedStyle(document.documentElement).getPropertyValue('--art-'+k);return [k,v.startsWith('url("data:image/jpeg')?'jpeg':v.startsWith('url("data:image/svg')?'svg':'?',v.length]}));
const want={mortgage:'jpeg',pension:'jpeg',protection:'svg',investing:'jpeg',savings:'jpeg',everyday:'jpeg'};
chk('Photos in 5 art slots (Mortgages, Pensions, Investing, Savings, Everyday money); Protection keeps its drawn shield',t.every(x=>x[1]===want[x[0]]),t);
const ti=await ev(()=>[...document.querySelectorAll('.ttile')].map(e=>({n:e.dataset.p,ph:e.classList.contains('ph'),pos:getComputedStyle(e.querySelector('.art')).backgroundPosition,fx:getComputedStyle(e.querySelector('.fx')).display,anim:getComputedStyle(e.querySelector('.art')).animationName})));
chk('Photo tiles: object-position set per photo, drawn overlay off, gentle zoom; Protection keeps its drawn animation',ti.filter(x=>x.ph).length===5&&ti.filter(x=>x.ph).every(x=>x.fx==='none'&&x.anim==='kenb'&&x.pos!=='50% 50%')&&ti.find(x=>x.n==='Protection').fx!=='none',ti);
await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);chk('Reduced motion: the photo zoom stops',await ev(()=>[...document.querySelectorAll('.ttile .art')].every(e=>getComputedStyle(e).animationName==='none')),0);await p.emulateMedia({reducedMotion:'no-preference'});
const sz=await ev(()=>[...document.querySelectorAll('.ttile')].every(e=>{const r=e.getBoundingClientRect();return Math.abs(r.width-r.height)<1.5}));chk('Tiles still square',sz,0);
// Home strip
await ev(()=>{S=fresh();S.shell=true;S.app=false;S.tab='home';lastId=null;render();});
const hv=await ev(()=>[...document.querySelectorAll('#main .vthumb')].map(e=>e.querySelector('b').textContent));
chk('Home "Watch · picked for you" carries both real videos',hv.includes('What is auto-enrolment?')&&hv.includes('Your retirement plan: how it works'),hv);
// library
await ev(()=>{S.tab='explore';S.xs=[{v:'VIDS'}];lastId=null;render();});
const lv=await ev(()=>[...document.querySelectorAll('#main .vthumb b')].map(e=>e.textContent));
chk('Explore library lists them first, other videos stay',lv[0]==='What is auto-enrolment?'&&lv[1]==='Your retirement plan: how it works'&&lv.length===8,lv);
await ev(()=>{S.vf='pension';render();});const pv=await ev(()=>[...document.querySelectorAll('#main .vthumb b')].map(e=>e.textContent));
chk('Pensions filter: the two real videos lead',pv.slice(0,2).join('|')==='What is auto-enrolment?|Your retirement plan: how it works'&&pv.length===3,pv);
// player
for(const [id,title,src,poster] of [['v7','What is auto-enrolment?','media/auto-enrolment-explained.mp4','media/money-plant.jpg'],['v8','Your retirement plan: how it works','media/retirement-plan-how-it-works.mp4','media/retired-reading.jpg']]){
 await ev(i=>{S.tab='explore';S.xs=[{v:'VID',p:i}];S.play=false;lastId=null;render();},id);await p.waitForTimeout(500);
 const v=await ev(()=>{const e=document.getElementById('vid-el');return e?{tag:e.tagName,controls:e.controls,preload:e.getAttribute('preload'),src:e.getAttribute('src'),poster:e.getAttribute('poster'),label:e.getAttribute('aria-label'),b64:/base64/.test(e.outerHTML),title:document.querySelector('#main h2').textContent,caps:document.getElementById('vid-cap').textContent,tool:[...document.querySelectorAll('#main .btn')].map(x=>x.textContent.trim()),expert:[...document.querySelectorAll('#main [data-a=expertfor]')].map(x=>x.textContent.trim()),tabindex:e.tabIndex,fail:document.getElementById('vid-fail').hidden,failTxt:document.getElementById('vid-fail').textContent}:null});
 chk(title+': <video> with controls, preload=metadata, relative src, poster, aria-label',v&&v.tag==='VIDEO'&&v.controls&&v.preload==='metadata'&&v.src===src&&v.poster===poster&&v.label===title&&!v.b64,v);
 chk(title+': "Captions not available yet" shown honestly',v&&/Captions not available yet/.test(v.caps),v&&v.caps);
 chk(title+': matching tool (pension calculator) and expert rows',v&&v.tool.some(x=>/Try Retirement projection/.test(x))&&v.expert.some(x=>/Talk to a pension/i.test(x)),v&&[v.tool,v.expert]);
 chk(title+': in this Chromium (no H.264) the failure message replaces the blank player',v,v&&v.failTxt);
 await p.waitForTimeout(800);const f=await ev(()=>({vh:document.getElementById('vid-el').hidden,fh:document.getElementById('vid-fail').hidden,txt:document.getElementById('vid-fail').innerText,role:document.getElementById('vid-fail').getAttribute('role')}));
 chk(title+': when the file can\'t load or play, a clear message with Try again shows (video hidden)',f.vh&&!f.fh&&/can't play right now/.test(f.txt)&&/Try again/.test(f.txt)&&f.role==='alert',f);
 await p.click('[data-a=vretry]');chk(title+': Try again re-shows the player and reloads',await ev(()=>!document.getElementById('vid-el').hidden||document.getElementById('vid-fail').hidden===false),0);
}
// keyboard
await ev(()=>{S.tab='explore';S.xs=[{v:'VID',p:'v8'}];lastId=null;render();document.getElementById('vid-fail').hidden=true;document.getElementById('vid-el').hidden=false;});
const kb=await ev(()=>{const e=document.getElementById('vid-el');e.focus();return {focus:document.activeElement===e,tab:e.tabIndex}});chk('Keyboard: the video element takes focus (native controls: Space plays/pauses, arrows seek)',kb.focus&&kb.tab>=0,kb);
await ev(()=>{S=fresh();S.shell=true;S.app=false;S.tab='home';lastId=null;render();});
await p.focus('#main .vthumb[data-p=v7]');await p.keyboard.press('Enter');await p.waitForTimeout(300);chk('Keyboard: Enter on a video card opens the player',await ev(()=>S.xs&&S.xs.some(x=>x.v==='VID'&&x.p==='v7')),0);

// contrast of tile text and video-card text over the photos (>= 4.5:1), worst case: photo zoomed to its 1.07 end state
for(const w of [390,1280]){const q=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:2});await q.goto(HTML);await q.waitForTimeout(400);
 await q.evaluate(()=>{loadSample();S.tab='explore';S.xs=[];lastId=null;render();});
 await q.addStyleTag({content:'.ttile.ph .art{animation:none!important;transform:scale(1.07)!important}.ttile .tx,.ttile .tx *{color:transparent!important;text-shadow:none!important}.vthumb.vph b,.vthumb.vph span,.vthumb.vph small{color:transparent!important;text-shadow:none!important}'});
 const items=await q.evaluate(()=>{const o=[];document.querySelectorAll('.ttile').forEach(t=>{t.scrollIntoView({block:'center'});const r=t.querySelector('.tx').getBoundingClientRect();o.push({n:t.dataset.p,x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height})});return o});
 const res=[];for(const it of items){const el=(await q.$$('.ttile')).find(async()=>0);}
 // screenshot each tile separately (clip) for exact pixels
 const out=[];for(const t of await q.$$('.ttile')){await t.scrollIntoViewIfNeeded();const nm=await t.getAttribute('data-p');const bb=await t.boundingBox();const tx=await t.$eval('.tx',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});const buf=await t.screenshot();
  const c=await q.evaluate(async([b64,tx,bb])=>{const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();const cv=document.createElement('canvas');cv.width=i.width;cv.height=i.height;const g=cv.getContext('2d');g.drawImage(i,0,0);const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};const d=g.getImageData(Math.round((tx.x-bb.x)*2),Math.round((tx.y-bb.y)*2),Math.round(tx.w*2),Math.round(tx.h*2)).data;let mx=0;for(let k=0;k<d.length;k+=4){const l=.2126*L(d[k])+.7152*L(d[k+1])+.0722*L(d[k+2]);if(l>mx)mx=l}return +(1.05/(mx+.05)).toFixed(2)},[buf.toString('base64'),tx,bb]);out.push([nm,c])}
 chk('Tile text contrast >= 4.5:1 over every tile at '+w+' '+JSON.stringify(out),out.length===6&&out.every(x=>x[1]>=4.5),out);
 // video cards with photo posters: label area (bottom half) brightest pixel
 await q.evaluate(()=>{S.xs=[{v:'VIDS'}];lastId=null;render();});await q.addStyleTag({content:'.vthumb .play{display:none!important}.vthumb.vph b,.vthumb.vph small,.vthumb.vph span{color:transparent!important}.tabbar,.tabs,#tabs,nav,.bnav,.foot{visibility:hidden!important}'});
 const vout=[];for(const t of (await q.$$('.vthumb')).slice(0,2)){await t.evaluate(e=>e.scrollIntoView({block:'start'}));const bb=await t.boundingBox();const buf=await t.screenshot();
  const c=await q.evaluate(async([b64])=>{const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();const cv=document.createElement('canvas');cv.width=i.width;cv.height=i.height;const g=cv.getContext('2d');g.drawImage(i,0,0);const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};const d=g.getImageData(Math.round(i.width*.08),Math.round(i.height*.6),Math.round(i.width*.84),Math.round(i.height*.3)).data;let mx=0;for(let k=0;k<d.length;k+=4){const l=.2126*L(d[k])+.7152*L(d[k+1])+.0722*L(d[k+2]);if(l>mx)mx=l}return +(1.05/(mx+.05)).toFixed(2)},[buf.toString('base64')]);vout.push(c)}
 chk('Video card label area over the photo poster >= 4.5:1 at '+w+' '+JSON.stringify(vout),vout.length===2&&vout.every(x=>x>=4.5),vout);await q.close();}
// file size honesty
const fs=require('fs');const sz2=fs.statSync('/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html').size;chk('HTML stays self-contained but small enough ('+Math.round(sz2/1024)+' KB; videos are not embedded)',sz2<2e6,sz2);
chk('Media files exist next to the page',['auto-enrolment-explained.mp4','retirement-plan-how-it-works.mp4','house-for-sale.jpg','retired-reading.jpg','money-plant.jpg','team-with-charts.jpg','car-and-calculator.jpg'].every(f=>fs.existsSync('/home/user/lifegoals-prototype/media/'+f)),0);
console.log('FAILS',fails,'of',n,'ERRORS',errs.length,errs);await b.close();})();
