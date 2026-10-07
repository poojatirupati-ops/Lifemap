const { open } = require('./lib');
(async () => { const { browser, page } = await open(); const d = require('./drive')(page);
  await d.base('fresh'); await d.calc('goalplanner'); await d.set('y', 2.5); console.log(await page.evaluate(() => [document.getElementById('co-y').value, document.querySelector('#cout').innerText.slice(0,200)]));
  await d.base('fresh'); await d.calc('emergency'); await d.set('mt', 2.5); console.log(await page.evaluate(() => [document.getElementById('co-mt').value, document.querySelector('#cout').innerText.slice(0,200)]));
  await browser.close(); })();
