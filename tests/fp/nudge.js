const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { loadSample(); S.fin.income = 110000; S.ans['6'] = 1; const before = project(); const txt = saveNudge().replace(/<[^>]+>/g, '');
    const btn = saveNudge().match(/data-p="(-?\d+)"/)[1]; ACT.savem(btn); const after = project();
    return {txt, saveBefore:before.save.saveM, saveAfter:after.save.saveM, pctBefore:S.goals.map(g => before.pct[g.id]), pctAfter:S.goals.map(g => after.pct[g.id]), nudgeAfter:saveNudge() === '', inDom:!!document.getElementById('r-savenudge') || 'n/a (not on results screen)'}; });
  console.log(JSON.stringify(r)); console.log('ERRORS', errs.length, errs); await b.close(); })();
