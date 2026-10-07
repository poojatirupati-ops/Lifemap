// §16 checks on the live prototype: cover copy, D1, goal tile, Q8 road wording everywhere, no "LifeGoals"/weather wording on any screen
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs = require('fs');
const FILE = 'file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html', ORIG = process.argv[2];
(async () => { const b = await chromium.launch(); let pass = 0; const fail = []; const ok = (c, w) => c ? pass++ : fail.push(w);
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
  await p.goto(FILE); await p.waitForTimeout(300);
  const t = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, s);
  ok(await p.title() === 'LifeMap Prototype', 'title');
  ok(await t('.cover .brand') === 'LifeMap', 'logo'); ok(await t('.cover h2') === "The life you'd like, mapped out.", 'headline'); ok(await t('.cover-line') === 'A life map that guides you, step by step.', 'line'); ok(await t('.cover-under') === 'An easy tool, built for you.', 'under button');
  ok(await t('.cover .wbtn') === "Let's start", 'button'); const sm = await p.$$eval('.cover-small', a => a.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(sm.length === 1 && sm[0] === 'Why we ask', 'small lines ' + sm); const cov = await p.evaluate(() => [...document.querySelectorAll('.cover .brand, .cover-inv, .cover h2, .cover-line, .cover .wbtn, .cover-under, .cover .link')].map(e => e.textContent.trim()).join(' | ')); const covAll = await p.evaluate(() => document.querySelector('.cover').innerText.replace(/\s+/g, ' ').trim()); ok(cov === "LifeMap | I have an invite | The life you'd like, mapped out. | A life map that guides you, step by step. | Let's start | An easy tool, built for you. | Why we ask" && covAll === "LifeMap I have an invite The life you'd like, mapped out. A life map that guides you, step by step. Let's start An easy tool, built for you. Why we ask", 'cover is only the agreed copy: ' + covAll); ok(await t('.cover-inv') === 'I have an invite', 'invite');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.cover-photo')).backgroundImage.startsWith('url("data:image/svg+xml')), 'photo slot uses --cover-photo');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.textContent === "The life you'd like, mapped out."), 'focus on headline');
  await p.click('.cover-inv'); ok(await t('.sheet h2') === 'Enter your invite code', 'invite sheet'); await p.keyboard.press('Escape');
  await p.click('.cover .link'); ok(await t('.sheet h2') === 'Why we ask', 'why we ask sheet'); await p.keyboard.press('Escape');
  await p.click('.cover .wbtn'); ok(await t('#screen h2') === 'What brings you to LifeMap today?', 'D1 title'); ok(await p.getAttribute('[role=group][aria-label]', 'aria-label') === 'What brings you to LifeMap today?', 'D1 group label');
  const chips = await p.$$eval('[data-a="why"]', a => a.map(e => e.textContent.trim())); const o = await b.newPage(); await o.goto('file://' + ORIG); await o.waitForTimeout(300); await o.click('text=Start · about 1 min'); const chips0 = await o.$$eval('[data-a="why"]', a => a.map(e => e.textContent.trim()));
  ok(JSON.stringify(chips) === JSON.stringify(chips0) && chips.includes('🛟Building a safety net for emergencies'), 'D1 chips unchanged');
  await p.evaluate(() => { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'F1'; lastId = null; render(); });
  const tile = await p.evaluate(() => { const e = document.querySelector('.gtile[data-p="safety"]'); return [e.querySelector('.nm').textContent, !!e.querySelector('.ghint')]; }); ok(tile[0] === 'Emergency fund' && !tile[1], 'goal tile ' + tile);
  await p.evaluate(() => { S = fresh(); S.scr = 'D5'; S.di = 3; lastId = null; render(); });
  const q8 = await p.evaluate(() => ({ h: document.querySelector('#screen h2').textContent, s: document.querySelector('.qsub').textContent, o: [...document.querySelectorAll('.opt')].map(e => [e.querySelector('.em').textContent, e.querySelector('.tx').textContent, e.querySelector('.otag').textContent, !!e.querySelector('svg path')]) }));
  ok(q8.h === 'Pick a road for your long-term money.' && q8.s === 'A flat road is steady but slower. A hilly road has bigger ups and downs, with more growth potential.', 'Q8 question');
  ok(JSON.stringify(q8.o) === JSON.stringify([['🛣️', 'Flat and steady', '◆ Low risk', true], ['🏞️', 'Gentle hills', '◆ Cautious', true], ['⛰️', 'Hills and dips', '◆ Balanced', true], ['🏔️', 'Mountain road, but exciting', '◆ High risk', true]]), 'Q8 options ' + JSON.stringify(q8.o));
  ok(await p.evaluate(() => JSON.stringify(DQ.find(q => q.id === '8').o.map(x => [x.s, x.path]))) === await o.evaluate(() => JSON.stringify(DQ.find(q => q.id === '8').o.map(x => [x.s, x.path]))), 'Q8 scores and line shapes unchanged');
  ok(await p.evaluate(() => JSON.stringify(PW['8'])) === await o.evaluate(() => JSON.stringify(PW['8'])), 'Q8 personality weights unchanged');
  ok((await p.textContent('#jumps')).includes('Question 4 (road)') && !(await p.textContent('#jumps')).includes('forecast'), 'sidebar jump list');
  // every jump-list screen, the report and the sheets: no old brand or weather wording for Q8
  const BAD = /LifeGoals(?! 2\.0)|forecast|Calm and steady|Mostly sunny|Sunshine and showers|Stormy|rainy day/i, BAD2 = /Build a safety net|Safety net\b/; const n = await p.evaluate(() => JUMPS.reduce((a, g) => a + g[1].length, 0)); let seen = 0, q8shown = 0;
  for (let gi = 0; ; gi++) { const len = await p.evaluate(gi => JUMPS[gi] ? JUMPS[gi][1].length : -1, gi); if (len < 0) break;
    for (let k = 0; k < len; k++) { const txt = await p.evaluate(([gi, k]) => { JUMPS[gi][1][k][2](); lastId = null; render(); return [JUMPS[gi][1][k][0], document.getElementById('screen').innerText + ' ' + document.getElementById('curid').textContent]; }, [gi, k]);
      seen++; const m = txt[1].match(BAD) || txt[1].match(BAD2); ok(!m, 'screen ' + txt[0] + ' shows "' + (m && m[0]) + '"'); if (/Flat and steady|Gentle hills|Hills and dips|Mountain road/.test(txt[1])) q8shown++; } }
  await p.evaluate(() => { loadSample(); S.ans['8'] = 3; render(); openReport(); }); const rep = await p.evaluate(() => document.getElementById('report').innerText); ok(!BAD.test(rep) && /LifeMap plan/.test(rep), 'report');
  for (const sh of ['money', 'ask', 'whyask', 'invite', 'save', 'assume']) { const s = await p.evaluate(sh => { document.getElementById('report').classList.remove('on'); loadSample(); S.sheet = sh; render(); return (document.querySelector('.sheet') || {}).innerText || ''; }, sh); ok(!BAD.test(s), 'sheet ' + sh); }
  // Q8 answer echoed back (Me > first answers re-check, money terms)
  await p.evaluate(() => { loadSample(); S.ans['8'] = 3; S.tab = 'me'; S.me = 'recheck'; lastId = null; render(); }); const rc = await p.evaluate(() => document.getElementById('screen').innerText); ok(/Pick a road for your long-term money\./.test(rc) || /Mountain road/.test(rc), 'Me re-check shows road wording'); ok(!BAD.test(rc), 'Me re-check clean');
  ok(errs.filter(e => !/ERR_CERT_AUTHORITY_INVALID/.test(e)).length === 0, 'console errors ' + errs.join(' | '));
  console.log('screens', seen, 'of', n, 'Q8 wording seen on', q8shown, 'screens'); console.log('PASS', pass, 'FAIL', fail.length); fail.forEach(f => console.log(' -', f)); await b.close(); })();
