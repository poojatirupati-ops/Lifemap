const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''}));
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');
  for (const t of JSON.parse(process.argv[2])) {
    const r = await p.evaluate(t => { loadSample(); Object.entries(t.fin || {}).forEach(([k, v]) => S.fin[k] = v); Object.entries(t.g || {}).forEach(([k, v]) => Object.assign(S.goals.find(g => g.k === k), v)); if (t.R) setRetireAge(t.R);
      const P = project(); const out = S.goals.map(g => g.k + ':' + P.pct[g.id]).join(' ');
      const w = S.goals.slice().sort((a,b)=>P.pct[a.id]-P.pct[b.id])[1]; const P2 = project({g:w.id, m:150, l:0});
      return out + ' | 2nd-worst ' + w.k + ' +150/mo -> ' + P2.pct[w.id] + ' | extra edu ' + extraFor(S.goals.find(g=>g.k==='edu')); }, t);
    console.log(JSON.stringify(t), '=>', r); }
  console.log('errs', errs); await b.close(); })();
