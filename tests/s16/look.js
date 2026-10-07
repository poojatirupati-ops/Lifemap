const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), crypto = require('crypto'), path = require('path'); const D = path.join(__dirname, '../docx');
const FILE = process.argv[2];
(async () => { const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[390, 844], [1280, 800], [844, 390], [360, 640]]) { const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
    await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(path.join(D, 'fonts.css'), 'utf8') }));
    await p.route('https://fonts.gstatic.com/**', r => { const f = path.join(D, 'fonts', crypto.createHash('md5').update(r.request().url() + '\n').digest('hex').slice(0, 12) + '.woff2'); r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) }); });
    await p.goto('file://' + FILE); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: __dirname + '/d0-' + w + 'x' + h + '.png' });
    // contrast: hide the text, sample the backdrop under each text box, compare with the text colour
    const boxes = await p.evaluate(() => [...document.querySelectorAll('.cover-body h2, .cover-line, .cover-under, .cover .link, .cover .brand, .cover-inv')].map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.slice(0, 30), x: r.x, y: r.y, w: r.width, h: r.height, c: getComputedStyle(e).color, fs: getComputedStyle(e).fontSize, vis: r.bottom <= innerHeight && r.top >= 0 }; }));
    await p.addStyleTag({ content: '.cover-body *, .cover .qtop *{color:transparent!important;text-shadow:none!important}' });
    const buf = await p.screenshot(); const { PNG } = (() => { try { return require('/opt/node22/lib/node_modules/pngjs'); } catch (e) { return {}; } })();
    out[w + 'x' + h] = { boxes, errs, png: buf.length }; fs.writeFileSync(__dirname + '/bg-' + w + 'x' + h + '.png', buf); await p.close(); }
  fs.writeFileSync(__dirname + '/look.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.errs])))); await b.close(); })();
