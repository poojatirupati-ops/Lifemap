// §19: per-item lists (cards, loans, pensions, policies), complete-on-save, Settings admin view, Emergency fund months, goal ranking
const { open } = require('./lib'); const fs = require('fs'); const SHOTS = __dirname + '/shots/';
(async () => { const { browser, page, errors } = await open(); const out = { errors: [] }; const t = s => s.replace(/\s+/g, ' ').trim();
  const full = async (file, sel) => { await page.evaluate(() => { document.getElementById('toast').innerHTML = ''; const m = document.getElementById('main'); if (m) m.scrollTop = 0; });
    const h = await page.evaluate(() => { const m = document.getElementById('main'), last = m.lastElementChild; return document.querySelector('header.sky').offsetHeight + (last.getBoundingClientRect().bottom - m.getBoundingClientRect().top + m.scrollTop) + 30 + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + (document.querySelector('nav.tabs') || { offsetHeight: 0 }).offsetHeight; });
    await page.setViewportSize({ width: 390, height: Math.min(4000, Math.ceil(h)) }); await page.waitForTimeout(150); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.locator('#phone').screenshot({ path: SHOTS + file }); await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(60); };
  const sec = async (i, base) => { await page.evaluate(([i, base]) => { if (base === 'sample') loadSample(); else { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P3'; } S.app = false; S.pb = true; S.shell = true; S.tab = 'plan'; S.scr = 'P3'; lastId = null; openSec(i); }, [i, base]); };
  const dom3 = () => page.evaluate(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; const lab = e => { const c = e.cloneNode(true); c.querySelectorAll('.tag').forEach(x => x.remove()); return T(c); };
    return { head: T(document.querySelector('header.sky')), note: T(document.querySelector('#main > p.small')), lead: [...document.querySelectorAll('#main > .card > p, #main .card > p')].map(T).filter(Boolean).slice(0, 6),
      lists: [...document.querySelectorAll('[data-list]')].map(l => ({ lk: l.dataset.list, title: T(l.querySelector(':scope > b')), items: [...l.querySelectorAll('[id^="item-"]')].map(it => ({ title: T(it.querySelector('b')), remove: T(it.querySelector('[data-a="idel"]')), fields: [...it.querySelectorAll('.field')].map(f => ({ label: lab(f.querySelector('label')), tag: T(f.querySelector('label .tag')), hint: T(f.querySelector('.small:not(.dnote)')), note: T(f.querySelector('.dnote')), link: T(f.querySelector('[data-a="fex"]')), unit: T(f.querySelector('.cur')) })), upload: T(it.querySelector('[data-a="iupl"]')), docRow: T(it.querySelector('.mini')) })), add: T(l.querySelector('[data-a="iadd"]')), worked: T(l.querySelector('[id^="wo-"]')) })),
      fields: [...document.querySelectorAll('#main .field')].filter(f => !f.closest('[id^="item-"]')).map(f => ({ label: lab(f.querySelector('label, .flabel')), tag: T(f.querySelector('.tag')), chips: [...f.querySelectorAll('.chip')].map(T), hint: T(f.querySelector('.small[id^="ph-"], p.small')) })),
      hints: [...document.querySelectorAll('[id^="ph-"]')].map(T), seg: [...document.querySelectorAll('.seg button')].map(T), blank: T([...document.querySelectorAll('#main p.small')].find(p => /Leave blank/.test(p.textContent))), docbar: T(document.getElementById('docbar')), foot: T(document.querySelector('.foot')) }; });
  out.s = {};
  // Liabilities: sample customer (migrated statement figures become items) and a customer with nothing
  await sec(3, 'sample'); out.s.liabSample = await dom3(); await full('L-liab-sample.png');
  await sec(3, 'fresh'); out.s.liabBlank = await dom3(); await full('L-liab-blank.png');
  await page.click('[data-a="iadd"][data-p="cards"]'); out.s.liabAdd = await page.evaluate(() => [...document.querySelectorAll('[data-list="cards"] [id^="item-"] > .row b')].map(b => b.textContent));
  await sec(4, 'sample'); out.s.protSample = await dom3(); await full('L-prot-sample.png');
  await sec(4, 'fresh'); out.s.protBlank = await dom3(); await full('L-prot-blank.png');
  await page.click('[data-a="fchoice"][data-p="workCover|Yes"]'); out.s.protWork = await dom3(); await full('L-prot-work.png');
  await page.click('[data-a="fchoice"][data-p="life|Yes"]'); await page.click('[data-a="iadd"][data-p="life"]'); out.s.protLifeAdd = await dom3(); out.s.protAddBtn = await page.evaluate(() => [...document.querySelectorAll('[data-a="iadd"]')].map(b => b.textContent.trim()));
  await page.click('[data-a="fchoice"][data-p="ip|No"]'); await page.click('[data-a="fchoice"][data-p="ci|Not sure"]'); await page.click('[data-a="fchoice"][data-p="health|Yes"]'); out.s.protMixed = await dom3();
  await sec(5, 'sample'); out.s.pensSample = await dom3(); await full('L-pens-sample.png');
  await sec(5, 'fresh'); out.s.pensBlank = await dom3();
  // per-item upload: Liabilities, first card
  await sec(3, 'fresh'); await page.click('[data-a="iupl"][data-p^="cards|"]'); await page.waitForTimeout(1700);
  out.s.upl = await page.evaluate(() => ({ cur: document.getElementById('curid').textContent, text: document.getElementById('main').innerText.replace(/\s+/g, ' ').trim(), foot: (document.querySelector('.foot') || {}).innerText }));
  await full('L-upl-confirm.png'); await page.click('[data-a="uplok"]'); await page.waitForTimeout(300);
  out.s.afterUpl = await dom3(); out.s.afterUplToast = await page.evaluate(() => document.getElementById('toast').innerText); await full('L-liab-afterupl.png');
  // complete on save: hub statuses and checklist
  const hub = () => page.evaluate(() => ({ cards: [...document.querySelectorAll('#main button.goal')].map(b => ({ t: b.querySelector('b').textContent, s: b.querySelector('.small').textContent, st: (b.querySelector('.sr') || {}).textContent })), foot: (document.querySelector('.foot') || {}).innerText, head: document.querySelector('header.sky').innerText.replace(/\s+/g, ' ').trim() }));
  await page.evaluate(() => { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P2'; S.app = false; lastId = null; render(); }); out.hubFresh = await hub();
  await sec(3, 'fresh'); await page.fill('#i-cards-1-owed', '400'); await page.fill('#i-cards-1-pay', '40'); await page.click('.foot .btn'); await page.waitForTimeout(200); out.hubSaved = await hub(); out.saveToast = await page.evaluate(() => document.getElementById('toast').innerText);
  await page.evaluate(() => { openSec(2); }); await page.click('.foot .btn'); await page.waitForTimeout(200); out.hubBlankSaved = await hub();   // Assets saved with every field blank
  await full('L-hub-saved.png');
  await page.evaluate(() => { S.pb = true; S.checked = false; S.scr = 'P4'; lastId = null; render(); });
  out.p4 = await page.evaluate(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return { head: T(document.querySelector('header.sky')), rows: [...document.querySelectorAll('#main .ck')].map(c => ({ icon: T(c.querySelector('.i')), title: T(c.querySelector('b')), sec: T(c.querySelector(':scope > div > .small')), line: T(c.querySelector(':scope > div > div.small')), actions: [...c.querySelectorAll('.a .link')].map(T) })), good: T(document.querySelector('#main details summary')) }; });
  await full('L-p4-optional.png');
  await page.evaluate(() => { S.app = true; S.shell = true; S.tab = 'me'; S.me = 'money'; lastId = null; render(); }); out.money = await page.evaluate(() => { const c = [...document.querySelectorAll('#main .card')].find(x => /To sharpen your plan/.test(x.textContent)); return c ? { title: c.querySelector('b').textContent, rows: [...c.querySelectorAll('.mini')].map(m => m.textContent.replace(/\s+/g, ' ').trim()) } : null; });
  out.errors = errors; fs.writeFileSync(__dirname + '/s19a.json', JSON.stringify(out, null, 1)); console.log('part A done', errors); await browser.close(); })();
