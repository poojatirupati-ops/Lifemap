// §17 checks: Q8 Irish tone everywhere it shows, Explore order and Calculators rows, Ask hidden on onboarding and shown in the app
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const FILE = 'file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html', ORIG = process.argv[2];
(async () => { const b = await chromium.launch(); let pass = 0; const fail = []; const ok = (c, w) => c ? pass++ : fail.push(w); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT/.test(m.text())) errs.push(m.text()); });
  const o = await b.newPage(); await o.goto('file://' + ORIG); await p.goto(FILE); await p.waitForTimeout(300); await o.waitForTimeout(300);
  const Q = { q: 'Pick your road for your long-term money.', sub: 'The motorway is steady but slower. The mountain pass has more twists and turns, and more room to grow.', o: [['🛣️', 'Straight up the motorway', 'Low risk'], ['🏞️', 'A quiet country road', 'Cautious'], ['🌿', 'Up and down the boreens', 'Balanced'], ['🏔️', 'Over the Healy Pass, hairpins and all', 'High risk']] };
  const q8 = await p.evaluate(() => { const q = DQ.find(x => x.id === '8'); return { q: q.q, sub: q.sub, o: q.o.map(x => [x.e, x.t, x.tag]), sc: q.o.map(x => [x.s, x.path]), w: PW['8'] }; });
  const q80 = await o.evaluate(() => { const q = DQ.find(x => x.id === '8'); return { sc: q.o.map(x => [x.s, x.path]), tags: q.o.map(x => x.tag), w: PW['8'] }; });
  ok(q8.q === Q.q && q8.sub === Q.sub, 'Q8 question and sub'); ok(JSON.stringify(q8.o) === JSON.stringify(Q.o), 'Q8 answers ' + JSON.stringify(q8.o));
  ok(JSON.stringify(q8.sc) === JSON.stringify(q80.sc) && JSON.stringify(q8.w) === JSON.stringify(q80.w) && JSON.stringify(q8.o.map(x => x[2])) === JSON.stringify(q80.tags), 'Q8 scores, line shapes, tags and weights unchanged');
  await p.evaluate(() => { S = fresh(); S.scr = 'D5'; S.di = 3; lastId = null; render(); });
  const scr = await p.evaluate(() => ({ h: document.querySelector('#screen h2').textContent, sub: document.querySelector('.qsub').textContent, o: [...document.querySelectorAll('.opt')].map(e => [e.querySelector('.tx').textContent, e.querySelector('.otag').textContent, !!e.querySelector('svg path'), e.getBoundingClientRect().right <= innerWidth]) }));
  ok(scr.h === Q.q && scr.sub === Q.sub && scr.o.every((x, i) => x[0] === Q.o[i][1] && x[1] === '◆ ' + Q.o[i][2] && x[2] && x[3]), 'Q8 screen ' + JSON.stringify(scr));
  // answer echoed back: pick each answer, then the reveal, Me > first answers, the report
  for (let k = 0; k < 4; k++) { const t = await p.evaluate(k => { loadSample(); S.ans['8'] = k; S.tab = 'me'; S.me = 'recheck'; lastId = null; render(); const a = document.getElementById('screen').innerText; openReport(); const r = document.getElementById('report').innerText; document.getElementById('report').classList.remove('on'); return [a, r]; }, k);
    ok(t[0].includes(Q.o[k][1]) || t[0].includes(Q.q), 'Me re-check shows Q8 answer ' + k); ok(!/Flat and steady|Gentle hills|Hills and dips|Mountain road|forecast|Stormy/i.test(t[0] + t[1]), 'no old Q8 wording, answer ' + k); }
  ok((await p.textContent('#jumps')).includes('Question 4 (road)'), 'sidebar says Question 4 (road)');
  // Explore order and Calculators rows
  for (const [name, fn] of [['before a plan', () => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); }], ['sample plan', () => { loadSample(); S.tab = 'explore'; S.xs = []; lastId = null; render(); }]]) {
    await p.evaluate(fn); const ex = await p.evaluate(() => ({ secs: [...document.querySelectorAll('#main .sec h3')].map(h => h.textContent), rows: [...document.querySelectorAll('#main [data-a="cat"]')].map(r => ({ cls: r.className, ic: (r.querySelector('.ic') || {}).textContent, b: (r.querySelector('b') || {}).textContent, s: (r.querySelector('.small') || {}).textContent, chev: !!r.querySelector('.chev') })), tiles: document.querySelectorAll('#main .ctile[data-a="cat"], #main .grid2 [data-a="cat"]').length, cats: CATS.map(c => [c.id, c.em, c.name, c.blurb, CALCS.filter(x => x.cat === c.id).length]), tools: document.querySelectorAll('#main .hstrip > *').length, vids: document.querySelectorAll('#main .vthumb').length, last: [...document.querySelectorAll('#main > *')].slice(-2).map(e => e.className) }));
    const want = (name === 'sample plan' && ex.secs[0] === 'What-ifs for your goals' ? ['What-ifs for your goals'] : []).concat(['Focus on one area', 'Tools for you', 'Watch · picked for you', 'Calculators']);
    ok(JSON.stringify(ex.secs) === JSON.stringify(want), 'Explore order (' + name + '): ' + ex.secs.join(' → '));
    { const badr = ex.rows.filter((r, i) => !(r.cls === 'goal' && r.ic === ex.cats[i][1] && r.b === ex.cats[i][2] && r.s === ex.cats[i][3] + ' · ' + ex.cats[i][4] + ' tools' && r.chev)); ok(ex.tiles === 0 && ex.rows.length === 6 && !badr.length, 'Calculators rows (' + name + ') ' + ex.rows.length + ' ' + JSON.stringify(badr)); }
    ok(ex.tools > 0 && ex.vids > 0, 'Tools for you and videos still there (' + name + ')'); ok(ex.last[ex.last.length - 1] === 'disc', 'disclaimer last'); }
  for (const c of ['home', 'retire', 'invest', 'savings', 'protect', 'everyday']) { await p.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); }); await p.click('[data-a="cat"][data-p="' + c + '"]');
    const g = await p.evaluate(c => ({ h: document.querySelector('header.sky h2').textContent, n: document.querySelectorAll('#main [data-a="calc"]').length, want: CATS.find(x => x.id === c), cnt: CALCS.filter(x => x.cat === c).length, pst: !!document.querySelector('.card.pst') }), c);
    ok(g.h.includes(g.want.name) && g.n === g.cnt, 'group ' + c + ' opens with ' + g.n + ' calculators'); ok(g.pst === ['home', 'retire', 'invest'].includes(c), 'statement card on ' + c + ': ' + g.pst); }
  await p.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.cat('home'); }); await p.click('text=Use a sample statement'); await p.waitForTimeout(200);
  const up = await p.evaluate(() => document.getElementById('screen').innerText); ok(/Secure your account|Reading your statement|We read these values/.test(up), 'statement upload still starts from a category page');
  // Ask button: hidden on onboarding (and its sheets), shown from the app on
  const askOn = () => p.evaluate(() => !!document.querySelector('#screen .askfab'));
  await p.evaluate(() => { S = fresh(); lastId = null; render(); }); ok(!(await askOn()), 'no Ask on D0');
  for (const sh of ['whyask', 'invite']) { await p.evaluate(sh => { S.sheet = sh; render(); }, sh); ok(!(await askOn()), 'no Ask on D0 with sheet ' + sh); await p.keyboard.press('Escape'); }
  await p.click('.cover .wbtn'); ok(!(await askOn()), 'no Ask on D1'); await p.click('.qfoot .qback');
  for (let i = 0; i < 6; i++) { ok(!(await askOn()), 'no Ask on Discover question ' + (i + 1)); await p.click('.opt >> nth=1'); await p.waitForTimeout(450); }
  const at = () => p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]);
  ok((await at()) === 'DR' && !(await askOn()), 'no Ask on the reveal (' + await at() + ')');
  await p.click('text=Get a more accurate picture: make my plan'); ok((await at()) === 'DS' && !(await askOn()), 'no Ask on Save your results');
  await p.evaluate(() => { S.sheet = 'saveprompt'; render(); }); ok(!(await askOn()), 'no Ask on Save your results with a sheet'); await p.keyboard.press('Escape');
  await p.click('[data-a="dsskip"]'); ok(await askOn(), 'Ask shown once in the app (' + await at() + ')');
  for (const t of ['explore', 'plan', 'me', 'exp', 'home']) { await p.click('[data-a="tab"][data-p="' + t + '"]'); ok(await askOn(), 'Ask on tab ' + t + ' (' + await at() + ')'); }
  await p.click('[data-a="tab"][data-p="plan"]'); await p.click('[data-a="makeplan"]'); ok(await askOn(), 'Ask in the plan builder (' + await at() + ')');
  await p.click('.askfab'); ok(await p.evaluate(() => !!document.querySelector('.sheet .askq')), 'Ask still opens the help sheet');
  const jl = await p.evaluate(() => { const out = []; JUMPS.forEach(g => g[1].forEach(j => { document.getElementById('report').classList.remove('on'); j[2](); lastId = null; render(); out.push([j[0], current().id, !!document.querySelector('#screen .askfab')]); })); return out; });
  jl.forEach(([j, id, on]) => ok(on === !/^D([0-7]|R|S)$/.test(id), 'jump ' + j + ' (' + id + '): Ask ' + (on ? 'shown' : 'hidden')));
  ok(errs.length === 0, 'console errors: ' + errs.join(' | '));
  console.log('PASS', pass, 'FAIL', fail.length); fail.forEach(f => console.log(' -', f)); await b.close(); })();
