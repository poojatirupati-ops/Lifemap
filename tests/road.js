const { chromium } = require('playwright');
const URL = 'file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
const CASES = {
  a: () => {},
  b: () => { S.goals.push(mkGoal('wedding')); S.goals.push(mkGoal('car')); },
  c: () => { S.goals = S.goals.filter(g => g.kind === 'retire'); ['home','family','edu','travel','business','safety','wedding','car'].forEach((k, j) => { const g = mkGoal(k); g.age = 40 + [0,0,1,1,1,2,2,2][j]; S.goals.push(g); }); },
};
const CHECK = () => { const sv = document.querySelector('#r-glance svg[role=img]'), m = document.getElementById('main').getBoundingClientRect();
  const hit = (a, c) => a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5;
  const ce = [...sv.querySelectorAll('circle[r="13"],circle[r="18"]')], te = [...sv.querySelectorAll('text')].filter(t => !/^age \d/.test(t.textContent) && !['12.5','16','18'].includes(t.getAttribute('font-size')));
  const extra = [...sv.querySelectorAll('path')].filter(e => e.getAttribute('d').length < 60).concat([...sv.querySelectorAll('text[font-size="18"]')]); // flag + sunset
  const lab = e => e.tagName === 'circle' ? 'ring@' + Math.round(e.getAttribute('cx')) : e.tagName === 'path' ? 'flag' : e.textContent.slice(0, 14);
  const all = ce.concat(te, extra); let o = 0; const pairs = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { if (all[i].tagName === 'text' && all[j].tagName === 'circle' && all[i].getAttribute('font-size') !== '11') continue; if (hit(all[i].getBoundingClientRect(), all[j].getBoundingClientRect())) { o++; pairs.push(lab(all[i]) + ' x ' + lab(all[j])); } }
  const inside = r => r.left >= m.left - 0.5 && r.right <= m.right + 0.5 && r.top >= m.top - 0.5 && r.bottom <= m.bottom + 0.5;
  const out = [...sv.querySelectorAll('circle, text, path')].filter(e => !(e.tagName === 'path' && e.getAttribute('d').length > 60) && !inside(e.getBoundingClientRect())).length;
  return {rings:ce.length, overlaps:o, pairs, outsideMain:out, rot:!!document.querySelector('.rotnote') && getComputedStyle(document.querySelector('.rotnote')).display !== 'none'}; };
(async () => { const b = await chromium.launch(); const errs = []; let bad = 0;
  for (const [o, vp] of [['portrait', {width:390, height:844}], ['land', {width:844, height:390}]]) {
    const ctx = await b.newContext({viewport:vp, hasTouch:true}); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
    await p.goto(URL); await p.waitForTimeout(300);
    for (const [k, fn] of Object.entries(CASES)) {
      await p.evaluate(fn => { loadSample(); new Function('(' + fn + ')()')(); S.view = 'journey'; lastId = null; render(); showRoad(); }, fn.toString()); await p.waitForTimeout(150);
      const r = await p.evaluate(CHECK); if (r.overlaps) bad++; console.log(o, k, JSON.stringify(r));
      const f = __dirname + '/build/road-' + k + '-' + o + '.png';
      if (o === 'portrait') await p.locator('#r-glancec').screenshot({path:f}); else await p.screenshot({path:f});
    }
    await ctx.close(); }
  console.log('BAD', bad, 'ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
