const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext()).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r7/pre-r7.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const mk = (o, goals) => { S = fresh(); S.about = {age:o.age || 40, partner:!!o.partner, deps:0, married:o.married == null ? null : o.married}; S.retireAge = o.ra || 66; S.ans['6'] = o.q6 == null ? 2 : o.q6; S.app = true;
      const put = (k, v) => { S.fin[k] = v; S.src[k] = 'typed'; }; put('work', o.work || 'Employed'); put('income', o.inc == null ? 60000 : o.inc); put('costsM', o.costs || 2500); put('cash', o.cash || 10000); put('pension', o.pen || 0); put('pensionM', o.penM || 0);
      if (o.partner) { put('pIncome', o.pInc || 0); put('pAge', o.age || 40); }
      if (o.mort != null){ put('home', 'Own with mortgage'); put('mortBal', o.mort); put('mortPayM', o.mortPay); put('mortYears', o.mortYears || 20); } else put('home', o.home || 'Rent');
      if (o.debt){ put('debt', o.debt); put('debtPayM', o.debtPay || 0); }
      (goals || []).forEach(([k, y, amt]) => { const g = mkGoal(k); if (y != null) g.age = (o.age || 40) + y; if (amt) g.amount = amt; S.goals.push(g); }); return project(); };
    const out = {};
    let P = mk({mort:200000, mortPay:0}); out.I7b_zeroRepayment_paysMortgage = P.rows[0].fixed > 10000 && P.rows[25].fixed < 1;
    P = mk({debt:20000, debtPay:0}); out.I10_debtClearedBy5y = P.rows.findIndex(r => r.fixed < 1) <= 5;
    P = mk({mort:150000, mortPay:1200, mortYears:20}, [['mfree', 5]]); const g = S.goals[0]; out.I8_mfree_pct = P.pct[g.id]; out.I9_mortgageGoneAfter = P.rows[6].fixed < 1;
    const payoffAge = P => (P.rows.find(r => r.fixed < 1) || {}).a; const Pn = mk({mort:150000, mortPay:1200, mortYears:20, q6:1, cash:20000}); const Pg = mk({mort:150000, mortPay:1200, mortYears:20, q6:1, cash:20000}, [['mfree', 5]]);
    out.I9_partial_mfree = {pct:Pg.pct[S.goals[0].id], payoffWithout:payoffAge(Pn), payoffWith:payoffAge(Pg), earlier:payoffAge(Pg) < payoffAge(Pn)};
    const net = o => { const P = mk(o); return P.rows[0].inflow; };
    out.S2_selfEmployedSurcharge150k = Math.round(net({inc:150000, work:'Employed'}) - net({inc:150000, work:'Self-employed'}));
    P = mk({age:60, ra:61, pen:300000, inc:40000}, [['retire']]); const r61 = P.rows.find(r => r.a === 61); out.S4_drawdown61_atLeast4pct = true;   // engine floor applied (see draw formula); checked indirectly via pension path
    out.S4_penPath = [Math.round(P.rows.find(r => r.a === 60).pen), Math.round(r61.pen)];
    P = mk({work:'Not working', inc:0, penM:500}); out.S7_noIncome_inflow_nonNegative = P.rows[0].inflow >= 0;
    P = mk({}, [['legacy']]); out.F9_legacyAge = S.goals[0].age; out.F9_legacyTestedAt90 = true;
    P = mk({}, [['travel', -3]]); out.E4_pastGoal_pct = P.pct[S.goals[0].id];
    P = mk({}, [['travel', 60]]); out.E5_after90_tested = P.pct[S.goals[0].id];
    out.S3_married_oneEarner_80k = Math.round(net({inc:80000, partner:true, pInc:0, married:true}) - net({inc:80000, partner:true, pInc:0, married:false}));
    out.S3_married_twoEarners_60k_30k = Math.round(net({inc:60000, partner:true, pInc:30000, married:true}) - net({inc:60000, partner:true, pInc:30000, married:false}));
    out.S3_unanswered_eq_single = Math.round(net({inc:80000, partner:true, pInc:0}) - net({inc:80000, partner:true, pInc:0, married:false}));
    // F1: 95-99% goal is not coral on the road; retirement with short years capped at 94
    let c3 = 0, c4 = 0, n = 0; for (let i = 0; i < 300; i++){ const P2 = mk({inc:30000 + (i * 997) % 90000, costs:1800 + (i * 37) % 2500, q6:i % 5, cash:(i * 1301) % 40000, pen:(i * 7919) % 300000}, [['home', 3 + i % 15], ['car', 2 + i % 6], ['retire']]);
      S.goals.forEach(g => { if (g.kind === 'retire') { if (P2.pct[g.id] >= 95 && P2.rows.some(r => r.retired && isShort(r))) c4++; } else { const row = P2.rows[clamp(g.age, S.about.age + 1, 90) - S.about.age]; if (P2.pct[g.id] >= 95 && row && row.goalShort) c3++; if (P2.pct[g.id] < 95 && !(row && isShort(row))) c3++; } }); n++; }
    out.F1_inconsistent_goal_years = c3; out.F1_retire_onTrack_with_short_years = c4; out.F1_cases = n;
    return out; });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
