// §15: "Not sure? See an example" cards, Your finances statuses, checklist, and calculator gates for missing personal figures
const { open } = require('./lib'); const fs = require('fs'); const SHOTS = __dirname + '/shots/';
const extract = require('./extract');
(async () => { const { browser, page, errors } = await open(); const out = { cards: [], dialog: {}, tags: {}, p3: {}, check: {}, money: {}, calc: {} };
  const t = s => s.replace(/\s+/g, ' ').trim();
  const meta = await page.evaluate(() => ({ keys: Object.keys(EXAMPLES), ff: Object.fromEntries(Object.keys(EXAMPLES).map(k => { const d = FF[k] || FFI[k], lk = k.split('.')[0]; return [k, { l: d.l, type: d.type, item: !!FFI[k], sec: FF[k] ? FSEC.findIndex(s => s.f.includes(k)) : FSEC.findIndex(s => s.id === LDEF[lk].sec) }]; })) }));
  out.keys = meta.keys; out.ff = meta.ff;
  // a state where every field with an example is visible (ae shows only without a stated pension contribution)
  const prep = async k => page.evaluate(k => { loadSample(); const lk = k.split('.')[0]; if (k === 'ae') { delete S.fin.pensionM; delete S.src.pensionM; delete S.fin.pensionOwnM; delete S.src.pensionOwnM; delete S.lists.pens; S.dv = {}; } if (lk === 'mort2' && !LI('mort2').length) { S.lt = S.lt || {}; S.lt.mort2 = true; LI('mort2').push(newItem('mort2')); } if (FFI[k] && LDEF[lk].pol){ S.fin[lk] = 'Yes'; S.src[lk] = 'typed'; } lastId = null; render(); openSec(FF[k] ? FSEC.findIndex(s => s.f.includes(k)) : FSEC.findIndex(s => s.id === LDEF[lk].sec)); }, k);
  for (const k of meta.keys) { await page.setViewportSize({ width: 390, height: 844 }); await prep(k);
    const link = page.locator('[data-a="fex"][data-p="' + k + '"]'); const n = await link.count();
    const linkInfo = n ? await link.evaluate(e => ({ text: e.textContent.trim(), haspopup: e.getAttribute('aria-haspopup'), cls: e.className, inFhelp: !!e.closest('.fhelp') })) : null;
    const before = await page.evaluate(() => JSON.stringify([S.fin, S.src, S.lists]));
    if (n) { await link.scrollIntoViewIfNeeded(); await link.click(); } else await page.evaluate(k => { S.sheet = 'ex|' + k; render(); }, k);
    await page.waitForTimeout(350);
    const card = await page.evaluate(() => { const sh = document.querySelector('.sheet'), t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; const ps = [...sh.querySelectorAll(':scope > p')];
      return { role: sh.getAttribute('role'), modal: sh.getAttribute('aria-modal'), labelledby: sh.getAttribute('aria-labelledby'), describedby: sh.getAttribute('aria-describedby'), title: t(sh.querySelector('#ex-t')), opts: [...sh.querySelectorAll('ul li')].map(li => { const b = li.querySelector('b'); return [t(b), t(li).slice(t(b).length).replace(/^:\s*/, '')]; }), sentence: t(sh.querySelector('#ex-s')), where: t(ps.find(p => /Where to find yours/.test(p.textContent))), zero: t(ps.find(p => /Nothing to add/.test(p.textContent))), small: t(ps.find(p => /Example only/.test(p.textContent))), button: t(sh.querySelector('.btn')), close: sh.querySelector('.sx').getAttribute('aria-label'), focus: document.activeElement === sh.querySelector('.btn') ? 'Got it' : (document.activeElement.textContent || document.activeElement.tagName).trim(), pinHidden: (sh.querySelector('p span[aria-hidden]') || {}).textContent || null }; });
    if (['cash', 'home', 'life', 'age', 'mortPayM', 'sp', 'pens.own', 'cards.rate', 'workCover.mult'].includes(k)) await page.locator('#phone').screenshot({ path: SHOTS + 'E-card-' + k + '.png' });
    if (k === 'cash') { // dialog behaviour
      await page.keyboard.press('Tab'); const t1 = await page.evaluate(() => document.activeElement.textContent.trim() || document.activeElement.getAttribute('aria-label'));
      await page.keyboard.press('Tab'); const t2 = await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim());
      await page.keyboard.press('Shift+Tab'); const t3 = await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim());
      await page.keyboard.press('Escape'); await page.waitForTimeout(150);
      const esc = await page.evaluate(() => ({ open: !!document.querySelector('.sheet'), focus: document.activeElement.dataset.a + '|' + document.activeElement.dataset.p }));
      await link.click(); await page.waitForTimeout(300); await page.click('.sheet .btn'); await page.waitForTimeout(150);
      const got = await page.evaluate(() => ({ open: !!document.querySelector('.sheet'), focus: document.activeElement.dataset.a + '|' + document.activeElement.dataset.p }));
      await link.click(); await page.waitForTimeout(300); await page.mouse.click(195, 60); await page.waitForTimeout(150);
      const bg = await page.evaluate(() => ({ open: !!document.querySelector('.sheet') }));
      await link.click(); await page.waitForTimeout(300); await page.click('.sheet .sx'); await page.waitForTimeout(150);
      const x = await page.evaluate(() => ({ open: !!document.querySelector('.sheet'), focus: document.activeElement.dataset.a + '|' + document.activeElement.dataset.p }));
      out.dialog = { openFocus: card.focus, tab1: t1, tab2: t2, shiftTab: t3, escape: esc, gotIt: got, backdrop: bg, closeX: x };
      await page.evaluate(() => { const l = document.querySelector('[data-a="fex"][data-p="cash"]'); l.scrollIntoView({ block: 'center', behavior: 'instant' }); document.activeElement.blur(); });
      await page.locator('[data-a="fex"][data-p="cash"] >> xpath=ancestor::div[contains(@class,"field")]').screenshot({ path: SHOTS + 'E-field-cash.png' });
    } else { await page.keyboard.press('Escape'); await page.waitForTimeout(100); }
    const after = await page.evaluate(() => JSON.stringify([S.fin, S.src, S.lists]));
    out.cards.push(Object.assign({ k, label: meta.ff[k].l, type: meta.ff[k].type, link: linkInfo, unchanged: before === after }, card)); }
  // statuses in Your finances: Liabilities with a worked-out repayment, a missing field and a typed one
  await page.evaluate(() => { loadSample(); delete S.fin.mortPayM; delete S.src.mortPayM; delete S.conf.mortPayM; S.fin.cardPayM = 0; S.src.cardPayM = 'typed'; delete S.conf.cardPayM; delete S.fin.loanBal; delete S.src.loanBal; delete S.fin.loanPayM; delete S.src.loanPayM; lastId = null; render(); openSec(3); });
  out.p3.liab = await page.evaluate(() => [...document.querySelectorAll('#main .field')].map(f => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; const lab = f.querySelector('label,.flabel'); const tag = lab && lab.querySelector('.tag'); const wo = f.querySelector('[id^="wo-"]'); return { label: lab ? t(lab).replace(tag ? t(tag) : '', '').trim() : null, tag: t(tag), tagCls: tag ? tag.className : null, worked: t(wo), link: t(f.querySelector('[data-a="fex"]')) }; }));
  out.p3.notes = await page.evaluate(() => [...document.querySelectorAll('[id^="wo-"]')].map(e => [e.id, e.textContent.replace(/\s+/g, ' ').trim()]));
  await page.setViewportSize({ width: 390, height: 1400 }); await page.locator('#phone').screenshot({ path: SHOTS + 'E-p3-liab.png' }); await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { openSec(0); }); out.p3.about = await page.evaluate(() => [...document.querySelectorAll('#main .field')].map(f => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; const tag = f.querySelector('.tag'); return [t(f.querySelector('label,.flabel')), t(tag)]; }));
  await page.evaluate(() => { openSec(1); }); out.p3.income = await page.evaluate(() => [...document.querySelectorAll('#main .field')].map(f => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; const tag = f.querySelector('.tag'); return [t(f.querySelector('label,.flabel')), t(tag)]; }));
  // tagFor for each status, straight from the app
  out.tags = await page.evaluate(() => { const r = {}; const t = h => { const d = document.createElement('div'); d.innerHTML = h; const s = d.firstChild; return [s.textContent, s.className]; };
    const save = JSON.stringify([S.src, S.conf, S.look, S.ack, S.fix]); S.src.zz = 'doc'; S.conf.zz = 95; r.doc = t(tagFor('zz')); S.fix.zz = true; r.fixed = t(tagFor('zz')); delete S.fix.zz; delete S.conf.zz; r.docNoConf = t(tagFor('zz')); S.src.zz = 'typed'; r.typed = t(tagFor('zz')); S.src.zz = 'pre'; r.pre = t(tagFor('zz')); delete S.src.zz; r.none = t(tagFor('zz')); S.look.zz = 'x'; r.look = t(tagFor('zz')); delete S.look.zz;
    S.src.mortBal = 'doc'; S.man = S.man || {}; S.man.mortBal = { v: 200000, src: 'typed' }; r.docNote = docNote('mortBal'); delete S.man.mortBal; return r; });
  // P4 check your details and My money checklist (same Liabilities edits, plus a "Needs a look")
  await page.evaluate(() => { loadSample(); delete S.fin.mortPayM; delete S.src.mortPayM; delete S.fin.ip; delete S.src.ip; S.look.homeValue = 'This looks high for the area'; S.app = false; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.checked = false; lastId = null; render(); });
  out.check = await page.evaluate(() => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return { head: t(document.querySelector('header.sky')), rows: [...document.querySelectorAll('#main .ck')].map(c => ({ icon: t(c.querySelector('.i')), title: t(c.querySelector('b')), sec: t(c.querySelector(':scope > div > .small')), line: t(c.querySelector(':scope > div > div.small')), actions: [...c.querySelectorAll('.a .link')].map(t) })), good: t(document.querySelector('#main details summary')) }; });
  await page.locator('#main .card').first().screenshot({ path: SHOTS + 'E-p4.png' });
  await page.evaluate(() => { S.app = true; S.shell = true; S.tab = 'me'; S.me = 'money'; lastId = null; render(); });
  out.money = await page.evaluate(() => { const c = [...document.querySelectorAll('#main .card')].find(x => /To sharpen your plan/.test(x.textContent)); const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return c ? { title: t(c.querySelector('b')), rows: [...c.querySelectorAll('.mini')].map(m => [t(m.querySelector('span')), t(m.querySelector('.link'))]) } : null; });
  { const c = page.locator('#main .card', { hasText: 'To sharpen your plan' }); await c.scrollIntoViewIfNeeded(); await c.screenshot({ path: SHOTS + 'E-money.png' }); }
  // calculators: a missing personal figure, and worked-out figures
  const calcState = async (key, prep, id, file) => { await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(prep); await page.evaluate(id => { S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.calc(id); }, id);
    const dom = await page.evaluate(extract); const extra = await page.evaluate(id => ({ missing: calcMissing(C(id)), wo: S.calcWO[id] || {}, tags: [...document.querySelectorAll('#main .field .tag.pre')].map(x => [x.closest('.flabel').querySelector('label').textContent.replace(x.textContent, '').trim(), x.textContent]), notes: [...document.querySelectorAll('#main .field > span.small')].map(x => x.textContent).filter(x => /Worked out|clears it|from your balance/.test(x)) }), id);
    const el = page.locator(file.endsWith('-gate.png') ? '#cgate' : '#main'); if (file.endsWith('-gate.png')) await el.scrollIntoViewIfNeeded();
    if (file.endsWith('-gate.png')) await page.locator('#cgate').screenshot({ path: SHOTS + file }); else { const f = page.locator('.tag.pre').first(); await f.evaluate(e => e.closest('.field').scrollIntoView({ block: 'center', behavior: 'instant' })); await page.locator('.tag.pre >> xpath=ancestor::div[contains(@class,"field")]').first().screenshot({ path: SHOTS + file }); }
    out.calc[key] = Object.assign({ dom, file }, extra); };
  const noYears = () => { loadSample(); delete S.fin.mortYears; delete S.src.mortYears; delete S.conf.mortYears; };
  for (const id of ['repayment', 'overpay', 'ratechange', 'term', 'mortgageprotect']) await calcState(id + '-noyears', noYears, id, 'E-' + id + '-gate.png');
  await calcState('surplus-worked', () => { loadSample(); delete S.fin.mortPayM; delete S.src.mortPayM; delete S.conf.mortPayM; delete S.fin.cardPayM; delete S.src.cardPayM; }, 'surplus', 'E-surplus-worked.png');
  await calcState('debtpay-worked', () => { loadSample(); delete S.fin.cardPayM; delete S.src.cardPayM; delete S.conf.cardPayM; }, 'debtpay', 'E-debtpay-worked.png');
  // §16: cover, D1 title, goal tile, Q8 road wording
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { S = fresh(); lastId = null; render(); }); await page.waitForTimeout(200);
  await page.locator('#phone').screenshot({ path: SHOTS + 'B-cover.png' });
  out.cover = await page.evaluate(() => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null, q = s => document.querySelector(s);
    return { logo: t(q('.cover .brand')), invite: t(q('.cover-inv')), h: t(q('.cover h2')), line: t(q('.cover-line')), btn: t(q('.cover .wbtn')), under: t(q('.cover-under')), why: t(q('.cover .link')), all: q('.cover').innerText.replace(/\s+/g, ' ').trim(), photo: getComputedStyle(q('.cover-photo')).backgroundImage.slice(0, 30), focus: document.activeElement.textContent }; });
  await page.click('.cover .wbtn'); out.d1 = await page.evaluate(() => ({ h: document.querySelector('#screen h2').textContent, chips: [...document.querySelectorAll('[data-a="why"]')].map(e => e.textContent.trim()) }));
  await page.evaluate(() => { S = fresh(); S.scr = 'D5'; S.di = 3; lastId = null; render(); }); await page.waitForTimeout(150); await page.locator('#phone').screenshot({ path: SHOTS + 'B-q8.png' });
  out.q8 = await page.evaluate(() => ({ h: document.querySelector('#screen h2').textContent, sub: document.querySelector('.qsub').textContent, o: [...document.querySelectorAll('.opt')].map(e => [e.querySelector('.em').textContent, e.querySelector('.tx').textContent, e.querySelector('.otag').textContent.replace(/^◆ /, '')]) }));
  await page.evaluate(() => { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'F1'; lastId = null; render(); });
  out.tile = await page.evaluate(() => { const e = document.querySelector('.gtile[data-p="safety"]'); return { e: e.querySelector('.em').textContent, t: e.querySelector('.nm').textContent }; });
  out.errors = errors; fs.writeFileSync(__dirname + '/ex.json', JSON.stringify(out, null, 1)); console.log('cards', out.cards.length, 'errors', errors); await browser.close(); })();
