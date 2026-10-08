// Journey-spec §27 end to end: gate card for every combination of the required choices (10 scenarios each), jump-and-highlight,
// Step 7 short, "Date has passed", number-box overlap at 360/390/1280, free retirement age (engine), labels, assumed rates in the banner.
// Run: NODE_PATH=/opt/node22/lib/node_modules node s27.js  -> "FAILS n of m", "ERRORS n".
const { chromium } = require('playwright');
const URL = 'file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html';
(async () => { const b = await chromium.launch(); let fails = 0, n = 0; const errs = [];
  const chk = (name, ok, d) => { n++; if (!ok){ fails++; console.log('FAIL |', name, '|', JSON.stringify(d)); } };
  const mkp = async w => { const p = await (await b.newContext({viewport:{width:w, height:900}})).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errs.push(m.text()); }); await p.goto(URL); await p.waitForTimeout(250); return p; };
  const p = await mkp(1280); const ev = (f, a) => p.evaluate(f, a);

  // ---- 1. every combination of the required choices, 10 customers each ----
  const NAMES = {retireAge:'retirement age', planEnd:'plan-until age', infl:'inflation rate', pRetireAge:'partner\'s retirement age'};
  let combos = 0, bad = [];
  for (let mask = 0; mask < 16; mask++) {
    const have = {ret:!!(mask & 1), end:!!(mask & 2), infl:!!(mask & 4), pret:!!(mask & 8)}; combos++;
    for (let seed = 0; seed < 10; seed++) {
      const o = await ev(([have, seed]) => {
        loadSample(); const age = 28 + (seed * 7) % 26, partner = have.pret || seed % 2 === 0;   // partner customers appear in every combination; the partner's retirement age is only asked of working partners
        S.about.age = age; S.fin.income = 28000 + (seed * 9137) % 90000; S.src.income = 'typed'; S.about.partner = partner || !!have.pret; S.fin.pIncome = S.about.partner ? 20000 + seed * 1500 : 0; S.src.pIncome = 'typed';
        S.retireSet = have.ret; S.retireAge = have.ret ? age + 12 + seed : null; if (!have.ret) delete S.retireAge;
        if (have.end) S.asm.planEnd = 85 + seed; else delete S.asm.planEnd;
        S.infl = have.infl ? [0.02, 0.025, 0.03][seed % 3] : null; S.pRetSet = have.pret; S.pRet = have.pret ? 60 + seed % 6 : undefined; applyAssume();
        const want = []; if (!have.ret) want.push('retireAge'); if (!have.end) want.push('planEnd'); if (!have.infl) want.push('infl'); if (S.about.partner && pInc() && !have.pret) want.push('pRetireAge');
        const m = planMissing().map(x => x.k), N = want.length;
        S.app = true; S.shell = true; S.pb = false; S.tab = 'plan'; S.planSeg = 'main'; S.sheet = null; lastId = null; render(); const gRes = document.getElementById('gate-res');
        const resTxt = gRes ? gRes.textContent : '', btnR = gRes ? gRes.querySelectorAll('[data-a="gofix"]').length : 0, hasNum = !!document.querySelector('#r-goals');
        S.tab = 'home'; lastId = null; render(); const gH = document.getElementById('gate-home');
        const names = gRes ? [...gRes.querySelectorAll('[data-a="gofix"]')].map(x => x.textContent) : [];
        openReport(); const repGate = !!document.getElementById('gate-report'); S.sheet = null;
        const strip = (S.tab = 'plan', lastId = null, render(), (document.getElementById('tl-strip') || {}).textContent || '');
        return {want, m, N, resTxt, btnR, hasNum, home:!!gH, homeTxt:gH ? gH.textContent : '', repGate, strip, names};
      }, [have, seed]);
      const head = N => N === 1 ? 'To see your results we need 1 thing' : 'To see your results we need ' + N + ' things';
      const ok = JSON.stringify(o.m) === JSON.stringify(o.want) && (o.N ? o.resTxt.startsWith(head(o.N)) && o.btnR === o.N && !o.hasNum && o.home && o.homeTxt.startsWith(head(o.N)) && o.repGate && o.strip.includes(head(o.N)) : !o.resTxt && o.hasNum && !o.home && !o.repGate);
      if (!ok) bad.push({mask, seed, o});
    }
  }
  chk('[s27 7] 16 combinations of the 4 required choices x 10 customers: planMissing in screen order; the card says "To see your results we need N thing(s)" on Results, Home, goal strip and the report/PDF sheet with one jump button each; nothing blocks when all are chosen (160 scenarios)', combos === 16 && !bad.length, bad.slice(0, 2));

  // ---- 2. jump and highlight: each button lands on its own box, opens its group, highlights, focuses ----
  const jumps = [];
  for (const k of ['retireAge', 'planEnd', 'infl', 'pRetireAge']) {
    const r = await ev(k => { loadSample(); S.retireSet = false; delete S.retireAge; delete S.asm.planEnd; S.infl = null; S.pRetSet = false; S.about.partner = true; S.fin.pIncome = 20000; S.src.pIncome = 'typed'; applyAssume(); S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render();
      const btn = [...document.querySelectorAll('#gate-res [data-a="gofix"]')].find(x => x.dataset.p === k); if (!btn) return {nobtn:true}; btn.click();
      const el = document.querySelector(k === 'infl' ? '[id^="infl-"].flash' : '.asmf[data-k="' + k + '"].flash') || document.querySelector('.flash'); const f = document.activeElement;
      return {tab:S.tab, me:S.me, flash:!!el, focusIn:!!(el && f && el.contains(f)), inView:!!el && el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().top < innerHeight}; }, k);
    jumps.push([k, r]);
  }
  chk('[s27 7] Each gate button jumps to its own box on Your assumptions, highlights it and puts focus in it', jumps.every(([k, r]) => !r.nobtn && r.tab === 'me' && r.me === 'asm' && r.flash), jumps);
  const flashGone = await ev(() => new Promise(res => setTimeout(() => res(!document.querySelector('.flash')), 4300)));
  chk('[s27 7] The highlight fades by itself', flashGone);

  // ---- 3. Step 7 short ----
  const s7 = await ev(() => { loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.retireSet = false; delete S.retireAge; S.infl = null; S.asm = {}; S.fin.pIncome = 0; S.pRetSet = false; S.checked = false; lastId = null; render();
    const d = document.querySelector('#p4-rest'); return {h:document.querySelector('#p4-3 h3').textContent, cnt:document.getElementById('p4-count').textContent, sum:d.querySelector('summary').textContent, open:d.open, std:[...d.querySelectorAll('.tag')].filter(t => t.textContent === 'Set by LifeMap').length, rows:document.querySelectorAll('#p4-3 .asmf, #p4-3 #p4-infl').length, useall:!!document.querySelector('[data-a="useall"]'), words:document.getElementById('p4-3').innerText.split(/\s+/).length}; });
  chk('[s27 8] Step 7: "Choose 3 things", 0 of 3 chosen, then a collapsed "What we\'ve set for you (change any)" with the standards tagged "Set by LifeMap"; no use-all button', s7.h === 'Choose 3 things' && /^0 of 3 chosen/.test(s7.cnt) && s7.sum === 'What we\'ve set for you (change any)' && !s7.open && !s7.useall && s7.rows === 3, s7);
  const s7b = await ev(() => { document.querySelector('#p4-rest').open = true; return [...document.querySelectorAll('#p4-rest .tag')].filter(t => t.textContent === 'Set by LifeMap').length; });
  chk('[s27 8] The collapsed list holds the automatic standards (at least 15 tagged "Set by LifeMap")', s7b >= 15, s7b);
  const s7c = await ev(() => { S.fin.pIncome = 15000; S.src.pIncome = 'typed'; S.about.partner = true; lastId = null; render(); return {h:document.querySelector('#p4-3 h3').textContent, cnt:document.getElementById('p4-count').textContent}; });
  chk('[s27 8] A working partner makes it "Choose 4 things"', s7c.h === 'Choose 4 things' && /^0 of 4 chosen/.test(s7c.cnt), s7c);

  // ---- 4. "Date has passed" ----
  const dp = await ev(() => { loadSample(); const g = S.goals.find(x => x.kind !== 'retire' && x.kind !== 'legacy'); g.age = S.about.age - 4; S.app = true; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; lastId = null; render();
    const txt = () => document.body.innerText; const a = txt(); S.tab = 'home'; lastId = null; render(); const h = txt(); S.tab = 'plan'; S.planSeg = 'results'; lastId = null; render(); const rtxt = txt(); S.planSeg = 'main'; render();
    const btn = [...document.querySelectorAll('[data-a="gdate"]')]; const all = a + h + rtxt; const sh = (S.sheet = 'assume', render(), document.body.innerText); S.sheet = null; render();
    return {passed:/Date has passed/.test(all), neg:/in -\d+ years?|-\d+ years/.test(all + sh), btns:btn.length, btnTxt:btn[0] && btn[0].textContent, id:g.id, name:g.name}; });
  chk('[s27 1] A goal dated before today reads "Date has passed" (never "in -4 years") with a "Change the date" button', dp.passed && !dp.neg && dp.btns >= 1 && dp.btnTxt === 'Change the date', dp);
  const dp2 = await ev(id => { document.querySelector('[data-a="gdate"]').click(); const r = document.getElementById('row-' + id); return {tab:S.tab, row:!!r, hl:S.tlHl === id}; }, dp.id);
  chk('[s27 1] "Change the date" opens the goal in My Plan, highlighted, with the date stepper to hand', dp2.tab === 'plan' && dp2.row && dp2.hl, dp2);
  const dp3 = await ev(id => { const g = S.goals.find(x => x.id === id); g.age = S.about.age + 5; render(); return /Date has passed/.test(document.body.innerText) || !!document.querySelector('[data-a="gdate"]'); }, dp.id);
  chk('[s27 1] Moving the date to the future removes the wording and the button', dp3 === false, dp3);
  const dp4 = await ev(() => { loadSample(); const g = S.goals.find(x => x.kind !== 'retire' && x.kind !== 'legacy'); g.age = S.about.age; render(); return !/Date has passed/.test(document.body.innerText); });
  chk('[s27 1] A goal dated this year (age = today) is not "passed"', dp4);

  // ---- 5. free retirement age, engine ----
  const ages = [40, 45, 50, 55, 60, 66, 75]; const er = [];
  for (const partner of [false, true]) for (const access of [60, 50]) {
    const o = await ev(([ages, partner, access]) => { const out = [];
      for (const R of ages) { loadSample(); S.about.age = 36; S.fin.income = 52000; S.src.income = 'typed'; S.about.partner = partner; S.fin.pIncome = partner ? 30000 : 0; S.src.pIncome = 'typed'; S.pRetSet = partner; S.pRet = partner ? 62 : undefined;
        S.retireSet = true; S.retireAge = R; S.asm.planEnd = 92; if (access === 50) S.asm.accessAge = 50; else delete S.asm.accessAge; S.fin.cash = 15000; S.src.cash = 'typed'; S.fin.invest = 0; S.src.invest = 'typed'; applyAssume();
        const P = project(), rows = P.rows, fin = rows.every(r => [r.liquid, r.inflow, r.living, r.shortLiving, r.pen].every(Number.isFinite)), ret = rows.find(r => r.retired), acc = Math.max(R, +asmV('accessAge')), bridge = rows.filter(r => r.a >= R && r.a < acc && r.a < RI.sp.age);
        out.push({R, fin, retFirst:ret && ret.a, bridgeN:bridge.length, bridgeShort:Math.round(bridge.reduce((s, r) => s + (r.shortLiving || 0), 0)), end:rows[rows.length - 1].a, note:retNote(R), notes:{lt50:R < 50, lt60:R < 60}, pct:S.goals.map(g => P.pct[g.id]), ok:S.goals.every(g => Number.isFinite(P.pct[g.id]))}); }
      return out; }, [ages, partner, access]);
    er.push({partner, access, o});
  }
  const erBad = []; er.forEach(({partner, access, o}) => o.forEach(r => { if (!r.fin || !r.ok || r.end !== 91 && r.end !== 92 || r.retFirst !== r.R) erBad.push({partner, access, r}); }));
  chk('[s27 3] Retirement ages 40,45,50,55,60,66,75, with and without a partner, access age 60 and 50: engine finite, retirement starts at the chosen age, plan runs to 92', er.length === 4 && !erBad.length, erBad.slice(0, 3));
  const mono = er.map(({partner, access, o}) => ({partner, access, short:o.map(r => r.bridgeShort), n:o.map(r => r.bridgeN)}));
  const bridgeOK = mono.every(m => m.n[0] > m.n[3] || m.access === 50) && er.every(({access, o}) => access === 60 ? o[0].bridgeN === 20 && o[2].bridgeN === 10 && o[4].bridgeN === 0 && o[5].bridgeN === 0 : o[2].bridgeN === 0 && o[0].bridgeN === 10 && o[1].bridgeN === 5);
  chk('[s27 3] Bridge years (retired but pension not yet drawable and before State Pension): 20 at age 40, 10 at 50, none at 60 and over for access 60; access 50 moves them (10 at 40, 5 at 45, 0 at 50)', bridgeOK, mono);
  chk('[s27 3] Retiring before the pension age shows a shortfall funded from savings (positive bridge shortfall for a customer with only 15,000 saved at 40 or 45)', er.every(({o}) => o[0].bridgeShort > 0 && o[1].bridgeShort > 0), mono.map(m => m.short));
  const notes = await ev(() => [30, 49, 50, 59, 60, 70].map(a => [a, retNote(a)]));
  chk('[s27 3] Calm notes only below 50 and below 60; none from 60', !!notes[0][1] && !!notes[1][1] && /Retiring before 50/.test(notes[1][1]) && !!notes[2][1] && /usually be drawn from 60/.test(notes[2][1]) && !!notes[3][1] && !notes[4][1] && !notes[5][1], notes);
  const lim = await ev(() => { loadSample(); S.about.age = 36; S.asm.planEnd = 90; return {min:retMin(), max:retMax()}; });
  chk('[s27 3] Retirement age may be any age from today\'s age + 1 to plan-until age - 1', lim.min === 37 && lim.max === 89, lim);

  // ---- 6. labels ----
  const lab = await ev(() => { loadSample(); S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'safety'; render(); const tg = [...document.querySelectorAll('.asmf .tag')].map(t => t.textContent); return {sets:tg.filter(t => t === 'Set by LifeMap').length, assumed:tg.filter(t => t === 'Assumed: add yours').length, mine:tg.filter(t => t === 'Your choice').length, bad:tg.filter(t => !['Set by LifeMap', 'Assumed: add yours', 'Your choice', 'Not chosen yet', 'Optional', 'Set by Government · 2026', 'Usually €0–€299.30 a week'].includes(t) && !/^Usually/.test(t))}; });
  chk('[s27 5] Labels on Your assumptions are only Set by LifeMap / Your choice / Assumed: add yours / Not chosen yet / Optional', !lab.bad.length && lab.sets > 10, lab);
  const asm = await ev(() => { S = fresh(); Object.assign(S.ans, {'2':0, '4':1, '7':1, '8':2, '9':2, '12':1}); S.about = {age:40, partner:false, deps:0, married:null}; ['travel', 'retire'].forEach(k => S.goals.push(mkGoal(k))); S.fin.home = 'Own with mortgage'; S.fin.mortBal = 150000; S.src.mortBal = 'typed'; S.fin.mortPayM = 900; S.src.mortPayM = 'typed'; S.fin.mortYears = 20; S.src.mortYears = 'typed'; S.fin.cardBal = 1000; S.src.cardBal = 'typed'; S.fin.cardPayM = 100; S.src.cardPayM = 'typed'; S.fin.loanBal = 4000; S.src.loanBal = 'typed'; S.fin.loanPayM = 150; S.src.loanPayM = 'typed'; S.retireSet = true; S.retireAge = 65; S.asm.planEnd = 90; S.infl = 0.02; S.app = true; S.shell = true; applyAssume();
    const flags = missingFlags().map(x => x.k), rates = {mort:AS.mortRate, loan:AS.loanRate, card:AS.cardRate}; S.tab = 'plan'; render(); return {flags, rates, blocked:!planReady(), banner:(document.getElementById('miss-banner') || {}).textContent || ''}; });
  chk('[s27 5] A mortgage, card and loan with no rates: not blocked; rates assumed (CBI 3.48% and 6.72%, planning 20% card) and each counted in the "N details missing" banner', !asm.blocked && ['mortRate', 'cardRate', 'loanRate'].every(k => asm.flags.includes(k)) && asm.rates.mort === 0.0348 && asm.rates.loan === 0.0672 && asm.rates.card === 0.2 && /details missing/.test(asm.banner), asm);

  // ---- 7. number box: unit never overlaps the digits ----
  const ov = [];
  for (const w of [360, 390, 1280]) { const q = await mkp(w);
    await q.evaluate(() => { loadSample(); S.fin.home = 'Own with mortgage'; ACT.fix(String(FSEC.findIndex(s => s.id === 'liab'))); }); await q.waitForTimeout(250);
    for (const v of ['12.345', '100', '7']) { await q.fill('#f-mortRate', v); await q.waitForTimeout(80);
      const g = await q.evaluate(() => { const i = document.querySelector('#f-mortRate'), c = i.parentElement.querySelector('.cur'), ir = i.getBoundingClientRect(), cr = c.getBoundingClientRect(); const cv = document.createElement('canvas').getContext('2d'), cs = getComputedStyle(i); cv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; const tw = cv.measureText(i.value).width, pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight); const ta = cs.textAlign;
        const textStart = ir.left + pl, textEnd = textStart + tw; return {textEnd:Math.round(textEnd), unitLeft:Math.round(cr.left), unitRight:Math.round(cr.right), inRight:Math.round(ir.right), pr, within:cr.left >= ir.left && cr.right <= ir.right + 1, clash:textEnd > cr.left + 0.5 && cr.width > 0 && cs.direction !== 'rtl' && (ta === 'right' ? false : true), scroll:i.scrollWidth > i.clientWidth + 1}; });
      ov.push({w, v, g}); }
    await q.evaluate(() => { S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'safety'; render(); }); await q.waitForTimeout(150);
    for (const v of ['12.345', '100']) { const sel = '[data-nb="asm|mortRate"]'; if (!(await q.locator(sel).count())) continue; await q.fill(sel, v); await q.waitForTimeout(80);
      const g = await q.evaluate(sel => { const i = document.querySelector(sel), u = i.parentElement.querySelector('.nbu'), ir = i.getBoundingClientRect(), ur = u.getBoundingClientRect(); return {inRight:Math.round(ir.right), unitLeft:Math.round(ur.left), apart:ur.left >= ir.right - 1, scroll:i.scrollWidth > i.clientWidth + 1}; }, sel); ov.push({w, v, nb:g}); }
    await q.context().close(); }
  chk('[s27 2] Percent box at 360, 390 and 1280 with 12.345, 100 and 7: the % sits clear of the digits (text ends before the %, nothing clipped); same for the assumptions number box', ov.every(x => x.g ? !x.g.clash && !x.g.scroll : x.nb.apart && !x.nb.scroll), ov.filter(x => x.g ? x.g.clash || x.g.scroll : !x.nb.apart || x.nb.scroll));
  const euro = await ev(() => { loadSample(); S.fin.home = 'Own with mortgage'; ACT.fix(String(FSEC.findIndex(s => s.id === 'liab'))); const i = document.querySelector('#f-mortBal'), c = i.parentElement.querySelector('.cur'), cr = c.getBoundingClientRect(), ir = i.getBoundingClientRect(); return {curLeft:cr.left - ir.left, curRight:cr.right - ir.left, pad:parseFloat(getComputedStyle(i).paddingLeft)}; });
  chk('[s27 2] The euro prefix sits at the left inside its box, clear of the digits (right edge of the € before the text padding)', euro.curLeft >= 0 && euro.curRight <= euro.pad, euro);

  // ---- 8. recheck 2: N2 deposit rate, N4 heading ----
  const n2 = await ev(() => { S = fresh(); applyAssume(); const c = C('rentbuy'), v = {}; c.inputs.forEach(i => v[i.k] = i.v); const base = c.run(v).num.Opportunity_Cost; S.asm = {depEarn:0}; applyAssume(); const zero = c.run(v).num.Opportunity_Cost; S = fresh(); applyAssume();
    S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'prices'; S.shell = true; render(); const f = document.querySelector('[data-k="depEarn"]'); return {rate:asmV('depEarn'), base, zero, tag:f.querySelector('.tag').textContent, using:/We are using 1\.29% \(Central Bank of Ireland/.test(f.textContent), back:!!document.querySelector('[data-k="depEarn"] [data-a="asmback"]')}; });
  chk('[N2] An unchosen deposit-earn rate uses the suggested published rate (1.29% after DIRT): opportunity cost is not 0, tagged "Assumed: add yours"; a typed 0 still means 0', n2.rate === 0.0129 && n2.base > 4000 && n2.zero === 0 && n2.tag === 'Assumed: add yours' && n2.using, n2);
  const h4 = await ev(() => { const r = []; for (const partner of [false, true]) { loadSample(); S.about.partner = partner; S.fin.pIncome = partner ? 20000 : 0; S.src.pIncome = 'typed'; S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.retireSet = false; delete S.retireAge; S.infl = null; delete S.asm.planEnd; S.pRetSet = false; lastId = null; render();
      const t0 = document.querySelector('#p4-3 h3').textContent, n = reqKeys().length; S.retireSet = true; S.retireAge = 65; S.asm.planEnd = 90; S.infl = 0.02; S.pRetSet = true; S.pRet = 62; lastId = null; render(); r.push({n, t0, t1:document.querySelector('#p4-3 h3').textContent, c:document.getElementById('p4-count').textContent}); } return r; });
  chk('[N4] Step 7 heading: "Choose N things" while choosing, "All N chosen" when none is left (3 and 4)', h4[0].t0 === 'Choose 3 things' && h4[0].t1 === 'All 3 chosen' && h4[1].t0 === 'Choose 4 things' && h4[1].t1 === 'All 4 chosen' && /^4 of 4 chosen/.test(h4[1].c), h4);

  const eg = await ev(() => { const bad = []; for (const c of CALCS) { S = fresh(); S.infl = null; S.adjInfl = {}; CALCS.forEach(x => S.adjInfl[x.id] = true); S.asm = {}; applyAssume(); const v = {}; c.inputs.forEach(i => v[i.k] = i.v); const r = c.run(v), line = r.line || ''; if (/to see this/.test(line)) bad.push([c.id, line.slice(0, 160)]); } return bad; });
  chk('[C10] With "Adjust for inflation" on and no inflation chosen, no calculator sentence has a gate string inside it (28 calculators; lump-sum waiting sentence left out)', !eg.length, eg);
  const lw = await ev(() => { S = fresh(); S.infl = null; S.adjInfl = {lumpsum:true}; S.asm = {}; applyAssume(); const c = C('lumpsum'), v = {}; c.inputs.forEach(i => v[i.k] = i.v); const a = c.run(v).line; S.infl = 0.02; applyAssume(); const b = c.run(v).line; return {a, b}; });
  chk('[C10] Lump sum: gated line keeps "Choose your inflation rate to see it in today\'s money." and drops the waiting sentence; with inflation chosen the waiting sentence reads "could mean about €X less"', /^Choose your inflation rate to see it in today's money\./.test(lw.a) && !/Waiting/.test(lw.a) && /Waiting 5 years before starting could mean about €[\d,]+ less, which is the cost of waiting/.test(lw.b), lw);
  chk('No console errors', errs.length === 0, errs);
  console.log('FAILS', fails, 'of', n, 'ERRORS', errs.length); await b.close(); })();
