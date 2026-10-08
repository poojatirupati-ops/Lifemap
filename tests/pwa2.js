const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|fonts\.gstatic|ERR_/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://localhost:8766/index.html'); await p.waitForTimeout(1500);
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return r.active && r.active.state; });
  const man = await p.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); const r = await fetch(l.href); const j = await r.json(); return [r.status, j.name, j.icons.length]; });
  const icons = await p.evaluate(async () => Promise.all(['icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].map(u => fetch(u).then(r => r.status))));
  const start = await p.$('.cover .wbtn'); await start.click(); await p.waitForTimeout(500);
  const h = await p.textContent('h2'); 
  await p.reload(); await p.waitForTimeout(800);
  await ctx.setOffline(true); await p.reload().catch(() => {}); await p.waitForTimeout(800);
  const offlineOk = await p.evaluate(() => !!document.querySelector('.cover, #app, body') && document.body.innerText.length > 20);
  console.log(JSON.stringify({ sw, man, icons, afterStart: h, offlineOk, errs }));
  await b.close();
})();
