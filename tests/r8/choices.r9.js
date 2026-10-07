// FP round 8: journey-spec §14 (defaults vs customer choice). Every type-3 item starts blank on a fresh customer; results show
// "Choose your …"; the standard chip fills it; "Use the standard for all of these" skips retirement age and plan-until age; type 1 is not editable.
// Run: NODE_PATH=/opt/node22/lib/node_modules node choices.js   → "FAILS n of m" and "ERRORS n".
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:1280, height:900}}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const res = []; const chk = (name, ok, info) => res.push([ok ? 'PASS' : 'FAIL', name, info === undefined ? '' : typeof info === 'string' ? info : JSON.stringify(info)]);
  const ev = (f, a) => p.evaluate(f, a); const click = async s => { await p.click(s); await p.waitForTimeout(60); };
  // A fresh customer who has reached step 7 (Check your details): goals, finances typed, no choices made
  const fresh7 = () => ev(() => { S = fresh(); Object.assign(S.ans, {'2':0, '4':1, '7':1, '8':2, '9':2, '12':1}); S.why = ['track']; S.about = {age:40, partner:false, deps:0, married:null}; S.acct.name = 'Test';
    ['travel', 'retire'].forEach(k => S.goals.push(mkGoal(k))); const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; };
    put('work', 'Employed'); put('income', 50000); put('costsM', 2000); put('home', 'Rent'); put('cash', 5000); put('invest', 0); put('cardBal', 0); put('loanBal', 0); put('pension', 30000); put('pensionM', 400); put('sp', 'Not sure');
    S.shell = true; S.pb = true; S.scr = 'P4'; S.checked = true; lastId = null; render(); });
  await fresh7();
  // 1. type-3 items blank on a fresh customer
  const blank = await ev(() => { const t3 = ASM_KEYS().filter(k => ASM[k].ty === 3); return {n:t3.length, chosen:t3.filter(asmMine), infl:S.infl, retireSet:S.retireSet, planEnd:asmGet('planEnd')}; });
  chk('Fresh customer: all ' + blank.n + ' type-3 assumptions blank', blank.chosen.length === 0, blank.chosen);
  chk('Fresh customer: inflation, retirement age and plan-until age not chosen', blank.infl == null && blank.retireSet === false && blank.planEnd == null, blank);
  // 2. step 7 asks for them; results stay locked with "Choose your …"
  const p4 = await ev(() => ({dis:document.getElementById('seeres').disabled, need:(document.getElementById('p4-need') || {}).textContent || '', asm:!!document.getElementById('p4-asm'), infl:!!document.querySelector('#p4-infl [data-a="infl"]'), ret:document.querySelector('[data-nb="ret|a"]') ? document.querySelector('[data-nb="ret|a"]').value : 'none', end:document.querySelector('[data-nb="asm|planEnd"]') ? document.querySelector('[data-nb="asm|planEnd"]').value : 'none'}));
  chk('Step 7 has the "Your assumptions" step next to the inflation choice', p4.asm && p4.infl, p4);
  chk('Step 7: retirement-age and plan-until boxes are blank', p4.ret === '' && p4.end === '', p4);
  chk('Step 7: "See my results" locked, says "Choose your inflation rate"', p4.dis && /^Choose your inflation rate/.test(p4.need), p4.need);
  const g = await ev(() => ({res:resultsHTML().includes('Choose your'), strip:tlStrip().includes('Choose your'), boxes:[...document.querySelectorAll('#p4-asm [data-nb^="asm|"]')].every(i => i.value === '')}));
  chk('Results and goal strip show "Choose your …" instead of numbers', g.res && g.strip, g);
  chk('Every type-3 number box in step 7 starts blank', g.boxes);
  const noSel = await ev(() => [...document.querySelectorAll('#p4-asm [data-a="asmset"]')].filter(x => x.classList.contains('sel')).length);
  chk('No choice chip pre-selected', noSel === 0, noSel);
  // 3. one standard chip fills its item (and counts as the customer's choice)
  await ev(() => { S.asmOpen = 'p4'; render(); }); await click('#p4-asm [data-a="asmstd"][data-p="cash"]');
  const c1 = await ev(() => ({v:asmGet('cash'), std:ASM.cash.sug(), tag:document.querySelector('[data-k="cash"] .tag').textContent}));
  chk('"Use the standard (1%)" chip fills cash growth and tags it "Your choice"', c1.v === c1.std && c1.tag === 'Your choice', c1);
  const chipTxt = await ev(() => document.querySelector('#p4-asm [data-a="asmstd"][data-p="wage"]').textContent);
  chk('Standard chip wording: "Use the standard (3%)"', chipTxt === 'Use the standard (3%)', chipTxt);
  const guide = await ev(() => document.querySelector('[data-k="wage"] .small').textContent);
  chk('Type-3 wording: "Generally the standard is 3% (…). Choose what you want to use."', /^Generally the standard is 3% \(.+\)\. Choose what you want to use\./.test(guide), guide);
  // 4. "Use the standard for all of these" never sets retirement age or plan-until age
  await click('#p4-asm [data-a="useall"]');
  const ua = await ev(() => ({left:ASM_KEYS().filter(k => asmStd(k) && !asmMine(k)), infl:S.infl, retireSet:S.retireSet, planEnd:asmGet('planEnd'), miss:planMissing().map(x => x.k), dis:document.getElementById('seeres').disabled, need:(document.getElementById('p4-need') || {}).textContent}));
  chk('Use all: every type-3 item chosen, inflation set to the standard 2%', ua.left.length === 0 && ua.infl === 0.02, ua.left);
  chk('Use all: retirement age and plan-until age still blank', ua.retireSet === false && ua.planEnd == null, ua);
  chk('After use all: still locked, "Choose your retirement age"', ua.dis && /^Choose your retirement age/.test(ua.need), ua.need);
  chk('After use all: the type-2 State Pension is still for the customer to enter', ua.miss.includes('spWeek'), ua.miss);
  // 5. retirement age, plan-until age and the State Pension, typed by the customer
  const type = async (sel, v) => { await p.fill(sel, String(v)); await p.press(sel, 'Enter'); await p.waitForTimeout(80); };
  await type('[data-nb="ret|a"]', 64); await type('[data-nb="asm|planEnd"]', 92); await type('[data-nb="asm|spWeek"]', 250);
  const done = await ev(() => ({retire:S.retireAge, set:S.retireSet, end:AS.end, sp:+(finNums().sp * RI.sp.week).toFixed(2), dis:document.getElementById('seeres').disabled, miss:planMissing()}));
  chk('Typed retirement age 64, plan-until 92, State Pension €250 a week → results unlocked', done.set && done.retire === 64 && done.end === 92 && Math.abs(done.sp - 250) < 0.01 && !done.dis, done);
  const spG = await ev(() => document.querySelector('[data-k="spWeek"] .small').textContent);
  chk('Type-2 wording: "Usually between €0 a week and €299.30 a week (DSP 2026 …)"', /^Usually between €0 a week and €299\.30 a week \(DSP 2026/.test(spG), spG);
  await click('#seeres'); await p.waitForTimeout(1900);
  const r1 = await ev(() => ({scr:S.scr, app:S.app, gate:!!document.querySelector('[id^="gate-"]')}));
  chk('See my results works once every choice is made', r1.app && !r1.gate, r1);
  // 6. a later change makes a new choice necessary: results go back to "Choose your …"
  const later = await ev(() => { S.fin.home = 'Own with mortgage'; S.fin.mortBal = 200000; S.src.mortBal = 'typed'; S.fin.mortPayM = 1000; S.fin.mortYears = 20; S.tab = 'plan'; render(); return {gate:(document.getElementById('gate-res') || {}).textContent || '', home:(S.tab = 'home', render(), (document.getElementById('gate-home') || {}).textContent || '')}; });
  chk('Adding a mortgage without its rate → "Choose your mortgage rate to see this" on My Plan and Home', /Choose your mortgage rate to see this/.test(later.gate) && /Choose your mortgage rate/.test(later.home), later);
  const mr = await ev(() => { S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'safety'; render(); const f = document.querySelector('[data-k="mortRate"]'); return {txt:f.textContent, chip:!!f.querySelector('[data-a="asmstd"]')}; });
  chk('Mortgage rate is type 2: "Usually between 3.5% and 4.5% (Central Bank …)", no standard chip', /Usually between 3\.5% and 4\.5% \(Central Bank/.test(mr.txt) && !mr.chip, mr.txt.slice(0, 160));
  // 7. type 1 is shown, not editable
  const law = await ev(() => { S.asmOpen = 'law'; render(); const d = document.querySelector('details[data-g="law"]'); return {sum:d.querySelector('summary').textContent, inputs:d.querySelectorAll('input,button,select,textarea').length, rows:d.querySelectorAll('.mini').length}; });
  chk('Type 1: "Set by Government · 2026" group, ' + law.rows + ' rows, nothing editable', law.sum === 'Set by Government · 2026' && law.inputs === 0 && law.rows >= 12, law);
  const lawKeys = await ev(() => ['band', 'personal', 'paye'].every(k => !ASM[k]) && !Object.keys(ASM).some(k => /^(prsi|usc|dirt|exit|ltv|lti|stamp|relief|earnCap|illness)$/i.test(k)));
  chk('No law value (tax, USC, PRSI, relief, DIRT, CBI limits, Illness Benefit) is an editable assumption', lawKeys);
  // 8. Explore calculators: blank type-3 inputs with the standard chip; "Choose your …" until chosen
  const cx = await ev(() => { S = fresh(); Object.assign(S.ans, {'2':0, '4':1, '7':1, '8':2, '9':2, '12':1}); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'compound'}]; lastId = null; render();
    const box = document.getElementById('co-r'); return {val:box ? box.value : 'none', chip:(document.querySelector('[data-a="ckstd"][data-p="r"]') || {}).textContent, gate:(document.getElementById('cgate') || {}).textContent || ''}; });
  chk('Explore compound growth: growth box blank, chip "Use the standard (5%)", result "Choose your growth before fees to see this"', cx.val === '' && cx.chip === 'Use the standard (5%)' && /Choose your growth before fees to see this/.test(cx.gate), cx);
  await click('[data-a="ckstd"][data-p="r"]');
  const cx2 = await ev(() => ({v:calcVals(C('compound')).r, gate:!!document.getElementById('cgate'), slider:!!document.getElementById('c-r'), plan:asmGet('invGross')}));
  chk('Tool chip fills the tool\'s input (5%), shows the slider and the result', cx2.v === 5 && !cx2.gate && cx2.slider, cx2);
  const allCalc = await ev(() => CALCS.map(c => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:c.id}]; lastId = null; render(); const t3 = c.inputs.filter(i => { const s = calcA(c.id, i.k); return s && s.a && ASM[s.a].ty === 3; });
    return {id:c.id, blank3:t3.every(i => (document.getElementById('co-' + i.k) || {}).value === '' && !!document.querySelector('[data-a="ckstd"][data-p="' + i.k + '"]')), gate:t3.length || (CALC_X[c.id] || []).length ? !!document.getElementById('cgate') : true, x:(CALC_X[c.id] || []).every(k => { const f = document.querySelector('.asmg [data-k="' + k + '"]'); return f && (ASM[k].t === 'choice' ? !f.querySelector('.chip.sel[data-a="asmset"]') : f.querySelector('input').value === ''); })}; }));
  const badC = allCalc.filter(x => !x.blank3 || !x.gate || !x.x);
  chk('All 28 calculators: type-3 inputs blank with the standard chip; tool assumptions blank; "Choose your …" until chosen', allCalc.length === 28 && !badC.length, badC);
  const retC = await ev(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'retirement'}]; lastId = null; render(); return {ra:(document.getElementById('co-ra') || {}).value, chip:!!document.querySelector('[data-a="ckstd"][data-p="ra"]'), txt:(document.getElementById('co-ra') || {}).closest ? document.getElementById('co-ra').closest('.field').textContent : ''}; });
  chk('Explore retirement projection: retirement age blank, no standard chip, with the §14 guidance', retC.ra === '' && !retC.chip && /usually draw a pension from 60 \(some occupational schemes from 50\); State Pension is paid from 66/.test(retC.txt), retC);
  const ib = await ev(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'incomegap'}]; lastId = null; render(); const f = document.getElementById('co-ib'); return {val:f ? f.value : 'none', txt:f ? f.closest('.field').textContent : '', chip:!!document.querySelector('[data-a="ckstd"][data-p="ib"]')}; });
  chk('Illness Benefit is type 2 (as in the workbook): blank, "Usually between €0 a week and €254 a week (DSP 2026 maximum …)", no chip', ib.val === '' && /Usually between €0 a week and €254 a week \(DSP 2026 maximum/.test(ib.txt) && !ib.chip, ib);
  const st2 = await ev(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'riskreturn'}]; lastId = null; render(); return {sel:document.querySelectorAll('[data-a="ckset"].sel').length, chip:(document.querySelector('[data-a="ckstd"][data-p="s"]') || {}).textContent, w:(S.xs = [{v:'CALC', p:'lumpsum'}], lastId = null, render(), (document.querySelector('[data-a="ckstd"][data-p="wait"]') || {}).textContent)}; });
  chk('C20 style and C10 waiting years are type 3: blank, "Use the standard (2 · Balanced)" / "(5 years)"', st2.sel === 0 && st2.chip === 'Use the standard (2 · Balanced)' && st2.w === 'Use the standard (5 years)', st2);
  // 8b. tap-away: typing into a blank box and leaving it (no Enter) commits and redraws like Enter
  await ev(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'loan'}]; lastId = null; render(); });
  await p.fill('#co-apr', '7.5'); await p.click('h2, .sky'); await p.waitForTimeout(120);
  const ta = await ev(() => { const f = document.getElementById('co-apr').closest('.field'); return {v:calcVals(C('loan')).apr, slider:!!document.getElementById('c-apr'), tag:/Not chosen yet/.test(f.textContent), gate:!!document.getElementById('cgate')}; });
  chk('Tap-away (no Enter) on a blank box: value used, field redrawn with its slider, no "Not chosen yet", result shown', ta.v === 7.5 && ta.slider && !ta.tag && !ta.gate, ta);
  await ev(() => { loadSample(); S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'retire'; lastId = null; render(); });
  await p.fill('[data-nb="asm|spYears"]', '30'); await p.click('h2, .sky'); await p.waitForTimeout(120);
  chk('Tap-away on an assumption box commits and redraws ("Your choice")', await ev(() => asmGet('spYears') === 30 && /Your choice/.test(document.querySelector('[data-k="spYears"] .flabel').textContent)));
  // 9a. sample customer: no calculator asks for a choice
  const sc = await ev(() => CALCS.filter(c => { loadSample(); S.tab = 'explore'; S.xs = [{v:'CALC', p:c.id}]; lastId = null; render(); return !!document.getElementById('cgate') || /Not chosen yet/.test(document.getElementById('screen').textContent); }).map(c => c.id));
  chk('Sample customer: all 28 calculators show a result (no "Choose your …", no "Not chosen yet")', !sc.length, sc);
  // 9. sample customer: all choices made, demos work
  const smp = await ev(() => { loadSample(); render(); return {ready:planReady(), gate:document.getElementById('screen').innerHTML.includes('Choose your'), ret:S.retireSet, end:AS.end}; });
  chk('Sample customer has every choice made (no "Choose your …" anywhere)', smp.ready && !smp.gate && smp.ret && smp.end === 95, smp);
  // 10. "What your plan assumes": no DEFAULT / YOURS / Suggested; three types only
  const tb = await ev(() => { S.sheet = 'assume'; render(); const sh = document.querySelector('.sheet'); const tags = [...sh.querySelectorAll('.tag')].map(t => t.textContent); return {h:sh.querySelector('h2').textContent, tags:[...new Set(tags)], txt:sh.innerText}; });
  const okTag = t => t === 'Set by Government · 2026' || t === 'Your choice' || t === 'How the plan works' || /^Usually .+–.+/.test(t);
  chk('"What your plan assumes": every row tagged Set by Government / Usually X–Y / Your choice', tb.h === 'What your plan assumes' && tb.tags.every(okTag) && tb.tags.includes('Set by Government · 2026') && tb.tags.includes('Your choice') && tb.tags.some(t => /^Usually/.test(t)), tb.tags);
  chk('No "Default", "Yours" or "Suggested" label left', !/\bdefault\b|\byours\b|suggested/i.test(tb.txt), (tb.txt.match(/.{0,30}(default|yours|suggested).{0,30}/i) || [''])[0]);
  // 11. one "Ireland today" figure: 3.9% CSO HICP flash, Sep 2026, from the register
  const inf = await ev(() => ({ie:RI.infl.ie, src:RI.infl.ieSrc, html:document.documentElement.outerHTML.includes('3.7%'), chip:(document.querySelector('[data-a="infl"][data-p="0.039"]') || {}).textContent}));
  chk('"Ireland now" inflation is one figure: 3.9% (CSO HICP flash, Sep 2026); no 3.7% anywhere', inf.ie === 0.039 && inf.src === 'CSO HICP flash, Sep 2026' && !inf.html, inf);
  // 12. inflation "Other" opens the % box and keeps the card open (no hidden 2.5%)
  const oth = await ev(() => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'realreturn'}]; lastId = null; render(); return true; });
  await click('[data-a="infl"][data-p="other"]');
  const oth2 = await ev(() => ({box:!!document.querySelector('[data-nb="infl|r"]'), val:(document.querySelector('[data-nb="infl|r"]') || {}).value, infl:S.infl}));
  chk('Inflation "Other" opens an empty % box and sets nothing', oth2.box && oth2.val === '' && oth2.infl == null, oth2);
  await p.fill('[data-nb="infl|r"]', '3'); await p.press('[data-nb="infl|r"]', 'Enter'); await p.waitForTimeout(80);
  const oth3 = await ev(() => ({infl:S.infl, box:!!document.querySelector('[data-nb="infl|r"]')}));
  chk('Typing 3 sets 3% and the box stays open', oth3.infl === 0.03 && oth3.box, oth3);
  // 13. number boxes: whole numbers for years / months / ages; Enter then leaving keeps the max/min hint; PRSI years blank
  await ev(() => { loadSample(); S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'retire'; render(); });
  const prsi = await ev(() => document.querySelector('[data-nb="asm|spYears"]').value);
  chk('PRSI-years box blank (not 0) when empty', prsi === '', prsi);
  await type('[data-nb="asm|spYears"]', '12.6');
  const wh = await ev(() => ({v:S.asm.spYears, hint:document.getElementById('nh-asm-spYears').textContent}));
  chk('PRSI years accepts whole numbers only (12.6 → 13, "Whole numbers only")', wh.v === 13 && wh.hint === 'Whole numbers only', wh);
  await p.fill('[data-nb="asm|spYears"]', ''); await p.press('[data-nb="asm|spYears"]', 'Enter'); await p.waitForTimeout(80);
  chk('PRSI years can be cleared back to blank', await ev(() => asmGet('spYears') == null && document.querySelector('[data-nb="asm|spYears"]').value === ''));
  await ev(() => { S.tab = 'explore'; S.xs = [{v:'CALC', p:'loan'}]; lastId = null; render(); });
  await p.fill('#co-y', '99'); await p.press('#co-y', 'Enter'); await p.waitForTimeout(60); await p.click('h2, .sky'); await p.waitForTimeout(80);
  const hint = await ev(() => ({v:calcVals(C('loan')).y, h:document.getElementById('nh-ck-y').textContent}));
  chk('Enter, then leaving the box, keeps the "Max" hint', hint.v === 10 && /^Max/.test(hint.h), hint);
  await p.fill('#co-y', '2.5'); await p.press('#co-y', 'Enter'); await p.waitForTimeout(60);
  chk('Years box accepts whole numbers only (2.5 → 3)', await ev(() => calcVals(C('loan')).y === 3));
  const av = await ev(() => { const r = document.getElementById('c-a'); return r ? r.getAttribute('aria-valuetext') : null; });
  chk('Sliders carry aria-valuetext with the formatted value and unit', av === '€15,000', av);
  await p.fill('#c-a', '20000'); await p.dispatchEvent('#c-a', 'input'); await p.waitForTimeout(40);
  chk('aria-valuetext updates while dragging', await ev(() => document.getElementById('c-a').getAttribute('aria-valuetext') === '€20,000'));
  // 14. copy polish
  const cp = await ev(() => { S = fresh(); S.asm = {}; const ig = C('incomegap').run({e:2500, sp:1, s:0, inc:60000}), lm = (S.infl = 0.02, S.asm.ddTiming = 'start', S.asm.planEnd = 95, C('lastmoney').run({pot:3000000, w:20000, g:5, age:66})), c13 = (S.infl = 0.02, C('contrib').run({sal:60000, inc:2, y:25, g:4.5, tr:40, age:40, ex:3000}).line);
    const ho = handoffHTML('incomegap', {kind:'need', need:'ip', amount:500, name:'x', em:''}); return {ig:ig.val, igs:ig.rows.find(x => x[0] === 'Sick pay')[1], lm:lm.line, lmRow:lm.rows[0][1], c13, ho, side:document.querySelector('.side').innerText, xpl:(() => { S.shell = true; S.tab = 'explore'; S.xs = []; S.exp = 'home'; lastId = null; render(); return document.getElementById('curid').textContent; })()}; });
  chk('"1.0 months" → "1 month"', cp.ig === '1 month' && cp.igs === '1 month', [cp.ig, cp.igs]);
  chk('C15 at the 60-year cap: "lasts beyond age 95, your plan-until age" (no age 126)', /money lasts beyond age 95, your plan-until age/.test(cp.lm) && !/126/.test(cp.lm) && cp.lmRow === 'Beyond 95 (your plan-until age)', [cp.lm.slice(0, 160), cp.lmRow]);
  chk('C13 relief-limit wording explains the limit, what you pay and the room left', /Tax relief has an age limit: at 40 it applies to up to 25% of your earnings \(earnings counted up to €115,000\), which is €15,000 a year\. You already pay in €3,000 a year, so up to €12,000 a year more gets relief\./.test(cp.c13), cp.c13);
  chk('"an income protection need"', /We note an income protection need/.test(cp.ho));
  chk('Side panel: no internal notes; demo disclaimer', !/Reviewer notes|journey-spec/.test(cp.side) && /Prototype for demonstration\. Figures are illustrative, not financial advice\./.test(cp.side));
  chk('Explore note says 28 calculators', /28 calculators/.test(cp.xpl) && !/29 calculators/.test(cp.xpl), cp.xpl.slice(0, 200));
  // 15. §15 "Not sure? See an example" (Pooja, 6 Oct 2026)
  const setup = async o => ev(o => { S = fresh(); S.about = {age:30, partner:true, deps:1, married:true}; S.partner = {mode:'manual', email:'', sent:false, name:'Pat'}; S.shell = true; S.pb = true; S.acct.name = 'Test';
    const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', 'Employed'); put('income', 50000); put('home', 'Own with mortgage'); put('pensionM', o.penM);
    if (o.penM) put('pension', 30000); lastId = null; render(); }, o);
  const cardRes = [], linkRes = [];
  for (const o of [{penM:0}, {penM:400}]) { await setup(o);
    const keys = await ev(() => FSEC.flatMap((s, i) => s.f.filter(k => fieldVisible(k) && FF[k].type !== 'text').map(k => [i, k])));
    for (const [i, k] of keys) {
      if (o.penM && cardRes.some(x => x.k === k)) continue;
      await ev(([i, k]) => { S.fmode = {}; openSec(i); S.fmode[FSEC[i].id] = 'type'; lastId = null; render(); }, [i, k]);
      const before = await ev(k => ({v:S.fin[k], src:S.src[k]}), k);
      const link = p.locator('[data-a="fex"][data-p="' + k + '"]');
      if (!(await link.count())) { linkRes.push(k + ': no link'); continue; }
      if ((await link.innerText()) !== 'Not sure? See an example') linkRes.push(k + ': ' + await link.innerText());
      await link.click(); await p.waitForTimeout(40);
      const c = await ev(k => { const sh = document.querySelector('#screen .sheet'); if (!sh) return null; const d = FF[k], x = EXAMPLES[k], txt = sh.innerText;
        return {k, dialog:sh.getAttribute('role') === 'dialog' && sh.getAttribute('aria-modal') === 'true' && sh.getAttribute('aria-labelledby') === 'ex-t', title:sh.querySelector('h2').textContent === 'Example: ' + d.l,
          sentence:(document.getElementById('ex-s') || {}).textContent || '', where:/📍 Where to find yours: \S/.test(txt), zero:/Nothing to add\? Enter 0\./.test(txt), small:/Example only\. Not a typical or recommended amount\./.test(txt),
          got:[...sh.querySelectorAll('button.btn')].map(b => b.textContent).join('|'), focusIn:sh.contains(document.activeElement), opts:x.o ? x.o.every(([o]) => txt.includes(o)) : true, choice:d.type === 'choice' || d.type === 'ynn', eur:d.type === 'eur',
          figure:(() => { const v = SAMPLE_FIN[k] ? SAMPLE_FIN[k][0] : null; if (v == null) return true; return (d.type === 'eur' ? sh.innerText.includes(eur(v)) : sh.innerText.includes(String(v))); })(),
          words:((document.getElementById('ex-s') || {}).textContent + ' ' + [...sh.querySelectorAll('li')].map(l => l.textContent).join(' ')).split(/\s+/).filter(Boolean).length}; }, k);
      if (!c) { cardRes.push({k, bad:'no card'}); continue; }
      // focus trap: Tab past the last control stays in the dialog; Shift+Tab too
      await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); c.trap = await ev(() => document.querySelector('#screen .sheet').contains(document.activeElement));
      await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Shift+Tab'); c.trap = c.trap && await ev(() => document.querySelector('#screen .sheet').contains(document.activeElement));
      if (cardRes.length % 2) { await p.keyboard.press('Escape'); c.closedBy = 'Esc'; } else { await p.click('#screen .sheet button.btn:has-text("Got it")'); c.closedBy = 'Got it'; }
      await p.waitForTimeout(40);
      const after = await ev(k => ({v:S.fin[k], src:S.src[k], sheet:!!document.querySelector('#screen .sheet'), focus:document.activeElement && document.activeElement.dataset.a === 'fex' && document.activeElement.dataset.p === k}), k);
      c.unchanged = after.v === before.v && after.src === before.src; c.closed = !after.sheet; c.focusBack = after.focus; cardRes.push(c); } }
  const want = await ev(() => Object.keys(FF).filter(k => FF[k].type !== 'text'));
  const badCards = cardRes.filter(c => c.bad || !(c.dialog && c.title && c.where && c.small && c.got === 'Got it' && c.focusIn && c.trap && c.opts && c.figure && c.unchanged && c.closed && c.focusBack && (c.eur ? c.zero : !c.zero) && c.words <= 45));
  chk('Every Your finances field (' + want.length + ') links "Not sure? See an example"', !linkRes.length && want.every(k => cardRes.some(c => c.k === k)), {missing:want.filter(k => !cardRes.some(c => c.k === k)), linkRes});
  chk('Every example card: dialog, "Example: [field]", Aoife/Cian figure, "📍 Where to find yours:", "Enter 0" (€ fields), small print, "Got it", focus trapped, Esc / Got it closes, focus back on the link, field unchanged', !badCards.length, badCards.map(c => Object.fromEntries(Object.entries(c).filter(([k2, v]) => v === false || k2 === 'k' || k2 === 'bad' || k2 === 'words'))));
  chk('Choice fields: each option explained and Aoife\'s pick named', cardRes.filter(c => c.choice).every(c => c.opts && / picks /.test(c.sentence)), cardRes.filter(c => c.choice).map(c => c.k));
  // the field stays empty after Got it; typing 0 shows "Your figure"; blank shows Missing; nothing else
  await setup({penM:0}); await ev(() => { openSec(2); S.fmode.assets = 'type'; lastId = null; render(); });
  await p.click('[data-a="fex"][data-p="cash"]'); await p.click('#screen .sheet button.btn:has-text("Got it")'); await p.waitForTimeout(40);
  const em = await ev(() => ({val:document.getElementById('f-cash').value, fin:S.fin.cash, tag:document.getElementById('tag-cash').textContent}));
  chk('After "Got it" the field stays empty and Missing', em.val === '' && em.fin == null && /❓ Missing/.test(em.tag), em);
  await p.fill('#f-cash', '0'); await p.waitForTimeout(40);
  const z = await ev(() => ({fin:S.fin.cash, src:S.src.cash, tag:document.getElementById('tag-cash').textContent}));
  chk('Typing 0 shows "✏️ Your figure"', z.fin === 0 && z.src === 'typed' && /Your figure/.test(z.tag), z);
  const gone = await ev(() => { const t = document.documentElement.outerHTML.replace(/<script[\s\S]*<\/script>/, ''); return {est:/Estimate for me|I don.t have this|≈ Estimated|Confirmed none|Estimated for you/.test(t + document.getElementById('screen').innerText), ff:Object.keys(FF).filter(k => 'est' in FF[k]), act:'fest' in ACT || 'fnone' in ACT}; });
  chk('No "Estimate for me", "I don\'t have this", "≈ Estimated" or "Confirmed none"; no est: in FF; no fest / fnone actions', !gone.est && !gone.ff.length && !gone.act, gone);
  const p4t = await ev(() => { S.scr = 'P4'; lastId = null; render(); return document.getElementById('screen').innerText; });
  chk('Step 7 statuses: only Missing / Needs a look (no "Estimated")', !/Estimated/.test(p4t) && /Missing/.test(p4t), '');
  // worked out from the customer's own figures, labelled with the reason
  const wo = await ev(() => { const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('mortBal', 200000); put('mortRate', 4); put('mortYears', 20); put('cardBal', 2000); S.asm = Object.assign({}, S.asm, {cardRate:0.2}); openSec(3); S.fmode.liab = 'type'; lastId = null; render();
    return {mort:(document.getElementById('wo-mortPayM') || {}).textContent || '', card:(document.getElementById('wo-cardPayM') || {}).textContent || '', fnd:foundations().map(l => l.s || '').join(' ')}; });
  chk('Mortgage repayment worked out from balance, rate and years: "Worked out from your figures … from your balance, rate and years left"', /^Worked out from your figures: about €1,212 a month, from your balance, rate and years left\./.test(wo.mort), wo.mort);
  chk('Card with no repayment: "Worked out from your figures: … clears it in 5 years, because no repayment was given"', /^Worked out from your figures: €\d+ a month clears it in 5 years, because no repayment was given\./.test(wo.card), wo.card);
  // silent fallbacks now ask instead: partner's age, mortgage years, work
  const fb = await ev(() => { delete S.fin.mortYears; delete S.src.mortYears; const m1 = planMissing().map(x => x.k); S.fin.pAge = null; delete S.src.pAge; const m2 = planMissing(); S.fin.work = undefined; delete S.src.work; const m3 = planMissing().map(x => x.k);
    S.tab = 'explore'; S.xs = [{v:'CALC', p:'repayment'}]; S.app = true; lastId = null; render(); const pa = m2.find(x => x.k === 'pAge'); return {m1, pAge:pa, pAgeTxt:pa ? chooseTxt(pa) : '', mortTxt:chooseTxt({n:'mortgage years left (or your monthly repayment)', add:true}), m3, calc:(document.getElementById('cgate') || {}).textContent || ''}; });
  chk('No years left and no repayment → "Add your mortgage years left (or your monthly repayment) to see this" (no 25-year default)', fb.m1.includes('mortYears') && fb.mortTxt === 'Add your mortgage years left (or your monthly repayment) to see this', fb.m1);
  chk('Partner\'s age missing → "Add your partner\'s age to see this" (no fallback to your age)', fb.pAgeTxt === 'Add your partner\'s age to see this', fb.pAge);
  chk('Work missing with income typed → "Add your work …" (no silent "Employed")', fb.m3.includes('work'), fb.m3);
  chk('Mortgage tool with no years left: "Add your term to see this" (no 25-year default)', /Add your term to see this/.test(fb.calc), fb.calc);
  res.forEach(r => console.log(r.join(' | ')));
  console.log('FAILS', res.filter(r => r[0] === 'FAIL').length, 'of', res.length); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
