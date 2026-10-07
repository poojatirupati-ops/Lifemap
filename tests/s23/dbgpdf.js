const { chromium } = require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const LIB='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/s23/lib/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:fs.readFileSync(/jspdf/.test(r.request().url())?LIB+'x-jspdf/package/dist/jspdf.umd.min.js':LIB+'x-html2canvas/package/dist/html2canvas.min.js')}));
await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(400);
await p.evaluate(()=>{loadSample();S.tab='plan';S.planSeg='main';render();openReport();});
console.log(await p.evaluate(async()=>{const {h2c}=await pdfLibs();const src=document.querySelector('#report .rep');const host=document.createElement('div');host.style.cssText='position:fixed;left:-12000px;top:0;width:700px;background:#fff';const art=src.cloneNode(true);art.style.cssText='margin:0;padding:0;max-width:none;width:700px';host.appendChild(art);document.body.appendChild(host);
const pieces=[...art.children].flatMap(k=>pdfPieces(k,982));const out=[];for(const el of pieces){try{await h2c(el,{scale:1,logging:false});out.push('ok '+el.tagName+'.'+el.className+' '+Math.round(el.getBoundingClientRect().height))}catch(e){out.push('FAIL '+el.tagName+'.'+el.className+' '+el.outerHTML.slice(0,80)+' parent='+(el.parentNode&&el.parentNode.tagName)+' '+String(e&&e.message||e))}}return out.join('\n')}));
await b.close()})();
