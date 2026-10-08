// shared by capture-s26.js (screenshots on) and check.js (screenshots off)
const SHOTS = __dirname + '/shots/';
module.exports = async function collect(page, shots) { const out = {}; const ev = (f, a) => page.evaluate(f, a);

  const tall = async (w, h) => { await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(250); };
  const phone = async f => { if (!shots) return; await ev(() => { document.getElementById('toast').innerHTML = ''; document.activeElement && document.activeElement.blur(); }); await page.waitForTimeout(200); await page.locator('#phone').screenshot({ path: SHOTS + f }); };
  const TT = "const T = e => e ? e.textContent.replace(/\\s+/g, ' ').trim() : null;";
  await tall(390, 1500);
  // 1. Use the standards for the rest on the results gate and Home
  out.gate = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; loadSample(); S.asm = { planEnd: 90 }; S.retireSet = true; S.infl = 0.02; S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render();
    const o = { res: { title: T(document.querySelector('#gate-res b')), also: T(document.querySelector('#gate-res p')), btn: T(document.querySelector('#gate-res button')) }, std: { title: T(document.querySelector('#gate-std-res b')), p: T(document.querySelector('#gate-std-res p')), btn: T(document.getElementById('use-std-res')) }, nStd: gateStd().length, nMissing: planMissing().length, nLeft: planMissing().filter(x => !gateStd().some(y => y.k === x.k)).map(x => x.n) };
    S.tab = 'home'; lastId = null; render(); o.home = { has: !!document.getElementById('gate-std-home'), btn: T(document.getElementById('use-std-home')) }; return o; });
  await ev(() => { S.tab = 'plan'; lastId = null; render(); }); await phone('S26-gate-results.png');
  await page.click('#use-std-res'); await page.waitForTimeout(300);
  out.gateAfter = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return { missing: planMissing().map(x => chooseTxt(x)), gate: T(document.getElementById('gate-res')), std: !!document.getElementById('gate-std-res') }; });
  // 2. other-property mortgage gate
  out.mort2 = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; loadSample(); useAllStd(); S.lists.mort2 = [newItem('mort2')]; S.lists.mort2[0].f.owed = '180000'; syncLists(); S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render();
    const o = { gate: T(document.querySelector('#gate-res b')), also: T(document.querySelector('#gate-res p')), btn: T(document.querySelector('#gate-res button')) };
    S.lists.mort2[0].f.years = '18'; syncLists(); lastId = null; render(); o.after = planMissing().map(x => chooseTxt(x)); o.pay = Math.round(mort2Nums().pay); S.lists.mort2[0].f.years = ''; S.lists.mort2[0].f.pay = '950'; syncLists(); o.after2 = planMissing().map(x => chooseTxt(x)); return o; });
  await ev(() => { loadSample(); useAllStd(); S.lists.mort2 = [newItem('mort2')]; S.lists.mort2[0].f.owed = '180000'; syncLists(); S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render(); }); await phone('S26-mort2-gate.png');
  // 3. derived investment standard
  out.inv = await ev(() => { const g = k => { const s = SETTINGS.s[k]; return { n: s.n, v: s.pv != null ? s.pv : s.v, vc: s.vc, by: s.by, src: s.src, guide: s.guide }; }; const o = { inv: g('inv'), invGross: g('invGross'), fundChg: g('fundChg'), exit: RI.sav.exit, deemed: RI.sav.deemed, chgStd: INV_CHG_STD, invCaut: invNet(0.01) };
    const fc = SETTINGS.s.fundChg, fpv = fc.pv; fc.pv = 0.015; o.chg15 = [invNet(0), invNet(0.01)]; if (fpv == null) delete fc.pv; else fc.pv = fpv; const sv = SETTINGS.s.invGross.v; SETTINGS.s.invGross.v = 0.06; o.at6 = invNet(0); SETTINGS.s.invGross.v = sv; return o; });
  // 4. main strength rules
  out.strength = await ev(() => { const o = {}; loadSample(); S.app = true; o.sample = findings(project()).sT;
    loadSample(); S.src.costsM = 'typed'; S.fin.costsM = 9000; o.over = findings(project()).sT;
    loadSample(); S.app = true; S.goals.forEach(g => { if (g.k !== 'retire') { g.amount = 5000000; g.auto = false; } }); S.retireAge = 58; S.about.age = 50; o.none = findings(project()).sT; return o; });
  // 5. partner retirement age, "Choose N things"
  await ev(() => { loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.retireSet = false; S.infl = null; S.asm = {}; S.pRetSet = false; S.checked = false; lastId = null; render(); }); await tall(390, 2300);
  out.p4partner = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; const f = document.querySelector('#p4-3 [data-k="pRetireAge"]'); return { h3: T(document.querySelector('#p4-3 h3')), p: T(document.querySelector('#p4-3 h3 + p')), count: T(document.getElementById('p4-count')), field: T(f && f.querySelector('.flabel')), help: T(f && f.querySelector(':scope > span.small')), need: T(document.querySelector('.foot .small, .foot p')), req: reqKeys(), order: [...document.querySelectorAll('#p4-3 .field')].map(x => x.dataset.k || x.id) }; });
  await phone('S26-step7-four.png');
  await ev(() => { S.about.partner = false; lastId = null; render(); });
  out.p4single = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return { h3: T(document.querySelector('#p4-3 h3')), p: T(document.querySelector('#p4-3 h3 + p')), count: T(document.getElementById('p4-count')), req: reqKeys() }; });
  out.knownLimit = await ev(() => { loadSample(); applyAssume(); const r = assumeRows().find(x => x[0] === 'Known limits'); return r ? r[1] : null; });
  // 6. unknown card or loan rate
  out.rates = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; loadSample(); useAllStd(); delete S.asm.cardRate; delete S.asm.loanRate; S.advRate = {}; applyAssume(); S.app = true; S.shell = true; S.tab = 'me'; S.me = 'asm'; lastId = null; render();
    const h = document.createElement('div'); h.innerHTML = asmInput('cardRate'); const o = { before: { label: T(h.querySelector('.flabel')), chips: [...h.querySelectorAll('.chips button')].map(b => T(b)), small: T(h.querySelector(':scope > .field > span.small:last-child') || h.querySelector('span.small')) } };
    o.gateTxt = planMissing().filter(x => /rate/.test(x.n)).map(x => chooseTxt(x));
    S.asm = Object.assign({}, S.asm, { cardRate: ASM.cardRate.fb() }); S.advRate = { cardRate: true }; applyAssume(); const h2 = document.createElement('div'); h2.innerHTML = asmInput('cardRate'); o.adv = { label: T(h2.querySelector('.flabel')), chips: [...h2.querySelectorAll('.chips button')].map(b => T(b)), note: T(h2.querySelector('#adv-cardRate')) , fb: ASM.cardRate.fb() };
    o.row = assumeRows().filter(r => /Credit-card rate|Other loans rate/.test(r[0])); o.cap = GD.cardCap; delete S.advRate; S.asm.cardRate = GD.cardCap; applyAssume(); o.rowCap = assumeRows().filter(r => /Credit-card rate/.test(r[0])); return o; });
  // 7. emergency fund goal amount = months x essential spending
  out.emerg = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; loadSample(); S.app = true; S.shell = true; const F = finNums(), e = essM(F), g = S.goals.find(x => x.k === 'safety'); const o = { essM: e, months: asmGet('safetyMonths'), auto: null, expect: Math.round(e * SAVE.buffer), buffer: SAVE.buffer };
    g.auto = true; syncSafety(); o.auto = g.amount; g.amount = 15000; g.auto = false; o.note = (safeNote(g).replace(/<[^>]+>/g, '')); o.typed = g.amount; syncSafety(); o.afterSync = g.amount; return o; });
  // 8. repayment barely covers the interest
  out.paylow = await ev(() => { loadSample(); S.src.cardBal = 'typed'; S.fin.cardBal = 6000; S.src.cardPayM = 'typed'; S.fin.cardPayM = 40; S.asm = Object.assign({}, S.asm, { cardRate: 0.22 }); applyAssume(); S.lists.cards = []; syncLists(); const o = { msg: PAY_LOW, mort: MORT_LOW, flag: payLowFlag(6000, 40, 0.22), noflag: payLowFlag(6000, 200, 0.22), noRate: payLowFlag(6000, 40, 0), thresh: 6000 * (0.22 / 12 + 0.01) }; return o; });
  // 9. partner override bounds
  out.bounds = await ev(() => Object.keys(SETBOUNDS).map(k => [k, SET[k] ? SET[k].n : k, setBoundMsg(k)]));
  // 10. developer round
  out.dev = {};
  out.dev.age = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; S = fresh(); S.scr = 'B1'; S.shell = false; lastId = null; render(); const i = document.getElementById('age-v'); const nx = document.querySelector('.foot [data-a="go"]'); return { age: S.about.age, ph: i && i.placeholder, val: i && i.value, nextDisabled: nx && nx.disabled, nextText: T(nx) }; });
  await phone('S26-age-blank.png');
  out.dev.me = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; S = fresh(); S.app = true; S.shell = true; S.tab = 'me'; S.me = 'details'; lastId = null; render(); return T(document.querySelector('#main .card')); });
  out.dev.addAge = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; S = fresh(); S.shell = true; S.app = false; S.tab = 'explore'; S.xs = [{ v: 'CALC', p: 'compound' }]; S.sheet = 'calcadd|compound'; lastId = null; render(); const s = document.querySelector('.sheet'); return s ? { h2: T(s.querySelector('h2')), sub: T(s.querySelector('p.sub')), btns: [...s.querySelectorAll('button:not(.sx)')].map(T) } : null; });
  await phone('S26-add-age-sheet.png');
  out.dev.planAge = await ev(() => { S = fresh(); S.about.partner = false; S.about.deps = 0; S.about.age = null; return { age: S.about.age }; });
  // what-if order
  out.dev.wi = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; loadSample(); S.tab = 'plan'; S.planSeg = 'main'; S.planGo = 'wi'; S.wi.g = S.goals[1].id; S.wi.m = 325; lastId = null; render(); const c = document.getElementById('r-wi'); const kids = [...c.children].map(x => (x.className || x.tagName) + ' | ' + T(x).slice(0, 70)); const gr = c.querySelector('details.wigrow'); return { kids, growSummary: T(gr.querySelector('summary')), growOpen: gr.open, growBelowLive: !!(document.getElementById('wi-live').compareDocumentPosition(gr) & 4), growBelowOut: !!(document.getElementById('wi-out').compareDocumentPosition(gr) & 4), growInside: [...gr.querySelectorAll('.fl,button,a')].map(T).filter(Boolean).slice(0, 12) }; });
  await ev(() => { document.getElementById('r-wi').scrollIntoView(); }); await tall(390, 2600); await phone('S26-whatif-order.png');
  // explore example label
  out.dev.exLabel = {};
  await tall(390, 1500);
  out.dev.exLabel.fresh = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; S = fresh(); S.shell = true; S.app = false; S.tab = 'explore'; S.xs = [{ v: 'CALC', p: 'borrow' }]; lastId = null; render(); const l = document.getElementById('exlab'); const r = document.querySelector('.exres'); return { top: T(l), topHidden: l && l.hidden, res: T(r), n: CALCS.length }; });
  await phone('S26-example-figures.png');
  out.dev.exLabel.plan = await ev(() => { loadSample(); S.app = true; S.shell = true; S.tab = 'explore'; S.xs = [{ v: 'CALC', p: 'borrow' }]; lastId = null; render(); const l = document.getElementById('exlab'); return { topHidden: l && l.hidden, res: !!document.querySelector('.exres') }; });
  out.dev.exLabel.all = await ev(() => CALCS.map(c => { S = fresh(); S.shell = true; S.app = false; S.tab = 'explore'; S.xs = [{ v: 'CALC', p: c.id }]; lastId = null; render(); const l = document.getElementById('exlab'); const r = document.querySelector('.exres'); return [c.id, !!l, !!(l && !l.hidden), !!r]; }));
  // print fallback, report dialog
  out.dev.print = await ev(() => { const s = fs => fs; return { opening: 'Opening the print window. Choose "Save as PDF" as the printer.', blocked: 'Printing is blocked here. Open this page in your browser to save the PDF.', nothing: 'Nothing opened. Printing looks blocked here. Open this page in your browser to save the PDF.' }; });
  out.dev.report = await ev(() => { loadSample(); S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render(); const b = document.querySelector('#screen [data-a="report"]'); if (b) b.focus(); openReport(); const R = document.getElementById('report'); return { on: R.classList.contains('on'), focus: document.activeElement && document.activeElement.dataset.r, role: R.getAttribute('role'), label: R.getAttribute('aria-label') }; }); await page.waitForTimeout(150); out.dev.report.inert = await ev(() => [...document.querySelectorAll('.stage,.side')].map(e => e.inert));
  await page.keyboard.press('Tab'); out.dev.report.tab2 = await ev(() => document.activeElement.dataset.r || document.activeElement.tagName); await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  out.dev.report.afterEsc = await ev(() => ({ on: document.getElementById('report').classList.contains('on'), focus: document.activeElement.dataset.a || document.activeElement.tagName, inert: [...document.querySelectorAll('.stage,.side')].map(e => e.inert) }));
  // sheet focus return
  out.dev.focus = await ev(() => { loadSample(); S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render(); const b = document.querySelector('#screen [data-a="ask"],#screen [data-a="explain"]'); return b ? b.dataset.a : null; });
  // merged banner and explorer
  out.dev.banner = await ev(() => { const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; loadSample(); S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; delete S.fin.pensionM; S.skipped = S.skipped || {}; lastId = null; render(); return { miss: T(document.getElementById('miss-banner')), rough: [...document.querySelectorAll('#main .nudge')].map(x => T(x).slice(0, 90)) }; });
  out.dev.types = await ev(() => Object.fromEntries(Object.entries(TYPES).map(([k, t]) => [k, [t.name, t.watch]])));
  return out; };
