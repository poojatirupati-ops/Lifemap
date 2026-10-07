const { chromium } = require('playwright');
const URL = 'file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html';
const CHECK = () => { const sv = document.querySelector('#r-glance svg[role=img]'), m = document.getElementById('main').getBoundingClientRect(), ask = document.querySelector('.askfab').getBoundingClientRect();
  const els = [...sv.querySelectorAll('circle, text, path')].filter(e => !(e.tagName === 'path' && e.getAttribute('d').length > 60)); // markers, labels, flag, age axis
  const inside = r => r.left >= m.left - 0.5 && r.right <= m.right + 0.5 && r.top >= m.top - 0.5 && r.bottom <= m.bottom + 0.5;
  const hit = (a, c) => a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5;
  const out = els.filter(e => !inside(e.getBoundingClientRect())).map(e => e.tagName + ':' + (e.textContent || '').slice(0, 12));
  const underAsk = els.filter(e => hit(e.getBoundingClientRect(), ask)).map(e => e.tagName + ':' + (e.textContent || '').slice(0, 12));
  const bx = [...sv.querySelectorAll('circle[r="13"],circle[r="18"]')].map(e => e.getBoundingClientRect()), tx = [...sv.querySelectorAll('text')].filter(t => !/^age \d/.test(t.textContent) && !['12.5','16','18'].includes(t.getAttribute('font-size'))).map(e => e.getBoundingClientRect());
  const ce = [...sv.querySelectorAll('circle[r="13"],circle[r="18"]')], te = [...sv.querySelectorAll('text')].filter(t => !/^age \d/.test(t.textContent) && !['12.5','16','18'].includes(t.getAttribute('font-size'))), lab = e => e.tagName === 'circle' ? 'ring@' + Math.round(e.getAttribute('cx')) : e.textContent.slice(0, 14);
  let o = 0; const pairs = []; const all = ce.concat(te); for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { if (all[i].tagName === 'text' && all[j].tagName === 'circle') continue; if (hit(all[i].getBoundingClientRect(), all[j].getBoundingClientRect())) { o++; pairs.push(lab(all[i]) + ' x ' + lab(all[j])); } }
  const s = sv.getBoundingClientRect(); return {checked:els.length, outside:out, underAsk, overlaps:o, pairs, svg:[Math.round(s.width), Math.round(s.height)], main:[Math.round(m.top), Math.round(m.bottom)], tabsH:document.querySelector('.tabs').offsetHeight, headerInMain:!!document.querySelector('#main > .sky')}; };
(async () => { const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({viewport:{width:844,height:390}, hasTouch:true}); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto(URL); await p.waitForTimeout(300);
  for (const [name, setup] of [['sample', () => {}], ['sample+home42', () => { S.goals.push(mkGoal('home')); S.goals.find(g => g.k === 'home').age = 42; }], ['sample+wedding+car', () => { S.goals.push(mkGoal('wedding')); S.goals.push(mkGoal('car')); }]]) {
    await p.evaluate(fn => { loadSample(); new Function('(' + fn + ')()')(); S.view = 'journey'; lastId = null; render(); showRoad(); }, setup.toString()); await p.waitForTimeout(150);
    console.log('landscape', name, JSON.stringify(await p.evaluate(CHECK)));
    if (name === 'sample') await p.screenshot({path: __dirname + '/build/l-road-fit.png'}); }
  // rotate from portrait with the Journey on screen
  await p.setViewportSize({width:390, height:844}); await p.waitForTimeout(200);
  await p.evaluate(() => { loadSample(); S.view = 'journey'; lastId = null; render(); document.getElementById('r-glancec').scrollIntoView({block:'start', behavior:'instant'}); }); await p.waitForTimeout(100);
  await p.setViewportSize({width:844, height:390}); await p.waitForTimeout(300);
  console.log('rotated to landscape', JSON.stringify(await p.evaluate(CHECK))); await p.screenshot({path: __dirname + '/build/l-road-after-rotate.png'});
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
