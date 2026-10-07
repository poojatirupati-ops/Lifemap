const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const out = {}; loadSample(); render(); out.ready = planReady(); out.miss = planMissing(); out.sp = finNums().sp; out.pSp = finNums().pSp;
    S = fresh(); out.freshMiss = planMissing().map(x => x.k);
    const ids = JUMPS.flatMap(g => g[1]); out.bad = []; ids.forEach(([id, l, fn]) => { try { fn(); lastId = null; render(); } catch (e) { out.bad.push(id + ': ' + e.message); } });
    loadSample(); S.sheet = 'assume'; render(); out.sheet = document.querySelector('.sheet') ? document.querySelector('.sheet').innerText.slice(0, 300) : 'nosheet';
    return out; });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS', errs.length, JSON.stringify(errs.slice(0, 5))); await b.close(); })();
