const fs=require('fs'),JSZip=require('jszip'); const { open } = require('./lib');
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const ent = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');
eval(fs.readFileSync('../pd.js','utf8'));
(async()=>{ const { browser, page } = await open();
 for (const f of ['/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx','pdf/mut.docx']) { const z=await JSZip.loadAsync(fs.readFileSync(f)); const secs=parseDoc(await z.file('word/document.xml').async('string')); const s4=secs.find(s=>s.title.startsWith('4. Your finances'));
  await page.evaluate(() => { loadSample(); delete S.fin.mortPayM; delete S.src.mortPayM; delete S.fin.ip; delete S.src.ip; S.look.homeValue = 'This looks high for the area'; S.app = false; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.checked = false; lastId = null; render(); });
  const ck = await page.evaluate(() => [...document.querySelectorAll('#main .ck')].map(c => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return [t(c.querySelector('.i')), t(c.querySelector('b')), t(c.querySelector(':scope > div > div.small'))]; }));
  const ckT = s4.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Icon'); console.log(JSON.stringify(ck.slice(1,3))); console.log(f.slice(-12), JSON.stringify(ck.map(r=>[r[1], !!ckT.rows.some(x => x[0] === r[0] && x[1] === r[1] && x[3] === r[2])]))); if(f.includes('mut')) console.log(JSON.stringify(ckT.rows.slice(0,4))); }
 await browser.close(); })();
