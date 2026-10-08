const { open } = require('./lib');
(async () => { const { browser, page } = await open();
console.log(JSON.stringify(await page.evaluate(() => { const o = {}; const cnt = () => { render(); return [...document.querySelectorAll('#main .field.asmf')].map(f => f.dataset.k); };
 loadSample(); S.app = true; S.shell = true; S.tab = 'me'; S.me = 'asm'; lastId = null; const a = cnt(); o.sample = [a.length, new Set(a).size];
 S = fresh(); S.shell = true; S.app = true; S.tab = 'me'; S.me = 'asm'; const b = cnt(); o.fresh = [b.length, new Set(b).size, b.filter(k=>/^(retireAge|pRetireAge|planEnd)$/.test(k))];
 S.about.partner = false; const c = cnt(); o.nopartner=[c.length]; o.inflBox = !!document.querySelector('#main .infl'); o.set = Object.keys(SETTINGS.s).length; o.asmKeys = ASM_KEYS().length; return o; })));
await browser.close()})();
