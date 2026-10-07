const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const HTML = 'file://' + __dirname + '/proto-head.html';
const D = __dirname;
async function open(){
  const browser = await chromium.launch({ executablePath: undefined });
  const ctx = await browser.newContext({ viewport:{width:390, height:844}, deviceScaleFactor:2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ status:200, contentType:'text/css', body: fs.readFileSync(path.join(D,'fonts.css'),'utf8') }));
  await page.route('https://fonts.gstatic.com/**', r => { const f = path.join(D, 'fonts', crypto.createHash('md5').update(r.request().url() + '\n').digest('hex').slice(0,12) + '.woff2'); r.fulfill({ status:200, contentType:'font/woff2', body: fs.readFileSync(f) }); });
  await page.goto(HTML);
  await page.evaluate(() => document.fonts.ready);
  return { browser, page, errors };
}
module.exports = { open };
