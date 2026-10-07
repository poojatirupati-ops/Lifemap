const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const F='file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
const out=process.argv[2]||'shots';
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h] of [[390,844],[360,640],[844,390],[1280,800]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_CERT|Failed to load/.test(m.text())&&errs.push(m.text()));
await p.goto(F);await p.waitForTimeout(600);
await p.screenshot({path:`${out}/cover-${w}x${h}.png`});
// contrast with text hidden
await p.addStyleTag({content:'.cover h2,.cover .cover-line,.cover .cover-under,.cover .cover-small .link,.cover .brand{color:transparent!important;text-shadow:none!important}.cover .brand .mark{visibility:hidden}'});
const items=await p.evaluate(()=>[['brand','.cover .brand'],['h2','.cover h2'],['line','.cover-line'],['under','.cover-under'],['why','.cover-small .link']].map(([n,s])=>{const e=document.querySelector(s);let r=e.getBoundingClientRect();if(n==='brand'){const rg=document.createRange();rg.selectNodeContents(e.lastChild);r=rg.getBoundingClientRect();}return {n,x:r.x,y:r.y,w:r.width,h:r.height}}));
const buf=await p.screenshot();
const res=await p.evaluate(async([b64,items])=>{const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return items.map(t=>{const d=g.getImageData(Math.round(t.x*2),Math.round(t.y*2),Math.max(1,Math.round(t.w*2)),Math.max(1,Math.round(t.h*2))).data;let mx=0;for(let k=0;k<d.length;k+=4){const l=.2126*L(d[k])+.7152*L(d[k+1])+.0722*L(d[k+2]);if(l>mx)mx=l}return [t.n,+(1.05/(mx+.05)).toFixed(2)]})},[buf.toString('base64'),items]);
console.log(w+'x'+h,JSON.stringify(res));await p.close();}
console.log('errors',errs);await b.close();})();
