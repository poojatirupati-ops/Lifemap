// §17 accessibility: no emoji in the accessible name of any heading, sheet title, card title, tile or list row.
// Scans every jump-list screen (390 and 1280) plus every sheet type, the report, and Explore drill-downs.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const FILE = process.argv[2] || '/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
(async () => { const b = await chromium.launch(); const bad = new Map(); let scanned = 0, screens = 0; const errs = [];
  for (const [w, h] of [[390, 844], [1280, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
    await p.goto('file://' + FILE); await p.waitForTimeout(300);
    const scan = async where => { const r = await p.evaluate(() => {
        const EMO = /\p{Extended_Pictographic}/u, roots = [document.getElementById('screen'), document.getElementById('report')].filter(Boolean);
        const name = el => { if (el.getAttribute('aria-label')) return el.getAttribute('aria-label'); const lb = el.getAttribute('aria-labelledby'); if (lb) return lb.split(/\s+/).map(id => { const x = document.getElementById(id); return x ? name(x) : ''; }).join(' ');
          const c = el.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach(x => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
        const sel = 'h1,h2,h3,h4,h5,h6,[role=heading],.sheet h2,.card > b,.card > div > b,.sec h3,button,a,summary,.mini > span:first-child,.ck b,.pq b';
        const out = []; let n = 0; roots.forEach(r => { if (r.id === 'report' && !r.classList.contains('on')) return; r.querySelectorAll(sel).forEach(el => { if (el.closest('[aria-hidden="true"]') || !el.getClientRects().length) return; n++; const t = name(el); if (/^(BUTTON|A)$/.test(el.tagName) && !t && !el.getAttribute('title')) out.push([el.tagName.toLowerCase() + ' NO NAME', el.outerHTML.slice(0, 60)]); if (EMO.test(t)) out.push([el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''), t.slice(0, 70)]); }); });
        return { n, out }; }); scanned += r.n; screens++; r.out.forEach(([k, t]) => { const key = k + ' | ' + t; if (!bad.has(key)) bad.set(key, where); }); };
    const groups = await p.evaluate(() => JUMPS.map(g => g[1].length));
    for (const [gi, len] of groups.entries()) for (let k = 0; k < len; k++) { const id = await p.evaluate(([gi, k]) => { document.getElementById('report').classList.remove('on'); JUMPS[gi][1][k][2](); lastId = null; render(); return JUMPS[gi][1][k][0]; }, [gi, k]); await scan(w + ' ' + id); }
    for (const sh of ['ask', 'whyask', 'invite', 'save', 'saveprompt', 'money', 'assume', 'history', 'delete', 'profile', 'other', 'explain|str', 'explain|gap', 'ex|cash', 'ex|home', 'calcadd|borrow', 'calcadd|emergency']) { await p.evaluate(sh => { document.getElementById('report').classList.remove('on'); loadSample(); S.sheet = sh; lastId = null; render(); }, sh); await scan(w + ' sheet ' + sh); }
    await p.evaluate(() => { loadSample(); render(); openReport(); }); await scan(w + ' report');
    for (const c of await p.evaluate(() => CATS.map(c => c.id))) { await p.evaluate(c => { document.getElementById('report').classList.remove('on'); S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.cat(c); }, c); await scan(w + ' cat ' + c); }
    for (const t of await p.evaluate(() => TOPICS.map(t => t[1]))) { await p.evaluate(t => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.topic(t); }, t); await scan(w + ' topic ' + t); }
    for (const id of await p.evaluate(() => CALCS.map(c => c.id))) { await p.evaluate(id => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.calc(id); }, id); await scan(w + ' calc ' + id); }
    for (const sec of [0, 1, 2, 3, 4, 5]) { await p.evaluate(s => { loadSample(); openSec(s); }, sec); await scan(w + ' fin ' + sec); }
    for (let di = 0; di < 6; di++) { await p.evaluate(di => { S = fresh(); S.scr = 'D' + (di + 2); S.di = di; lastId = null; render(); }, di); await scan(w + ' disc ' + di); }
    await p.close(); }
  console.log('screens', screens, 'elements', scanned, 'with emoji in the accessible name', bad.size, 'console errors', errs.length);
  [...bad.entries()].slice(0, 200).forEach(([k, w]) => console.log(' -', k, ' @', w)); await b.close(); process.exitCode = bad.size ? 1 : 0; })();
