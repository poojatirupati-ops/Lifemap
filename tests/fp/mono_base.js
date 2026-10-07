const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const r = await p.evaluate((N) => {
    let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648, pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const KINDS = ['home','family','edu','travel','business','mfree','safety','wealth','helpfam','legacy','wedding','car','health','other'];
    const mk = () => { const age = ri(25, 60), o = {age, partner:rnd() < .5, deps:ri(0, 3), married:pick([null, true, false]), inc:pick([20000, 35000, 50000, 70000, 100000, 150000]), work:rnd() < .15 ? 'Self-employed' : 'Employed',
        q6:pick([null, 0, 1, 2, 3, 4]), assume:pick(['standard','cautious']), ret:rnd() < .7, home:pick(['Rent','Own with mortgage','Own outright']), cash:pick([0, 3000, 15000, 60000, 200000]), inv:pick([0, 0, 20000, 100000]),
        pen:pick([0, 30000, 150000, 500000]), pc:pick([0, .05, .1, .2]), debt:rnd() < .4 ? pick([3000, 15000]) : 0, n:ri(1, 8)};
      o.costs = Math.round(o.inc / 12 * pick([.3, .45, .6, .75]) / 50) * 50 + (o.partner ? 500 : 0) + 300 * o.deps; o.ra = Math.max(age + 1, pick([60, 63, 66, 68]));
      o.goals = []; for (let i = 0; i < o.n; i++) o.goals.push({k:pick(KINDS), y:rnd() < .15 ? 1 : ri(1, 90 - age), nice:rnd() < .3, saved:rnd() < .2 ? 2000 : 0}); return o; };
    const build = (o, inc) => { S = fresh(); S.about = {age:o.age, partner:o.partner, deps:o.deps, married:o.married}; S.retireAge = o.ra; if (o.q6 != null) S.ans['6'] = o.q6; S.assume = o.assume; S.app = true;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', o.work); put('income', inc); put('costsM', o.costs); put('cash', o.cash); put('invest', o.inv); put('pension', o.pen); put('pensionM', Math.round(inc * o.pc / 12)); put('sp', 'Expect full');
      if (o.partner){ put('pIncome', Math.round(o.inc * .5)); put('pAge', o.age); }
      put('home', o.home); if (o.home === 'Own with mortgage'){ put('mortBal', 200000); put('mortYears', 20); put('mortPayM', 1200); }
      if (o.debt){ put('debt', o.debt); put('debtPayM', 0); }
      o.goals.forEach(x => { const g = mkGoal(x.k); if (x.k !== 'legacy') g.age = o.age + x.y; if (x.nice) g.prio = 'Nice to have'; g.saved = x.saved; S.goals.push(g); });
      if (o.ret){ const g = mkGoal('retire'); g.amount = 35000; S.goals.push(g); } };
    const snap = wi => { const P = project(wi); return {pct:S.goals.map(g => P.pct[g.id]), sh:P.rows.filter(isShort).length, P}; };
    const worse = (A, B) => B.pct.some((v, i) => v < A.pct[i]) || B.sh > A.sh;   // B (more money) worse than A?
    const fail = {save:0, saveSwitch:0, lump:0, whatif:0, income:0}, ex = {}; let checks = 0;
    const note = (k, o, info) => { fail[k]++; if (!ex[k]) ex[k] = {o:JSON.stringify(o).slice(0, 300), info}; };
    for (let i = 0; i < N; i++){ const o = mk(); build(o, o.inc);
      const A = snap(), a0 = A.P.save.saveM;
      // 1a. auto -> custom just above today's amount (the reported bug)
      for (const d of [0, 25, 100, 300]){ S.saveM = a0 + d; S.saveUp = true; const B = snap(); checks++; if (worse(A, B)) note('saveSwitch', o, {a0, d, A:A.pct, B:B.pct, shA:A.sh, shB:B.sh}); }
      // 1b. custom v1 < v2
      let prev = null; for (const v of [0, 25, 60, 150, 300, 600, 1200, 3000]){ S.saveM = v; S.saveUp = v >= A.P.save.autoM - 0.5; const B = snap(); if (prev){ checks++; if (worse(prev, B)) note('save', o, {v, A:prev.pct, B:B.pct}); } prev = B; }
      S.saveM = pick([null, 50, 400]); S.saveUp = null;
      // 2. lump sum and what-if monthly to a random goal
      const g = pick(S.goals), base = snap({g:g.id, m:0, l:0});
      let pl = base; for (const l of [2000, 10000, 50000]){ const B = snap({g:g.id, m:0, l}); checks++; if (worse(pl, B)) note('lump', o, {g:g.k, l, A:pl.pct, B:B.pct}); pl = B; }
      let pm = base; for (const m of [25, 100, 300, 1000]){ const B = snap({g:g.id, m, l:0}); checks++; if (worse(pm, B)) note('whatif', o, {g:g.k, m, A:pm.pct, B:B.pct}); pm = B; }
      // 3. income up with the saving control above the Q6 cap
      const hi = (o.q6 == null ? 300 : [50, 200, 500, 1000, 0][o.q6]) + 200; let pi = null;
      for (const f of [1, 1.2, 1.5, 2]){ build(o, Math.round(o.inc * f)); S.saveM = hi; S.saveUp = true; const B = snap(); if (pi){ checks++; if (worse(pi, B)) note('income', o, {f, A:pi.pct, B:B.pct, shA:pi.sh, shB:B.sh}); } pi = B; }
    }
    // the designer's case
    loadSample(); const s0 = snap(), sa = s0.P.save.saveM; const sample = [null, sa, sa + 25, 100, 300, 500].map(v => { S.saveM = v; S.saveUp = v == null ? null : v >= s0.P.save.autoM - 0.5; const P = snap(); return (v == null ? 'auto ' + sa : v) + ': ' + S.goals.map((g, i) => g.k + ' ' + P.pct[i]).join(' ') + ' · short ' + P.sh; });
    S.saveM = null; S.saveUp = null; const nudge = saveNudge(); const n0 = {}; S.goals.forEach(g => n0[g.k] = project().pct[g.id]);
    ACT.savem('25'); const n1 = {}; S.goals.forEach(g => n1[g.k] = project().pct[g.id]);
    const ui = {nudge:nudge.replace(/<[^>]+>/g, ''), before:n0, afterPlus25:n1, saveM:S.saveM, up:S.saveUp, monotone:Object.keys(n0).every(k => n1[k] >= n0[k])};
    return {checks, fail, ex, sample, ui}; }, 200);
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS', errs.length); await b.close(); })();
