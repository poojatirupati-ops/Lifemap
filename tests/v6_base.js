const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const ctx = await b.newContext({viewport:{width:390,height:844}, hasTouch:true}); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; }, sel);
  const CHECK = () => p.evaluate(() => { const m = document.getElementById('main').getBoundingClientRect(), t = document.querySelector('.tl-board').getBoundingClientRect(), ax = document.querySelector('.tl-axis').getBoundingClientRect(), ask = document.querySelector('.askfab').getBoundingClientRect(), foot = document.querySelector('.foot');
    const bottom = foot ? Math.min(m.bottom, foot.getBoundingClientRect().top) : m.bottom; const chips = [...document.querySelectorAll('.tl-chip')].map(c => c.getBoundingClientRect());
    const hit = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
    return {boardFull:t.top >= m.top - 0.5 && t.bottom <= bottom + 0.5, axisVisible:ax.top >= m.top && ax.bottom <= bottom, boardW:Math.round(t.width), mainW:Math.round(m.width), underAsk:chips.filter(c => hit(c, ask)).length, chipsOut:chips.filter(c => c.left < t.left - 1 || c.right > t.right + 1).length, headerInMain:!!document.querySelector('#main > .sky'), h:[Math.round(t.height), Math.round(bottom - m.top)]}; });
  // portrait: note on timeline (My Plan + builder step 3), not on the road
  await p.evaluate(() => { loadSample(); lastId = null; render(); }); await p.waitForTimeout(150);
  const out = {planNote:await vis('.tl-board ~ * .rotnote, .rotnote'), roadNote:await p.evaluate(() => !!document.querySelector('#r-glance .rotnote'))};
  out.noteAboveBoard = await p.evaluate(() => { const n = document.querySelector('.rotnote'), t = document.querySelector('.tl-board'); return n.nextElementSibling === t; });
  await p.screenshot({path: __dirname + '/build/v6-plan-portrait-note.png'});
  await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'F2')[2](); lastId = null; render(); }); out.builderNote = await vis('.rotnote'); await p.screenshot({path: __dirname + '/build/v6-builder-timeline-portrait.png'});
  // rotate on the builder timeline
  await p.setViewportSize({width:844, height:390}); await p.waitForTimeout(300); out.landNoteHidden = !(await vis('.rotnote')); out.landBuilder = await CHECK();
  await p.screenshot({path: __dirname + '/build/v6-builder-timeline-landscape.png'});
  // My Plan in landscape: rotate from portrait with the timeline on screen
  await p.setViewportSize({width:390, height:844}); await p.waitForTimeout(200); await p.evaluate(() => { loadSample(); lastId = null; render(); }); await p.waitForTimeout(100);
  await p.setViewportSize({width:844, height:390}); await p.waitForTimeout(300); out.landPlan = await CHECK(); await p.screenshot({path: __dirname + '/build/v6-plan-timeline-landscape.png'});
  // touch drag in landscape
  const chip = p.locator('.tl-chip:not(.ret)').first(), gid = await chip.getAttribute('data-g'), before = await chip.getAttribute('aria-valuenow'), bb = await chip.boundingBox(), sy0 = await p.evaluate(() => document.getElementById('main').scrollTop);
  const cdp = await ctx.newCDPSession(p); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x, y}]}); for (let k = 1; k <= 10; k++){ await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:x + k * 12, y:y + k}]}); await p.waitForTimeout(20); } await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]}); await p.waitForTimeout(300);
  out.drag = [before, await p.locator('.tl-chip[data-g="' + gid + '"]').getAttribute('aria-valuenow'), 'page scroll moved', (await p.evaluate(() => document.getElementById('main').scrollTop)) !== sy0];
  out.afterDrag = await CHECK();
  // bunched: 8 goals within 2 years, builder step 3 in landscape
  await p.evaluate(() => { JUMPS.flatMap(g => g[1]).find(x => x[0] === 'F2')[2](); S.goals = S.goals.filter(g => g.kind === 'retire'); ['home','family','edu','travel','business','safety','wedding','car'].forEach((k, j) => { const g = mkGoal(k); g.age = 40 + [0,0,1,1,1,2,2,2][j]; S.goals.push(g); }); lastId = null; render(); showTL(); }); await p.waitForTimeout(100);
  out.bunchedLand = await CHECK(); await p.screenshot({path: __dirname + '/build/v6-builder-timeline-landscape-bunched.png'});
  // road: no note in either orientation
  await p.evaluate(() => { loadSample(); lastId = null; render(); });
  await p.evaluate(() => { S.view = 'journey'; lastId = null; render(); }); out.roadNoteLand = await p.evaluate(() => !!document.querySelector('#r-glance .rotnote'));
  console.log(JSON.stringify(out, null, 1)); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
