const { open } = require('./lib');
(async () => { const { browser, page } = await open();
console.log(JSON.stringify(await page.evaluate(() => { S = fresh(); S.shell = true; S.app = false; S.infl = 0.02; S.retireSet = true; S.retireAge = 66; S.asm = {planEnd: 90, mortRate: 0.0375}; applyAssume(); const c = C('rentbuy'); S.xs=[{v:'CALC',p:'rentbuy'}]; const v = calcVals(c); const r = c.run(v); const h=document.createElement('div'); h.innerHTML=asmInput('depEarn'); return {num: r.num, v, dep:[h.textContent.slice(0,300)], miss: calcMissing(c)}; }), null, 0));
await browser.close()})();
