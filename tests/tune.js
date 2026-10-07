const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''}));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');
  const trials = JSON.parse(process.argv[2]);
  for (const t of trials) {
    const r = await p.evaluate(t => { loadSample(); Object.entries(t.fin || {}).forEach(([k, v]) => S.fin[k] = v); Object.entries(t.g || {}).forEach(([k, v]) => Object.assign(S.goals.find(g => g.k === k), v)); if (t.R) setRetireAge(t.R);
      const P = project(); const sh = P.rows.filter(isShort).map(r => r.a); return S.goals.map(g => g.k + ':' + P.pct[g.id]).join(' ') + ' | short ages: ' + (sh.length ? sh[0] + '..' + sh[sh.length-1] + ' (' + sh.length + ')' : 'none') + ' | extra edu ' + extraFor(S.goals.find(g=>g.k==='edu')); }, t);
    console.log(JSON.stringify(t), '=>', r);
  }
  await b.close(); })();
