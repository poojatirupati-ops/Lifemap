const { chromium } = require('playwright');
const OUT = __dirname + '/oldbuild/';
const URL = 'file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/pre-v2.html';
const W = +process.argv[2] || 390;
(async () => {
  const b = await chromium.launch();
  const land = W === 844, mobile = W < 800 || land;
  const ctx = await b.newContext({ viewport: land ? {width:844,height:390} : mobile ? {width:390,height:844} : {width:1280,height:900}, hasTouch: mobile, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:'/* offline test */'}));
  await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto(URL); await p.waitForTimeout(300);
  const tag = land ? 'l' : mobile ? 'm' : 'd';
  let n = 0; const shot = async (name) => { n++; const f = OUT + tag + '-' + String(n).padStart(2,'0') + '-' + name + '.png'; if (mobile) await p.screenshot({path:f}); else await p.screenshot({path:f, clip:{x:300,y:0,width:980,height:900}}); };
  const click = async (sel, opt) => { await p.locator(sel).first().click(opt); await p.waitForTimeout(120); };
  const cur = () => p.evaluate(() => document.getElementById('curid').textContent.split(' · ')[0]);
  const log = (...a) => console.log(tag, ...a);
  const ask = async (name) => { await click('.askfab'); const n0 = await p.locator('.sheet .askq').count(); await click('.sheet .askq >> nth=0'); const a = await p.locator('.sheet .aska').first().innerText(); await p.waitForTimeout(350); if (name) await shot('ask-' + name); log('ask on', await cur(), 'questions', n0, '| first answer:', a.slice(0, 70)); await click('.sheet .sx'); };
  const noHScroll = () => p.evaluate(() => { const m = document.querySelector('#main,.qbody'); return m ? m.scrollWidth <= m.clientWidth + 1 : true; });
  const jOverlap = () => p.evaluate(() => { const sv = document.querySelector('#r-glance svg[role=img]'); if (!sv) return 'no svg';
    const bx = [...sv.querySelectorAll('circle[r="13"],circle[r="18"]')].map(e => e.getBoundingClientRect()); const tx = [...sv.querySelectorAll('text')].filter(t => !/^age \d/.test(t.textContent) && t.getAttribute('font-size') !== '12.5' && t.getAttribute('font-size') !== '16' && t.getAttribute('font-size') !== '18').map(e => e.getBoundingClientRect());
    const hit = (a, c) => a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5; let o = 0;
    for (let i = 0; i < bx.length; i++) { for (let j = i + 1; j < bx.length; j++) if (hit(bx[i], bx[j])) o++; for (const t of tx) if (hit(bx[i], t)) o++; } for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) if (hit(tx[i], tx[j])) o++; return o + ' overlaps, ' + bx.length + ' markers'; });
  if (land) {
    await shot('welcome'); await ask('welcome');
    await p.evaluate(() => { loadSample(); lastId = null; render(); }); await p.waitForTimeout(150); log('at', await cur(), 'fullscreen phone', await p.evaluate(() => document.getElementById('phone').getBoundingClientRect().width));
    await p.evaluate(() => document.getElementById('main').scrollTo({top:0, behavior:'instant'})); await p.waitForTimeout(80); await shot('plan-top');
    await p.locator('#r-glancec').scrollIntoViewIfNeeded(); await click('[data-a="view"][data-p="journey"]');
    log('rotate note visible', await p.locator('.rotnote').count() ? await p.locator('.rotnote').isVisible() : false, 'road svg width', await p.evaluate(() => Math.round(document.querySelector('#r-glance svg[role=img]').getBoundingClientRect().width)), 'labels', await p.locator('#r-glance svg[role=img] text').count());
    log('landscape sample journey', await jOverlap()); await p.locator('#r-glance svg[role=img]').scrollIntoViewIfNeeded(); await shot('journey'); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-glance-journey.png'});
    await click('[data-a="view"][data-p="chapters"]'); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-glance-chapters.png'});
    await p.evaluate(() => { S.goals.push(mkGoal('home')); S.goals.find(g => g.k === 'home').age = 42; S.view = 'journey'; lastId = null; render(); }); await p.locator('#r-glancec').scrollIntoViewIfNeeded(); log('landscape +home at 42 journey', await jOverlap()); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-glance-journey-more.png'});
    await click('[data-a="tab"][data-p="home"]'); await shot('home'); await ask('home'); await click('[data-a="tab"][data-p="me"]'); await shot('me');
    // rotate back to portrait: note appears, road back to phone size
    await p.setViewportSize({width:390, height:844}); await p.waitForTimeout(200); await click('[data-a="tab"][data-p="plan"]'); await p.locator('#r-glancec').scrollIntoViewIfNeeded(); await click('[data-a="view"][data-p="journey"]');
    log('after rotate to portrait: note visible', await p.locator('.rotnote').isVisible(), 'svg width', await p.evaluate(() => Math.round(document.querySelector('#r-glance svg[role=img]').getBoundingClientRect().width)));
    console.log(tag, 'ERRORS', errs.length, JSON.stringify(errs.slice(0, 10))); await b.close(); return; }
  await shot('welcome'); await ask('welcome');
  await click('text=Start · about 2 min');
  await click('[data-a="why"][data-p="0"]'); await shot('why'); await click('.qfoot .wbtn');
  for (let i = 0; i < 7; i++) { const id = await cur(); if (i === 0 || i === 4 || i === 5) await shot('q' + (i+1)); await click('.opt >> nth=' + [0,1,2,1,2,2,1][i]); await p.waitForTimeout(420); log('answered', id); }
  log('at', await cur());
  await click('[data-a="age"][data-p="x|-1"]'); await click('[data-a="partner"][data-p="Yes"]'); await click('[data-a="deps"][data-p="2"]'); await shot('about'); await click('text=See my money story');
  await shot('story'); await click('text=Build my LifeMap');
  for (const t of ["Kids' education", 'Buy a home', 'Travel', 'Build a safety net', 'Wedding', 'Change the car']) await click('.gtile:has-text("' + t + '")');
  log('tiles', await p.locator('.gtile').count(), 'selected', await p.locator('.gtile.sel').count(), 'has Health & care', await p.locator('.gtile:has-text("Health & care")').count());
  await shot('goals'); await click('text=Place them on my timeline');
  log('at', await cur());
  const overlaps = () => p.evaluate(() => { const r = [...document.querySelectorAll('.tl-chip')].map(c => c.getBoundingClientRect()); let o = 0; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) { const a = r[i], c = r[j]; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) o++; } const t = document.getElementById('tl').getBoundingClientRect(); const out = r.filter(x => x.left < t.left - 1 || x.right > t.right + 1).length; return {o, out, n:r.length}; });
  log('overlaps before', JSON.stringify(await overlaps()));
  await shot('timeline'); await ask('');
  // drag the first non-retire chip
  const chip = p.locator('.tl-chip:not(.ret)').first(); const gid = await chip.getAttribute('data-g'); const bb = await chip.boundingBox(); const before = await chip.getAttribute('aria-valuenow');
  if (mobile) { const cdp = await ctx.newCDPSession(p); const x = bb.x + bb.width/2, y = bb.y + bb.height/2;
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x, y}]});
    for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:x + k*9, y}]}); await p.waitForTimeout(20); }
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
  } else { await p.mouse.move(bb.x + bb.width/2, bb.y + bb.height/2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width/2 + 90, bb.y + bb.height/2, {steps:10}); await p.mouse.up(); }
  await p.waitForTimeout(300);
  const after = await p.locator('.tl-chip[data-g="' + gid + '"]').getAttribute('aria-valuenow');
  log('drag (' + (mobile ? 'touch' : 'mouse') + ') goal', gid, before, '->', after, JSON.stringify(await overlaps()));
  // keyboard
  await p.locator('.tl-chip[data-g="' + gid + '"]').focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  log('keyboard ->', await p.locator('.tl-chip[data-g="' + gid + '"]').getAttribute('aria-valuenow'), 'focused chip:', await p.evaluate(() => document.activeElement.dataset.g));
  await p.locator('.tl-chip.ret').focus(); await p.keyboard.press('ArrowLeft');
  log('retire age ->', await p.evaluate(() => [S.retireAge, S.fin.retireAge, retireGoal().age].join('/')));
  await shot('timeline-after');
  await click('[data-a="gmore"]'); await shot('timeline-more');
  await click('.foot .btn'); log('sheet', await p.evaluate(() => S.sheet)); await click('.sheet >> text=Save my progress');
  await p.fill('#sv-email', 'aoife@example.ie'); await click('text=Email me a link'); await shot('saved');
  await click('.foot .btn'); log('at', await cur()); await shot('confirm'); await click('text=This looks right');
  log('at', await cur(), 'consents unticked:', await p.evaluate(() => [...document.querySelectorAll('[data-acct="c1"],[data-acct="c2"]')].every(i => !i.checked)));
  await p.fill('#a-name', 'Aoife'); await p.fill('#a-mob', '087 123 4567'); await shot('account'); await p.check('[data-acct="c1"]'); await click('#acctgo');
  for (const scr of ['email','sms']) { await p.keyboard.type('123456'); await shot('code-' + scr); await click('.foot .btn'); await p.waitForTimeout(150); log('verified', scr, await cur()); }
  await click('text=Not now'); await shot('fin-hub');
  // About you
  await click('[data-a="fsec"][data-p="0"]'); log('about pre-filled rows', await p.locator('.tag.pre').count());
  await click('[data-a="pmode"][data-p="invite"]'); await click('[data-a="pinvite"]'); log('invite bad email ->', await p.locator('#perr').innerText());
  await p.fill('#p-email', 'cian@example.ie'); await click('[data-a="pinvite"]'); await shot('partner-invite'); log('invite sent:', await p.locator('text=Invite sent to cian@example.ie').count());
  await click('[data-a="pmode"][data-p="manual"]'); await p.fill('#p-name', 'Cian'); await p.fill('#f-pAge', '36'); await p.fill('#f-pIncome', '41000'); await shot('sec-about'); await click('text=Save this section');
  log('partner', await p.evaluate(() => JSON.stringify([S.partner.mode, S.partner.name, S.fin.pAge, S.fin.pIncome]))); await ask('');
  // Income typed
  await click('[data-a="fsec"][data-p="1"]'); await click('[data-a="fchoice"][data-p="work|Employed"]'); await p.fill('#f-income', '55000');  log('pIncome prefilled', await p.inputValue('#f-pIncome')); await click('[data-a="fnone"][data-p="otherM"]'); await p.fill('#f-costsM', '4600'); await shot('sec-income'); await click('text=Save this section');
  // Assets via real file upload
  await click('[data-a="fsec"][data-p="2"]'); await click('[data-a="fmode"][data-p="upload"]'); await shot('sec-assets-upload');
  await p.setInputFiles('input[type=file][data-file="assets"]', __dirname + '/payslip.pdf'); await p.waitForTimeout(400); await shot('scanning'); await p.waitForTimeout(1500); log('at', await cur()); await shot('upload-confirm'); await click('text=Looks right, add them');
  // Home choice (Assets) typed
  await click('[data-a="fsec"][data-p="2"]'); await click('[data-a="fmode"][data-p="type"]'); await click('[data-a="fchoice"][data-p="home|Own with mortgage"]'); await click('[data-a="fest"][data-p="homeValue"]'); await click('text=Save this section');
  // Pension via sample
  await click('[data-a="fsec"][data-p="5"]'); await click('[data-a="fmode"][data-p="upload"]'); await click('text=Use a sample document'); await p.waitForTimeout(1800); await click('text=Looks right, add them');
  await shot('fin-hub-after'); log('hub statuses', await p.evaluate(() => FSEC.map(s => s.id + ':' + secStatus(s)).join(' ')));
  await click('text=Check my details'); log('at', await cur()); await shot('check');
  log('P4 rows', await p.locator('.ck').count(), (await p.locator('.ck b').allInnerTexts()).join(' / ')); await click('[data-a="ack"],[data-a="acksec"] >> nth=0');
  await p.check('[data-chk]'); await click('#seeres'); await p.waitForTimeout(1800); log('at', await cur());
  await shot('results-top'); log('plan order', await p.evaluate(() => ['.tl-board','#tl-strip','#r-res','#r-goals','#r-found','#r-wi','#r-glancec'].map(q => { const e = document.querySelector(q); return e ? Math.round(e.getBoundingClientRect().top + document.getElementById('main').scrollTop) : 'x'; }).join(' < ')));
  await p.evaluate(() => document.getElementById('main').scrollTo({top:0, behavior:'instant'})); await p.waitForTimeout(100); await shot('plan-top'); await ask('plan');
  const txt = await p.locator('#r-goals').innerText(); log('goals box:', txt.replace(/\n/g, ' | '));
  await p.locator('#r-found').scrollIntoViewIfNeeded(); await shot('results-found'); await click('text=That makes sense'); await click('[data-a="advq"] >> nth=1');
  await p.locator('#r-wi').scrollIntoViewIfNeeded(); const wiG = await p.evaluate(() => gById(S.wi.g).name); const pBefore = await p.evaluate(() => project().pct[S.wi.g]);
  await p.evaluate(() => { const r = document.querySelector('[data-wi="m"]'); r.value = 300; r.dispatchEvent(new Event('input', {bubbles:true})); });
  await click('[data-a="wim"][data-p="25"]');
  await p.evaluate(() => { const r = document.querySelector('[data-wi="l"]'); r.value = 5000; r.dispatchEvent(new Event('input', {bubbles:true})); });
  log('what-if goal', wiG, 'baseline', pBefore, 'with +325/mo +5000:', await p.evaluate(() => project(S.wi).pct[S.wi.g]), '| out:', (await p.locator('#wi-out').innerText()).replace(/\n/g,' | '));
  await shot('whatif'); await click('text=Save as my preferred plan');
  for (const v of ['chapters','detail','journey']) { await click('[data-a="view"][data-p="' + v + '"]'); if (v === 'chapters') await click('[data-a="chap"] >> nth=1'); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-glance-' + v + '.png'}); }
  // journey collision check (rings)
  log('journey ring overlaps', await p.evaluate(() => { const c = [...document.querySelectorAll('#r-glance svg[role=img] circle[r="13"]')].map(e => e.getBoundingClientRect()); let o = 0; for (let i = 0; i < c.length; i++) for (let j = i+1; j < c.length; j++) { const a = c[i], d = c[j]; if (a.left < d.right && d.left < a.right && a.top < d.bottom && d.top < a.bottom) o++; } return o + ' of ' + c.length; }));
  await click('[data-a="view"][data-p="journey"]');
  await click('text=Download my plan'); await p.waitForTimeout(300); log('report visible', await p.locator('#report.on').count());
  await p.screenshot({path: OUT + tag + '-report.png', fullPage:false});
  log('report bar ok', await p.evaluate(() => { const c = document.querySelector('#report [data-r="close"]').getBoundingClientRect(); return c.right <= innerWidth && c.left >= 0; }), 'page h-overflow', await p.evaluate(() => { const r = document.querySelector('.rep'); return r.scrollWidth > r.clientWidth + 1; }));
  await p.locator('#report [data-r="close"]').click();
  await click('text=Adjust my goals'); log('at', await cur(), 'scrollTop', await p.evaluate(() => document.getElementById('main').scrollTop)); await p.locator('.tl-chip:not(.ret)').first().click(); await shot('plan-timeline');
  log('tap chip -> edit row shown', await p.locator('#tl-edit .grow').count()); await click('[data-a="tlclose"]');
  await click('[data-a="seg"][data-p="results"]');
  await click('text=Book my adviser meeting'); log('at', await cur()); await shot('c0');
  await click('text=Answer the questions'); log('at', await cur()); await shot('um-hub');
  log('UM sections', (await p.locator('[data-a="umsec"] b').allInnerTexts()).join(' / '));
  await click('[data-a="umsec"][data-p="1"]'); await shot('um-s1'); await click('[data-a="umedit"][data-p="d8"]'); await shot('um-s1-change'); await click('[data-a="umpick"][data-p="d8|3"]'); log('changed d8 ->', await p.evaluate(() => S.ans['8']), 'collapsed', await p.locator('[data-a="umedit"][data-p="d8"]').count()); await click('[data-a="umpick"][data-p="u9|3"]'); await click('text=Save this section');
  await click('[data-a="umsec"][data-p="2"]'); await shot('um-s2'); await click('[data-a="umpick"][data-p="u10|1"]'); await click('[data-a="umpick"][data-p="u12|2"]'); await click('text=Save this section');
  await click('[data-a="umsec"][data-p="3"]'); for (const q of ['u4|1','u11|1','u13|1']) await click('[data-a="umpick"][data-p="' + q + '"]'); await click('[data-a="umchip"] >> nth=1'); await shot('um-s3'); await click('text=Save this section');
  log('UM count', await p.evaluate(() => umCount())); await click('text=See my profile'); await shot('um-result'); await click('[data-a="me|um"]');
  await click('text=Continue to my adviser match'); log('at', await cur()); await shot('c1');
  await click('.foot .btn'); log('at', await cur(), 'share unticked:', await p.evaluate(() => [...document.querySelectorAll('[data-share],[data-agree]')].every(i => !i.checked)));
  await p.check('[data-share="report"]'); await p.check('[data-share="um"]'); await p.check('[data-agree]'); await shot('c2'); await click('#sharego');
  await click('.slot >> nth=2'); await shot('c3'); await click('text=Confirm booking'); log('at', await cur()); await shot('c4');
  await click('[data-a="tab"][data-p="me"]'); await shot('me'); await ask('me');
  await click('[data-a="me"][data-p="recheck"]'); await shot('me-recheck'); await click('[data-a="umedit"][data-p="d12"]'); await click('[data-a="umpick"][data-p="d12|2"]'); await click('text=These still look right'); log('rechecked', await p.evaluate(() => S.um.rechecked));
  await click('[data-a="me"][data-p="money"]'); await shot('me-money'); await click('[data-a="meback"]');
  await click('[data-a="tab"][data-p="exp"]'); await shot('experts'); await ask('experts');
  await click('[data-a="tab"][data-p="home"]'); log('at', await cur(), 'tabs', (await p.locator('.tabs button').allInnerTexts()).join('|').replace(/\n/g, '')); await shot('home');
  log('home next step:', (await p.locator('.card >> nth=1').innerText()).replace(/\n/g, ' | '));
  await click('.shortcuts [data-a="gowi"]'); log('shortcut what-if ->', await cur(), 'r-wi top', await p.evaluate(() => Math.round(document.getElementById('r-wi').getBoundingClientRect().top)));
  await click('[data-a="tab"][data-p="home"]'); await click('.shortcuts [data-a="seg"]'); log('shortcut timeline ->', await cur());
  await click('[data-a="tab"][data-p="home"]'); await click('.askfab'); await p.waitForTimeout(350); await shot('ask-home');  await click('.sheet .sx');
  await click('[data-a="tab"][data-p="home"]'); await click('.askfab'); await p.fill('#ask-in', 'What does capacity mean?'); await p.keyboard.press('Enter'); log('typed ask:', (await p.locator('#ask-out').innerText()).replace(/\n/g, ' | ').slice(0, 120));
  await p.fill('#ask-in', 'Should I buy shares?'); await click('[data-a="askgo"]'); log('advice guard:', (await p.locator('#ask-out').innerText()).replace(/\n/g, ' | ').slice(0, 120)); await shot('ask-typed'); await click('.sheet .sx');
  await click('[data-a="tab"][data-p="me"]'); await click('[data-a="pmode"][data-p="invite"]'); if (await p.locator('#p-email').count()) { await p.fill('#p-email', 'cian@example.ie'); await click('[data-a="pinvite"]'); } await shot('me-partner-invite'); log('Me invite sent', await p.locator('text=Invite sent to').count(), 'pIncome hidden in income?', await p.evaluate(() => !fieldVisible('pIncome')));
  await click('[data-a="pmode"][data-p="manual"]');
  await click('[data-a="tab"][data-p="plan"]'); await shot('plan-results'); log('no h-scroll', await noHScroll());
  // sample customer (both widths) + overlap checks on the journey road
  await p.evaluate(() => { loadSample(); lastId = null; render(); }); await p.waitForTimeout(150);
  log('sample ->', await cur(), 'goals:', (await p.locator('#r-goals').innerText()).replace(/\n/g,' | '));
  log('chip labels', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.tl-chip')].map(c => c.textContent + ' h' + c.offsetHeight))));
  await p.locator('#r-found').screenshot({path: OUT + tag + '-sample-found.png'});
  const edu = await p.evaluate(() => S.goals.find(g => g.k === 'edu').id); await p.locator('[data-a="wig"][data-p="' + edu + '"]').click(); await p.evaluate(() => { const r = document.querySelector('[data-wi="m"]'); r.value = 200; r.dispatchEvent(new Event('input', {bubbles:true})); });
  log('sample what-if edu +200/mo:', (await p.locator('#wi-out').innerText()).replace(/\n/g,' | ')); await p.locator('#r-wi').screenshot({path: OUT + tag + '-sample-whatif.png'}); await click('text=Back to my plan');
  await click('[data-a="view"][data-p="journey"]'); log('sample journey', await jOverlap()); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-sample-journey.png'});
  await click('[data-a="view"][data-p="chapters"]'); await click('[data-a="chap"] >> nth=0'); log('chapter widths', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.chap')].slice(0, 3).map(c => Math.round(c.getBoundingClientRect().width))))); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-sample-chapters.png'});
  await click('[data-a="view"][data-p="detail"]'); await p.locator('#r-glancec').screenshot({path: OUT + tag + '-sample-detail.png'});
  await p.evaluate(() => document.getElementById('main').scrollTo({top:0, behavior:'instant'})); await p.waitForTimeout(80); await shot('sample-plan-top');
  // bunched goals: travel/home/car/wedding at ages 39-41, plus a skipped finance section
  await p.evaluate(() => { loadSample(); ['home','car','wedding'].forEach(k => S.goals.push(mkGoal(k))); const G = k => S.goals.find(g => g.k === k); G('travel').age = 39; G('home').age = 40; G('car').age = 41; G('wedding').age = 41; G('safety').age = 40;
    ['life','ip','ci','workCover','health'].forEach(k => { delete S.fin[k]; delete S.src[k]; }); lastId = null; render(); }); await p.waitForTimeout(150);
  log('bunched chips overlap', JSON.stringify(await overlaps()));
  await click('[data-a="view"][data-p="journey"]'); log('bunched journey', await jOverlap());
  if (mobile) log('rotate note visible (portrait)', await p.locator('.rotnote').isVisible()); else log('rotate note hidden on desktop', !(await p.locator('.rotnote').isVisible()));
  await p.locator('#r-glancec').screenshot({path: OUT + tag + '-bunched-journey.png'});
  log('rough banner', await p.locator('#r-rough').count(), (await p.locator('#r-rough').innerText().catch(() => '')).replace(/\n/g, ' ').slice(0, 110));
  await click('[data-a="tab"][data-p="home"]'); log('home rough', await p.locator('#r-rough').count()); await shot('home-rough');
  if (!mobile) { for (const b of await p.locator('#jumps button').all()) { await b.click(); await p.waitForTimeout(80); } log('jumped all'); }
  // D10 guard: skip all Discover questions
  await p.evaluate(() => { S = fresh(); lastId = null; render(); }); await click('text=Start · about 2 min'); await click('.qfoot >> text=Skip');
  for (let i = 0; i < 7; i++) await click('.qfoot >> text=Skip');
  await click('[data-a="partner"][data-p="No"]'); await click('[data-a="deps"][data-p="0"]'); await click('text=See my money story'); log('D10 with 0 answers:', await p.locator('h2').first().innerText()); await shot('story-too-few');
  await click('[data-a="dgoto"]'); log('-> at', await cur());
  console.log(tag, 'ERRORS', errs.length, JSON.stringify(errs.slice(0, 10)));
  await b.close();
})().catch(e => { console.error('FAIL', e.message.split('\n').slice(0, 6).join('\n')); process.exit(1); });
