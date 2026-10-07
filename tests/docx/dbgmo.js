const { open } = require('./lib');
(async () => { const { browser, page } = await open();
 const r = await page.evaluate(async () => { const o = {}; loadSample(); S.asm = Object.assign({}, S.asm); delete S.asm.safetyMonths; applyAssume(); syncSafety(); S.app = false; S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.calc('emergency');
   const b = document.getElementById('co-mt'); b.value = '3'; b.dispatchEvent(new Event('input', { bubbles: true })); b.blur(); o.a = [S.asm.safetyMonths, document.querySelector('#cout .card p').textContent];
   setSafetyMonths(4); S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.calc('emergency'); o.b = [S.asm.safetyMonths, document.getElementById('co-mt').value, document.querySelector('#cout .card p').textContent, JSON.stringify(S.calcT && S.calcT.emergency)]; return o; });
 console.log(JSON.stringify(r)); await browser.close(); })();
