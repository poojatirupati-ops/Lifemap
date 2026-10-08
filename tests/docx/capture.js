const { open } = require('./lib');
const { STMT_FOR, INFL_ONLY, ADJ, EDGES } = require('./states');
const extract = require('./extract'), extractAsm = require('./extract-asm');
const fs = require('fs');
const SHOTS = __dirname + '/shots/';
(async () => { const { browser, page, errors } = await open(); const { clearToast, base, calc, set, num } = require('./drive')(page);
  const full = async (file, ext) => { await clearToast(); await page.evaluate(() => { const m = document.getElementById('main'); m.scrollTop = 0; });
    const h = await page.evaluate(() => { const m = document.getElementById('main'), last = m.lastElementChild; const ch = last.getBoundingClientRect().bottom - m.getBoundingClientRect().top + m.scrollTop + 24;
      return document.querySelector('header.sky').offsetHeight + ch + (document.querySelector('nav.tabs') || {offsetHeight:0}).offsetHeight; });
    await page.setViewportSize({ width:390, height: Math.ceil(h) }); await page.waitForTimeout(120);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.locator('#phone').screenshot({ path: SHOTS + file }); const dom = await page.evaluate(ext || extract); await page.setViewportSize({ width:390, height:844 }); await page.waitForTimeout(60); return dom; };
  const crop = async (sel, file, ext) => { await clearToast(); const el = page.locator(sel).first(); await el.evaluate(e => e.scrollIntoView({ block: e.getBoundingClientRect().height < 600 ? 'center' : 'start', behavior:'instant' })); await page.waitForTimeout(80); const b = await el.boundingBox(); const P = 10, x0 = Math.max(0, b.x - P); await page.screenshot({ path: SHOTS + file, clip:{ x:x0, y:Math.max(0, b.y - P), width:Math.min(390 - x0, b.width + 2 * P), height:Math.min(b.height + 2 * P, 844 - Math.max(0, b.y - P)) } }); return page.evaluate(ext || extract); };
  const meta = await page.evaluate(() => ({ CATS: CATS.map(c => ({ id:c.id, name:c.name, em:c.em, color:c.color, blurb:c.blurb })),
    CALCS: CALCS.map(c => ({ id:c.id, cat:c.cat, name:c.name, q:c.q, em:c.em, tip:c.tip || null, inputs:c.inputs, wi:c.wi || [] })),
    TOPICS, TOPIC_TOOLS, INFL_TOOLS, ADJ_TOOLS, EXPERT_FOR, CHIP_OPTS, RULES_VERSION, INFL: { std: SV('infl'), ie: INFL_IE, src: INFL_SRC },
    ASM_GRP, ASM: Object.fromEntries(Object.entries(ASM).map(([k, d]) => [k, { g:d.g, b:d.b, l:d.l, t:d.t, min:d.min, max:d.max, step:d.step, o:d.o || null, opt:!!d.opt, ty:d.ty, own:!!d.own, mk:d.mk || null, afterDirt:!!d.afterDirt, mkSug:d.mk && mkSug(d) ? mkSug(d).t : null, mkChip:d.mk && mkSug(d) ? sugChipTxt(mkSug(d)) : null, tag:d.mk ? tMarket(d) : null, n:d.n, sug:d.sug ? d.sug() : null, sugTxt: d.sug ? asmFmt(d, d.sug()) : null, std:asmStd(k) ? asmFmt(d, d.sug()) : null, guide:asmGuide(d), help:d.help }])), RETIRE_HELP, T_GOV, T_MINE, T_HOW, SETTINGS: JSON.parse(JSON.stringify(SETTINGS)), SFMT: Object.fromEntries(Object.entries(SETTINGS.s).map(([k, v]) => [k, setFmt(v, v.v)])), LDEF: JSON.parse(JSON.stringify(LDEF)), FFI: JSON.parse(JSON.stringify(FFI)), ITEMDOC: JSON.parse(JSON.stringify(ITEMDOC)), PROT_HINT, FSEC: JSON.parse(JSON.stringify(FSEC)),
    RULES: (() => { const out = []; const walk = (o, p) => Object.entries(o).forEach(([k, x]) => { if (x && typeof x === 'object' && 'v' in x && 'src' in x) out.push([p + k, JSON.stringify(x.v, (kk, vv) => vv === Infinity ? 'Infinity' : vv), x.eff, x.src, x.verify]); else walk(x, p + k + '.'); }); walk(RULES_IE_2026, ''); return out; })(),
    DOCT: Object.fromEntries(Object.entries(DOCT).map(([k, T]) => [k, { em:T.em, what:T.what, title:T.title, date:T.date, old:T.old, reads:T.reads, open:T.open, f:T.f, text:T.text || null, extra:T.extra || null }])) }));
  const out = { meta, calcs: [] };
  for (const [n, c] of meta.CALCS.entries()){ const id = c.id, N = 'C' + String(n + 1).padStart(2, '0'), st = [];
    const push = async (o, fn) => { o.dom = await fn(); const x = await num(id); o.num = x.num; o.goal = x.goal; o.missing = x.missing; st.push(o); };
    await base('fresh'); await calc(id);
    await push({ key:'default', title:'Default: nothing chosen yet (before a plan)', base:'fresh', file:N + '-default.png', kind:'full' }, () => full(N + '-default.png'));
    await base('chosen'); await calc(id, true);
    await push({ key:'chosen', title:'Choices made: the standards, inflation 2%, and the example values typed into the blanks', base:'chosen', file:N + '-chosen.png', kind:'full' }, () => full(N + '-chosen.png'));
    if (INFL_ONLY.includes(id)){ await base('chosenNoInfl'); await calc(id, true); await push({ key:'noInfl', title:'Choices made except inflation', base:'chosenNoInfl', file:N + '-noinfl.png', kind:'full' }, () => full(N + '-noinfl.png')); }
    if (ADJ.includes(id)){ await base('chosenNoInfl'); await calc(id, true); await page.click('[data-a="adjinfl"]'); await push({ key:'adjUnset', title:'"Adjust for inflation" on, inflation not chosen yet', base:'chosenNoInfl', act:'adjinfl', file:N + '-adj-unset.png', kind:'full' }, () => full(N + '-adj-unset.png'));
      await base('chosen'); await calc(id, true); await page.click('[data-a="adjinfl"]'); await push({ key:'adjSet', title:'"Adjust for inflation" on, inflation chosen (2%)', base:'chosen', act:'adjinfl', file:N + '-adj-set.png', kind:'full' }, () => full(N + '-adj-set.png')); }
    await base('sample'); await calc(id); const sd = await page.evaluate(extract); await base('chosen'); await calc(id, true); const fd = await page.evaluate(extract);
    if (sd.fields.some((f, i) => f.box !== fd.fields[i].box)){ await base('sample'); await calc(id); await push({ key:'plan', title:'Pre-filled from Your finances and the plan (sample customer Aoife, all choices made, inflation 2%)', base:'sample', file:N + '-plan.png', kind:'full' }, () => full(N + '-plan.png')); }
    if (STMT_FOR[id]){ await base('stmt:' + STMT_FOR[id]); await calc(id); await push({ key:'stmt', title:'Pre-filled from a ' + meta.DOCT[STMT_FOR[id]].what + ' statement (sample statement, sample customer)', base:'stmt:' + STMT_FOR[id], file:N + '-stmt.png', kind:'full' }, () => full(N + '-stmt.png')); }
    for (const [j, e] of (EDGES[id] || []).entries()){ const b = e.base || 'chosen'; await base(b); await calc(id, b === 'chosen'); for (const [k, v] of Object.entries(e.set)) await set(k, v);
      await push({ key:'edge' + (j + 1), title:'Edge: ' + e.t, base:b, set:e.set, file:N + '-edge' + (j + 1) + '.png', kind:'result' }, () => crop('#cout', N + '-edge' + (j + 1) + '.png')); }
    const ins = c.inputs.filter(i => !meta.CHIP_OPTS[i.u]), hk = ins.find(i => ['%','y','m','age'].includes(i.u)) || ins[0], hv = hk.u === '€' ? hk.max * 10 + 1000 : hk.max + 1;
    await base('chosen'); await calc(id, true); await set(hk.k, hv);
    await push({ key:'hint', title:'Max hint: "' + hk.l + '" typed as ' + hv, base:'chosen', set:{[hk.k]:hv}, file:N + '-hint.png', kind:'field', field:hk.k }, () => crop('#co-' + hk.k + ' >> xpath=ancestor::div[contains(@class,"field")]', N + '-hint.png'));
    if (await page.evaluate(id => !!document.querySelector('details.asmg[data-g^="c-"]'), id)) { await base('fresh'); await calc(id); await crop('details.asmg[data-g^="c-"]', N + '-asm.png'); }
    out.calcs.push({ n:N, ...c, states:st }); console.log(N, id, st.map(s => s.key).join(','));
  }
  // Your assumptions
  const asm = {}; const goAsm = g => page.evaluate(g => { S = fresh(); S.shell = true; S.tab = 'me'; S.me = 'asm'; S.asmOpen = g; lastId = null; render(); }, g);
  for (const g of meta.ASM_GRP.map(x => x[0]).concat(['law'])){ await page.setViewportSize({ width:390, height:844 }); await goAsm(g); asm[g] = { file:'A-' + g + '.png', head: await page.evaluate(() => document.querySelector('header.sky').innerText), dom: await full('A-' + g + '.png', extractAsm) }; }
  await goAsm('retire'); await page.fill('[data-nb="asm|retireMult"]', '30'); await page.evaluate(() => document.activeElement.blur()); asm.mine = await page.evaluate(extractAsm); await crop('[data-k="retireMult"]', 'A-mine.png', extractAsm);
  await goAsm('safety'); for (const [k, v] of [['budgetNeeds', 50], ['budgetWants', 30], ['budgetSave', 30]]) { await page.fill('[data-nb="asm|' + k + '"]', String(v)); await page.evaluate(() => document.activeElement.blur()); } asm.budgetNote = await page.evaluate(() => (document.querySelector('details[open] p.note') || {}).textContent || null);
  asm.afterUseAll = null; asm.useAllToast = null;   // §27: no "use the standard for all" button any more
  out.asm = asm;
  // inflation chips component: 3 states, in a calculator (C09)
  const infl = {}; const inflShot = async (key, file) => { await clearToast(); const el = page.locator('.infl').first(); await el.evaluate(e => e.scrollIntoView({ block:'center', behavior:'instant' })); await el.screenshot({ path: SHOTS + file }); infl[key] = await page.evaluate(() => { const ic = document.querySelector('.infl'), t = e => e.textContent.replace(/\s+/g, ' ').trim(); return { title: t(ic.querySelector('b')), help: t(ic.querySelector('p.small')), chips: [...ic.querySelectorAll('.chip')].map(c => ({ t: t(c), pressed: c.getAttribute('aria-pressed') })), other: ic.querySelector('.flabel span') ? t(ic.querySelector('.flabel span')) : null, otherBox: (ic.querySelector('input.nb') || {}).value || null }; }); infl[key].file = file; };
  await base('chosenNoInfl'); await calc('compound', true); await inflShot('unset', 'K-infl-1-unset.png');
  await page.click('[data-a="infl"][data-p="' + meta.INFL.std + '"]'); infl.collapsed = await page.evaluate(() => ({ chips: !!document.querySelector('.infl'), note: (([...document.querySelectorAll('#main p.small')].find(p => /Prices rising/.test(p.textContent)) || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
  await crop('#cout', 'K-infl-collapsed.png'); await page.click('[data-a="infledit"]'); await inflShot('chosen', 'K-infl-2-chosen.png');
  await page.click('[data-a="infl"][data-p="other"]'); if (!(await page.$('.infl'))) await page.click('[data-a="infledit"]'); await inflShot('other', 'K-infl-3-other.png');
  await base('chosenNoInfl'); await calc('compound', true); await page.click('[data-a="infl"][data-p="other"]'); infl.otherFromUnset = await page.evaluate(() => ({ chips: !!document.querySelector('.infl'), note: (([...document.querySelectorAll('#main p.small')].find(p => /Prices rising/.test(p.textContent)) || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
  out.infl = infl;
  // Explore screens
  const ex = {}; const xs = async (key, fn, file) => { await fn(); ex[key] = { file, text: await page.evaluate(() => document.getElementById('main').innerText), head: await page.evaluate(() => document.querySelector('header.sky').innerText) }; await full(file); };
  await xs('explore', async () => { await base('fresh'); }, 'X-explore.png');
  for (const c of ['retire','home','invest']) await xs('cat-' + c + '-unverified', async () => { await base('fresh'); await page.evaluate(c => ACT.cat(c), c); }, 'X-cat-' + c + '-unverified.png');
  await xs('cat-home-verified', async () => { await base('sample'); await page.evaluate(() => ACT.cat('home')); }, 'X-cat-home-verified.png');
  await xs('cat-invest-uploaded', async () => { await base('stmt:invest'); await page.evaluate(() => { S.xs = []; ACT.cat('invest'); }); }, 'X-cat-invest-uploaded.png');
  await xs('gate', async () => { await base('fresh'); await page.evaluate(() => ACT.cat('home')); await page.click('[data-a="pstup"]'); }, 'X-gate.png');
  for (const c of ['retire','home','invest']){ await xs('scan-' + c, async () => { await base('sample'); await page.evaluate(c => { const T = DOCT[c]; S.pst = {cat:c, stage:'scan', files:[T.title + ' · ' + T.date + '.pdf'], edit:{}}; S.xs.push({v:'PST'}); lastId = null; render(); }, c); }, 'X-scan-' + c + '.png');
    await xs('confirm-' + c, async () => { await page.evaluate(() => { S.pst.stage = 'confirm'; render(); }); }, 'X-confirm-' + c + '.png'); ex['confirm-' + c].foot = await page.evaluate(() => document.querySelector('.foot') && document.querySelector('.foot').innerText); }
  for (const t of meta.TOPICS) await xs('topic-' + t[1], async () => { await base('fresh'); await page.evaluate(p => ACT.topic(p), t[1]); }, 'X-topic-' + t[1].replace(/\s/g, '_') + '.png');
  // Add to my plan sheets, one per goal kind
  // plan builder step 7 and "What your plan assumes"
  await page.evaluate(() => { loadSample(); S.asm = {}; S.infl = null; S.retireSet = false; S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; lastId = null; render(); });
  out.step7 = { head: await page.evaluate(() => document.querySelector('header.sky').innerText), text: await page.evaluate(() => document.getElementById('p4-asm').innerText), foot: await page.evaluate(() => document.querySelector('.foot').innerText) };
  await crop('#p4-asm', 'P-step7.png');
  await page.evaluate(() => { loadSample(); S.sheet = 'assume'; render(); document.querySelectorAll('.sheet details').forEach(d => d.open = true); });
  out.assumeSheet = await page.evaluate(() => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; return { title: t(document.querySelector('.sheet h2')), intro: t(document.querySelector('.sheet h2 + p')), rows: [...document.querySelectorAll('.sheet .mini')].map(m => { const sp = m.querySelector('span'), tg = sp && sp.querySelector('.tag'), c = sp ? sp.cloneNode(true) : null; if (c) [...c.querySelectorAll('.tag')].forEach(x => x.remove()); return [t(c), tg ? t(tg) : '', t(m.querySelector('b'))]; }), gov: t(document.querySelector('.sheet details summary')) }; });
  await page.locator('.sheet').screenshot({ path: SHOTS + 'S-assume.png' });
  await base('fresh'); await calc('borrow'); await crop('#cgate', 'K-gate.png'); await crop('#co-rate >> xpath=ancestor::div[contains(@class,"field")]', 'K-blank.png');
  const sheets = {}; for (const [id, b] of [['borrow','chosen'], ['borrow','sample'], ['ratechange','chosen'], ['compound','chosenNoInfl'], ['compound','chosen'], ['overpay','chosen'], ['emergency','chosen'], ['retirement','chosen'], ['contrib','chosen'], ['lifecover','chosen'], ['incomegap','chosen'], ['surplus','chosen'], ['debtpay','chosen']]){
    await base(b); await calc(id, b !== 'sample'); await page.click('[data-a="calcadd"]'); const k = id + '-' + b; if (!(await page.$('.sheet'))) { sheets[k] = ['(no sheet) toast: ' + await page.evaluate(() => document.getElementById('toast').innerText)]; continue; } sheets[k] = await page.evaluate(() => [...document.querySelectorAll('.sheet .eyebrow, .sheet h2, .sheet p.sub, .sheet .btn')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    await page.locator('.sheet').screenshot({ path: SHOTS + 'S-' + k + '.png' }); }
  out.sheets = sheets;
  await base('fresh'); await calc('repayment'); await page.click('[data-a="expertfor"]'); ex.expert = await page.evaluate(() => document.getElementById('main').innerText.slice(0, 400));
  // component crops
  await base('chosen'); await calc('borrow', true); await set('inc', 300000); await crop('#co-inc >> xpath=ancestor::div[contains(@class,"field")]', 'K-widen.png');
  await base('chosen'); await calc('borrow', true); await page.focus('#co-inc'); await page.locator('#co-inc >> xpath=ancestor::div[contains(@class,"field")]').screenshot({ path: SHOTS + 'K-focus.png' });
  await page.locator('[data-a="ckset"][data-p="ftb|1"] >> xpath=ancestor::div[contains(@class,"field")]').screenshot({ path: SHOTS + 'K-chipfield.png' });
  await base('chosen'); await calc('lumpsum', true); await page.locator('.adjrow').screenshot({ path: SHOTS + 'K-switch-off.png' }); await page.click('[data-a="adjinfl"]'); await page.locator('.adjrow').screenshot({ path: SHOTS + 'K-switch-on.png' });
  await base('fresh'); await calc('emergency'); await page.locator('header.sky').screenshot({ path: SHOTS + 'K-tip.png' });
  await base('stmt:retire'); await page.locator('.field').nth(1).screenshot({ path: SHOTS + 'K-tag.png' });
  await base('chosen'); await calc('borrow', true); await page.locator('#main > .grid2').screenshot({ path: SHOTS + 'K-actions.png' });
  out.explore = ex; out.errors = errors;
  fs.writeFileSync(__dirname + '/data.json', JSON.stringify(out, null, 1)); console.log('errors', errors); await browser.close(); })();
