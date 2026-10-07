// Shared browser helpers for capture.js and check.js
const { BASES } = require('./states');
module.exports = page => {
  const clearToast = () => page.evaluate(() => { document.getElementById('toast').innerHTML = ''; });
  const base = async b => { await page.setViewportSize({ width: 390, height: 844 });
    if (b.startsWith('stmt:')) { const [cat, ed] = b.slice(5).split('|'), edit = ed ? Object.fromEntries(ed.split(',').map(x => x.split('='))) : {}; await page.evaluate(`(${BASES.sample.toString()})()`); await page.evaluate(([cat, edit]) => { const T = DOCT[cat]; S.pst = { cat, stage: 'confirm', files: [T.title + ' · ' + T.date + '.pdf'], edit }; pstConfirm(); }, [cat, edit]); await clearToast(); return; }
    await page.evaluate(`(${BASES[b].toString()})()`); };
  const calc = async (id, fill) => { await page.evaluate(id => ACT.calc(id), id); if (fill) await fillBlanks(id); };
  // type the CALCS example value into every input still blank (type-2 values local to a tool, retirement ages)
  const fillBlanks = async id => { for (let n = 0; n < 12; n++) { const k = await page.evaluate(id => { const c = C(id), v = calcVals(c), i = c.inputs.concat(c.wi || []).find(x => v[x.k] == null); return i ? [i.k, i.v, !!CHIP_OPTS[i.u]] : null; }, id); if (!k) return;
      if (k[2]) await page.click('[data-a="ckset"][data-p="' + k[0] + '|' + k[1] + '"]'); else { await page.fill('#co-' + k[0], String(k[1])); await page.press('#co-' + k[0], 'Enter'); } } };
  const set = async (k, v) => { const chip = await page.$('[data-a="ckset"][data-p="' + k + '|' + v + '"]');
    if (chip) { await chip.click(); return; }
    await page.fill('#co-' + k, String(v)); await page.evaluate(() => document.activeElement && document.activeElement.blur()); };
  const num = id => page.evaluate(id => { const c = C(id), m = calcMissing(c); if (m.length) return { num: null, goal: null, missing: m }; const r = c.run(calcVals(c)); return { num: r.num, goal: r.goal, missing: [] }; }, id);
  return { clearToast, base, calc, set, num, fillBlanks };
};
