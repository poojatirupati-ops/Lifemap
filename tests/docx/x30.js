const { open } = require('./lib');
(async () => { const { browser, page } = await open(); await page.setViewportSize({width:390,height:2600});
console.log(await page.evaluate(() => { loadSample(); S.lists.mort2 = [newItem('mort2')]; S.lists.mort2[0].f.owed = '180000'; syncLists(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; lastId = null; render(); return [...document.querySelectorAll('#main .card')].map(c=>c.innerText.replace(/\s+/g,' ').slice(0,300)).join('\n'); }));
await browser.close()})();
