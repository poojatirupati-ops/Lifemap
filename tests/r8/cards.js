const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { S = fresh(); return Object.keys(FF).filter(k => FF[k].type !== 'text').map(k => { const d = document.createElement('div'); d.innerHTML = exHTML(k); const body = [...d.querySelectorAll('ul,p')].map(x => x.innerText.replace(/\n/g, ' · ')).join(' | '); const words = [...d.querySelectorAll('ul,#ex-s')].map(x => x.innerText).join(' ').split(/\s+/).filter(Boolean).length + (d.querySelector('p.small') ? d.querySelectorAll('p.small')[0].innerText.split(/\s+/).length : 0);
    return k + ' [' + FF[k].type + ', ' + words + ' words] ' + (d.querySelector('h2') || {}).innerText + ' || ' + body; }); });
  console.log(r.join('\n')); await b.close(); })();
