const { open } = require('./lib');
(async () => { const { browser, page, errors } = await open();
  const r = await page.evaluate(() => CALCS.map(c => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; render(); ACT.calc(c.id);
    const diffs = c.inputs.concat(c.wi||[]).map(i => { const box = document.getElementById('co-' + i.k).value, rg = document.getElementById('c-' + i.k); return [i.k, i.v, box, rg.value, rg.max]; }).filter(x => nbFmt(x[1]) !== x[2] || String(x[1]) !== x[3]);
    return c.id + ' ' + JSON.stringify(diffs); }));
  console.log(r.join('\n'), errors); await browser.close(); })();
