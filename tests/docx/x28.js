const { open } = require('./lib');
(async () => { const { browser, page } = await open(); await page.setViewportSize({width:390,height:2300});
console.log(JSON.stringify(await page.evaluate(() => { loadSample(); S.lists.mort2 = [newItem('mort2')]; S.lists.mort2[0].f.owed = '180000'; syncLists(); S.app = true; S.shell = true; S.tab = 'plan'; lastId = null; render();
 const ci = checkItems().map(x => [x.k, x.st, (x.msg||'').slice(0,100)]); const ar = assumeRows().filter(r=>/mortgage|other/i.test(r[0])).map(r=>r.slice(0,3)); 
 return {ci: ci.filter(x=>/mort/i.test(JSON.stringify(x))), ar, mort2src: typeof MORT2_ASSUMED !== 'undefined' ? MORT2_ASSUMED : null, n: missingFlags().length, src: JSON.stringify(Object.keys(window).filter(k=>/mort2/i.test(k)))}; })));
await browser.close()})();
