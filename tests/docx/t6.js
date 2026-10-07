const { open } = require('./lib'); const extract = require('./extract');
(async () => { const { browser, page } = await open();
 await page.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; render(); ACT.calc('debtpay'); });
 await page.fill('#co-p', '50'); await page.evaluate(() => document.activeElement.blur()); console.log(JSON.stringify((await page.evaluate(extract)).result)); await browser.close(); })();
