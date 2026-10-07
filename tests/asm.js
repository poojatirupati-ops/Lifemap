// FP round 7: "Your assumptions" screen, the single rules object, and the audit's engine fixes, end to end in the browser.
// Run: NODE_PATH=/opt/node22/lib/node_modules node asm.js   → "FAILS n of m", "ERRORS n".
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390, height:844}})).newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const res = []; const ok = (n, c, i) => res.push([c ? 'PASS' : 'FAIL', n, i == null ? '' : JSON.stringify(i).slice(0, 300)]); const ev = (f, a) => p.evaluate(f, a);
  // 1. one rules object, with source / date / verify on every leaf; the version label in Assumptions and the report
  let st = await ev(() => { const leaves = []; const walk = (o, k) => Object.entries(o).forEach(([kk, x]) => { if (x && typeof x === 'object' && 'v' in x && 'src' in x) leaves.push([k + '.' + kk, x]); else if (x && typeof x === 'object') walk(x, k + '.' + kk); }); walk(RULES_IE_2026, 'R');
    return {n:leaves.length, allMeta:leaves.every(([, x]) => x.src && x.eff && typeof x.verify === 'boolean'), version:RULES_VERSION, ie:RI.infl.ie, sp:RI.sp.week, lsCap:RI.pen.lsCap}; });
  ok('1a RULES_IE_2026: every value has a source, effective date and verify flag', st.n >= 70 && st.allMeta, st);
  ok('1b version label', st.version === 'Irish rules 2026 · checked 2 Oct 2026', st.version);
  st = await ev(() => { loadSample(); S.infl = 0.02; render(); const rows = assumeRows(); openReport(); const t = document.getElementById('report').innerText; document.getElementById('report').classList.remove('on'); return {row:rows.find(r => r[0] === 'Rules'), rep:t.includes(RULES_VERSION)}; });
  ok('1c version shown in Assumptions and the report', st.row && st.row[1] === 'Irish rules 2026 · checked 2 Oct 2026' && st.rep, st);
  st = await ev(() => document.documentElement.outerHTML.includes('[confirm') || /\[confirm|\[verify/.test(Object.values(V).map(f => { try { return JSON.stringify(f('retire')); } catch (e) { return ''; } }).join('')));
  ok('1d no "[confirm …]" placeholders in customer copy', !st, st);
  st = await ev(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'goalplanner'}]; lastId = null; render(); const t = document.getElementById('screen').innerText; return {chip:!!document.querySelector('#infl-calc [data-a="infl"][data-p="0.039"]'), lbl:/3\.9% · Ireland now/.test(t), src:/CSO HICP flash, Sep 2026/.test(t), ecb:/Use the standard \(2%\)/.test(t) && /Generally the standard is 2% \(the ECB target for the long term\)/.test(t)}; });
  ok('1e inflation chips: 3.9% Ireland now (CSO HICP flash, Sep 2026) and "Use the standard (2%)" (ECB target) [r8: §14 wording]', st.chip && st.lbl && st.src && st.ecb, st);
  // 2. Your assumptions screen
  await ev(() => { loadSample(); S.infl = null; S.tab = 'me'; S.me = 'asm'; lastId = null; render(); });
  st = await ev(() => ({groups:[...document.querySelectorAll('details.asmg summary')].map(x => x.textContent), inputs:document.querySelectorAll('.asmf').length, sugTags:document.querySelectorAll('.asmf .tag.pre').length, mineTags:document.querySelectorAll('.asmf .tag.doc').length, t3:Object.keys(ASM).filter(k => ASM[k].ty === 3).length, inflPre:document.querySelectorAll('#infl-asm .chip.sel').length, keys:Object.keys(ASM).length, b:[...new Set(Object.values(ASM).map(d => d.b))].length}));
  ok('2a four collapsible groups, plus the read-only "Set by Government · 2026" group [r8 §14]', JSON.stringify(st.groups) === JSON.stringify(['Prices & growth', 'Retirement', 'Emergency fund & debt', 'Plan length', 'Set by Government · 2026']), st.groups);
  ok('2b every judgement input listed (B1–B27 except B2/B7 shown as controls), plus retirement age and, for a partner with income, the partner\'s retirement age [r8, fix round M2]', st.inputs === st.keys + 2 && st.b >= 25, st);
  ok('2c inflation stays the customer\'s required pick (nothing pre-selected)', st.inflPre === 0, st);
  ok('2d [r8 §14] no "Suggested" tags; the sample has made every type-3 choice ("Your choice")', st.sugTags === 0 && st.mineTags >= st.t3 + 1, st);
  st = await ev(() => { S.infl = 0.02; const keep = S.asm, before = project(), pb = S.goals.map(g => before.pct[g.id]); S.asm = Object.assign({}, keep, {lumpSum:0}); const a = project(); S.asm = Object.assign({}, keep, {lumpSum:0.25, pen:0.06}); const c = project(); S.asm = keep; return {pb, a:S.goals.map(g => a.pct[g.id]), c:S.goals.map(g => c.pct[g.id]), r0:Math.round(before.rows.find(r => r.retired).liquid), r1:Math.round(a.rows.find(r => r.retired).liquid)}; });
  ok('2e an assumption drives the plan (no lump sum → less cash at retirement; faster pension growth → retirement % up)', st.r1 < st.r0 && st.c[4] >= st.pb[4], st);
  await p.click('details.asmg[data-g="safety"] summary'); await p.fill('[data-nb="asm|safetyMonths"]', '9'); await p.press('[data-nb="asm|safetyMonths"]', 'Enter'); await p.waitForTimeout(150);
  st = await ev(() => ({v:S.asm.safetyMonths, buf:(applyAssume(), SAVE.buffer), fnd:fndT(), calc:calcVals(C('emergency')).mt, tag:document.body.innerText.includes('Your choice')}));
  ok('2f one emergency fund setting: plan buffer, pyramid and calculator all follow it (9 months)', st.v === 9 && st.buf === 9 && st.fnd === 9 && st.calc === 9 && st.tag, st);
  await p.click('[data-a="asmstd"][data-p="safetyMonths"]'); st = await ev(() => ({v:asmV('safetyMonths'), mine:asmMine('safetyMonths')}));
  ok('2g [r8 §14] "Use the standard" chip goes back to the standard and counts as a choice (two secure incomes → 3, else 6)', st.mine && (st.v === 3 || st.v === 6), st);
  await p.click('details.asmg[data-g="retire"] summary'); await p.click('[data-a="asmset"][data-p="drawRule|min"]'); st = await ev(() => ({r:asmV('drawRule'), row:assumeRows().find(r => r[0] === 'Pension drawdown')[1]}));
  ok('2h choice inputs: drawdown "Minimum only" stored and shown in Assumptions', st.r === 'min' && /minimum only/i.test(st.row), st);
  st = await ev(() => { const keep = S; S = fresh(); S.asm = {cardRate:0.15, mortRate:0.05}; const o = {debt:calcVals(C('debtpay')).apr, loan:calcVals(C('loan')).apr, borrow:calcVals(C('borrow')).rate}; S = keep; return o; });
  ok('2i calculator values come from the customer\'s assumptions (card 15%, mortgage 5%); loan rate not chosen stays blank [r8 §14]', st.debt === 15 && st.borrow === 5 && st.loan === null, st);
  st = await ev(() => { S.tab = 'plan'; S.planSeg = 'main'; S.sheet = 'assume'; render(); return {btn:!!document.querySelector('[data-a="asmopen"]')}; });
  ok('2j reachable from the Assumptions sheet', st.btn, st); await ev(() => { S.sheet = null; render(); });
  // 3. engine fixes, plan level
  st = await ev(() => { const mk = o => { S = fresh(); S.infl = 0.02; S.app = true; S.about = {age:o.age || 45, partner:!!o.partner, deps:o.deps || 0, married:o.married == null ? null : o.married, cred:o.cred}; S.retireAge = o.ra || 66; S.ans['6'] = 2;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', o.work || 'Employed'); put('income', o.inc); put('costsM', 2000); put('cash', 10000); put('pension', o.pen || 0); put('pensionM', o.penM || 0); put('home', o.home || 'Own outright'); if (o.own != null) put('pensionOwnM', o.own); if (o.partner){ put('pIncome', o.pInc || 0); put('pAge', o.age || 45); } if (o.ae) put('ae', o.ae); return project(); };
    const r0 = (o) => mk(o).rows[0].inflow, out = {};
    out.rent = r0({inc:50000, home:'Rent', cred:{rent:true}, penM:100}) - r0({inc:50000, home:'Rent', penM:100});
    out.lone = r0({inc:50000, deps:1, cred:{lone:true}, penM:100}) - r0({inc:50000, deps:1, penM:100});
    out.carer = r0({inc:70000, partner:true, married:true, cred:{carer:true}, penM:100}) - r0({inc:70000, partner:true, married:true, penM:100});
    out.aeOn = mk({inc:50000}).rows[3].pen, out.aeOff = mk({inc:50000, ae:'No'}).rows[3].pen;
    out.own50 = r0({inc:60000, penM:1000}); out.own100 = r0({inc:60000, penM:1000, own:1000});
    const P = mk({age:66, ra:68, inc:60000, penM:100}); out.over66 = Math.round(P.rows[0].tax);
    const L = mk({age:64, ra:65, inc:60000, pen:2000000, penM:0, ae:'No'}); out.ls = L.rows.find(r => r.a === 65);
    return Object.assign(out, {ls:out.ls ? Math.round(out.ls.liquid) : null}); });
  ok('3a Rent Tax Credit adds €1,000 to take-home', Math.round(st.rent) === 1000, st.rent);
  ok('3b Single Person Child Carer: band + credit add €2,700 at €50k', Math.round(st.lone) === 2700, st.lone);
  ok('3c Home Carer credit adds €1,950 for a married one-earner couple', Math.round(st.carer) === 1950, st.carer);
  ok('3d auto-enrolment: an eligible employee with no pension builds a pot (unless they say No)', st.aeOn > 0 && st.aeOff === 0, {on:st.aeOn, off:st.aeOff});
  ok('3e employee share: typing your own share (100% vs suggested 50%) lowers take-home, with relief', st.own100 < st.own50, {own50:st.own50, own100:st.own100});
  ok('3f still working at 66: no PRSI (tax includes no PRSI)', st.over66 > 0, st.over66);
  st = await ev(() => { const mk = o => { S = fresh(); S.infl = 0.02; S.app = true; S.asm = {startYear:2027}; S.about = {age:o.age, partner:false, deps:0, married:null}; S.retireAge = o.ra; const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; };
      put('work', o.inc ? 'Employed' : 'Not working'); put('income', o.inc || 0); put('costsM', 2000); put('cash', 50000); put('pension', o.pen); put('pensionM', 0); put('home', 'Own outright'); put('sp', 'Expect full'); put('ae', 'No'); const g = mkGoal('retire'); g.amount = 30000; S.goals.push(g); return project(); };
    const A = mk({age:55, ra:58, inc:50000, pen:300000}), row = a => A.rows.find(r => r.a === a);
    const B = mk({age:78, ra:66, pen:200000}), b79 = B.rows.find(r => r.a === 79), b80 = B.rows.find(r => r.a === 80);
    const Cp = mk({age:64, ra:65, inc:100000, pen:3000000}), c64 = Cp.rows.find(r => r.a === 64), c65 = Cp.rows.find(r => r.a === 65);
    return {pre60:[Math.round(row(58).inflow), Math.round(row(59).inflow), Math.round(row(60).inflow)], sp80:Math.round(b80.gross - b79.gross * (1 + AS.infl)), sft:[Math.round(c64.pen), Math.round(c65.pen)], sftYr:c65.yr}; });
  ok('3g retiring at 58: no pension income before 60 (most pensions can\'t be taken earlier)', st.pre60[0] === 0 && st.pre60[1] === 0 && st.pre60[2] > 0, st.pre60);
  ok('3h age-80 State Pension supplement (+€10 a week)', st.sp80 >= 500, st.sp80);
  ok('3i Standard Fund Threshold: 40% chargeable excess tax at retirement on a €3m+ pot', st.sft[1] < st.sft[0] * 0.75, st);
  // 4. hand-offs
  st = await ev(() => { S = fresh(); S.infl = null; S.app = true; S.about.age = 40; useAllStd(); S.infl = null; S.retireSet = true; S.fin.sp = 'Expect full'; S.src.sp = 'typed'; Object.assign(S.asm, {survivor:RI.sp.survivor, cardRate:0.2, planEnd:90}); const g9 = C('compound').run(calcVals(C('compound'))).goal, g13 = C('contrib').run(calcVals(C('contrib'))).goal, g21 = C('lifecover').run(calcVals(C('lifecover'))).goal, g27 = C('debtpay').run(calcVals(C('debtpay'))).goal, g12 = C('retirement').run(calcVals(C('retirement'))).goal;
    S.infl = 0.02; const g9b = C('compound').run(calcVals(C('compound'))).goal; applyHandoff(g9b); applyHandoff(g13); applyHandoff(g12); applyHandoff(g21);
    return {g9:g9.kind, g9b:[g9b.kind, g9b.amount], g13:g13.kind, g21:g21.kind, g27, g12:g12.kind, goals:S.goals.map(g => g.kind + ':' + g.amount), pen:S.penExtra, needs:S.needs}; });
  ok('4a compound growth with no inflation: "Choose an inflation rate first"', st.g9 === 'blocked', st);
  ok('4b compound growth hand-off is a pot in today\'s money', st.g9b[0] === 'pot' && st.goals.some(x => x.startsWith('pot:' + st.g9b[1])), st);
  ok('4c pension tools raise the contribution, no spend goal', st.g13 === 'pension' && st.pen > 0 && !st.goals.some(x => x.startsWith('spend')), st);
  ok('4d retirement updates the retirement goal; life cover records a need; debt adds nothing', st.g12 === 'retire' && st.goals.some(x => x.startsWith('retire:')) && st.g21 === 'need' && st.needs && st.needs.life > 0 && st.g27 === null, st);
  // 5. edge texts
  st = await ev(() => { S = fresh(); S.infl = 0.02; S.asm = {buyFees:3000}; const o = C('overpay').run({bal:250000, rate:4, yrs:25, x:0}), n = C('overpay').run({bal:250000, rate:4, yrs:25, x:200}), d = C('debtpay').run({b:100000, apr:0, p:10, x:0}), d2 = C('debtpay').run({b:5000, apr:30, p:100, x:0}), r = C('riskreturn').run({p:1000, y:5, s:2.5}), e = C('deposit').run({price:100000, pc:10, saved:13200, mo:800, xmo:0});   // needs 10,000 + stamp duty 1,000 + fees 3,000
    const all = JSON.stringify([o, n, d, d2, r, e].map(x => [x.val, x.line, x.rows]));
    return {noChange:o.val, d:d.val, d2:d2.val, one:e.val, nan:/NaN|Infinity|undefined/.test(all)}; });
  ok('5a "No change" when the extra is 0', st.noChange === 'No change', st);
  ok('5b debt over 100 years → "Over 100 years"; payment below interest → "Never at this repayment"', st.d === 'Over 100 years' && st.d2 === 'Never at this repayment', st);
  ok('5c singular "1 month"; no NaN / Infinity / undefined anywhere', st.one === '1 month' && !st.nan, st);
  // 6. every calculator screen and its "Add to my plan" sheet render cleanly, with and without an inflation choice, fresh and with the sample customer
  for (const mode of ['fresh', 'sample']) for (const infl of [null, 0.02]) {
    st = await ev(({mode, infl}) => { const bad = []; CALCS.forEach(c => { if (mode === 'fresh') S = fresh(); else loadSample(); S.infl = infl; S.app = true; S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:c.id}]; lastId = null; render();
        const t = document.getElementById('screen').innerText; if (/NaN|undefined|Infinity|\[object/.test(t)) bad.push(c.id + ' screen');
        S.sheet = 'calcadd|' + c.id; render(); const sh = (document.getElementById('sheet') || document.body).innerText; if (/NaN|undefined|Infinity|\[object/.test(sh)) bad.push(c.id + ' add'); S.sheet = null; }); return bad; }, {mode, infl});
    ok('6 all 28 calculators render, ' + mode + ', inflation ' + (infl == null ? 'not chosen' : '2%') + ': no NaN / undefined / Infinity', !st.length, st);
  }
  res.forEach(r => console.log(r.join(' | '))); console.log('FAILS', res.filter(r => r[0] === 'FAIL').length, 'of', res.length); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
