const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({viewport:{width:390,height:844}, hasTouch:true})).newPage();
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const ids = await p.evaluate(() => { const out = []; JUMPS.forEach(g => g[1].forEach(j => { try { j[2](); lastId = null; render(); out.push(j[0] + '=' + document.getElementById('curid').textContent.split(' · ')[0]); } catch (e) { out.push(j[0] + ' ERR ' + e.message); } })); return out; });
  console.log(ids.join('\n'));
  console.log('ERRORS', errs.length, JSON.stringify(errs.slice(0, 8))); await b.close(); })();
