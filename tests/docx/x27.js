const { open } = require('./lib');
(async () => { const { browser, page, errors } = await open(); await page.setViewportSize({width:390,height:2300});
const ev=f=>page.evaluate(f);
console.log(await ev(() => { loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.retireSet = false; S.infl = null; S.asm = {}; S.pRetSet=false; S.checked = false; lastId = null; render(); const m=document.getElementById('main'); return [...m.querySelectorAll(':scope > *')].map(e=>(e.id||e.className)+' :: '+e.innerText.replace(/\s+/g,' ').slice(0,260)).join('\n') + '\nIDS: ' + ['p4-need','seeres','skipres','p4-count','p4-3','p4-rest'].map(i=>i+'='+!!document.getElementById(i)).join(' ')}));
await browser.close()})();
