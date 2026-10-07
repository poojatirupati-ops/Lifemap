const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const {PNG}=(()=>{try{return require('/opt/node22/lib/node_modules/pngjs')}catch(e){return {}}})();
const f=process.argv[2];
(async()=>{const b=await chromium.launch();
for(const w of [390,1280]){const p=await b.newPage({viewport:{width:w,height:900}});
await p.goto('file://'+f);await p.waitForTimeout(300);
await p.evaluate(()=>{loadSample();S.tab='explore';S.xs=[];render();});await p.waitForTimeout(500);
await p.addStyleTag({content:'.ttile .tx{visibility:hidden}.ttile *{animation-play-state:paused!important}'});
const r=await p.evaluate(()=>[...document.querySelectorAll('.ttile')].map(t=>{const a=t.getBoundingClientRect(),x=t.querySelector('.tx').getBoundingClientRect();return {n:t.dataset.p,x:x.x,y:x.y,w:x.width,h:x.height}}));
for(const t of r){await p.locator('.ttile[data-p="'+t.n+'"]').scrollIntoViewIfNeeded();const t2=await p.evaluate(n=>{const x=document.querySelector('.ttile[data-p="'+n+'"] .tx').getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height}},t.n);Object.assign(t,t2);const buf=await p.screenshot({clip:{x:t.x,y:t.y,width:t.w,height:t.h}});
 const d=await p.evaluate(async b64=>{const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);const px=g.getImageData(0,0,c.width,c.height).data;let mx=0;const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};for(let k=0;k<px.length;k+=4){const l=.2126*L(px[k])+.7152*L(px[k+1])+.0722*L(px[k+2]);if(l>mx)mx=l}return 1.05/(mx+.05)},buf.toString('base64'));
 console.log(w,t.n,d.toFixed(2));}}
await b.close();})();
