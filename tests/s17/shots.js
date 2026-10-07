const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs = require('fs'), crypto = require('crypto'), path = require('path'); const D = path.join(__dirname, '../docx');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(path.join(D, 'fonts.css'), 'utf8') }));
  await p.route('https://fonts.gstatic.com/**', r => { const f = path.join(D, 'fonts', crypto.createHash('md5').update(r.request().url() + '\n').digest('hex').slice(0, 12) + '.woff2'); r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) }); });
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { S = fresh(); S.scr = 'D5'; S.di = 3; lastId = null; render(); }); await p.waitForTimeout(200); await p.screenshot({ path: __dirname + '/q8-390.png' });
  for (const [k, fn] of [['explore-noplan', () => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); }], ['explore-plan', () => { loadSample(); S.tab = 'explore'; S.xs = []; lastId = null; render(); }]]) {
    await p.evaluate(fn); const h = await p.evaluate(() => { const m = document.getElementById('main'); return document.querySelector('header.sky').offsetHeight + m.scrollHeight + (document.querySelector('nav.tabs') || {offsetHeight: 0}).offsetHeight; });
    await p.setViewportSize({ width: 390, height: Math.ceil(h) }); await p.waitForTimeout(150); await p.locator('#phone').screenshot({ path: __dirname + '/' + k + '-390.png' }); await p.setViewportSize({ width: 390, height: 844 }); }
  await p.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); }); await p.click('[data-a="cat"][data-p="home"]'); await p.waitForTimeout(150); await p.screenshot({ path: __dirname + '/cat-home-390.png' });
  await b.close(); })();
