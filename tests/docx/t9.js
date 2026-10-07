const { open } = require('./lib');
(async () => { const { browser, page, errors } = await open();
  const r = await page.evaluate(() => { loadSample(); S.asm = {}; S.infl = null; S.retireSet = false; S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; lastId = null; render();
    const a = document.querySelector('#screen').innerText.slice(0, 2500);
    loadSample(); S.sheet = 'assume'; render(); const b = document.querySelector('.sheet').innerText.slice(0, 3000); return [a, b]; });
  console.log(r[0]); console.log('======'); console.log(r[1]); console.log(errors); await browser.close(); })();
