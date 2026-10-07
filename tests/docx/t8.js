const { open } = require('./lib');
(async () => { const { browser, page, errors } = await open(); const d = require('./drive')(page);
  const ids = await page.evaluate(() => CALCS.map(c => c.id));
  for (const id of ids) { await d.base('fresh'); await d.calc(id); const g = await page.evaluate(id => [calcMissing(C(id)).join(', '), (document.querySelector('#cgate b') || {}).textContent], id);
    await d.base('chosen'); await d.calc(id, true); const m = await page.evaluate(id => calcMissing(C(id)).join(', '), id); console.log(id, '| fresh:', g[0], '|', g[1], '| chosen missing:', m); }
  console.log(errors); await browser.close(); })();
