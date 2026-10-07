const { open } = require('./lib');
(async () => { const { browser, page, errors } = await open();
  const r = await page.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; render(); ACT.calc('retirement');
    return [document.fonts.check('16px Figtree'), document.fonts.check('16px "Bricolage Grotesque"'), document.querySelector('#screen').innerText.slice(0, 1500)]; });
  console.log(r, errors); await page.screenshot({ path: 'shots/test.png' }); await browser.close(); })();
