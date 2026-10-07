import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src).read()
R = [
# F5 no pension contributions without earnings; F4 mortgage payment never below the amortising payment
("    pension:n('pension'), pensionM:n('pensionM'), sp:",
 "    pension:n('pension'), pensionM:f.work !== 'Not working' && n('income') > 0 ? n('pensionM') : 0, sp:"),
("mortPayM:mortOn ? n('mortPayM') : 0,",
 "mortPayM:mortOn ? Math.max(n('mortPayM'), annPay(n('mortBal'), AS.mortRate, n('mortYears') || 25) / 12) : 0, mortPayLow:mortOn && n('mortPayM') * 12 < annPay(n('mortBal'), AS.mortRate, n('mortYears') || 25) - 12,"),
("function finNums(){",
 "const annPay = (bal, r, yrs) => bal > 0 ? bal * r / (1 - Math.pow(1 + r, -Math.max(1, yrs))) : 0;   // level yearly repayment\nfunction finNums(){"),
# F8 goal dates clamped to next year .. 90
("const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).slice().sort(GOAL_ORDER);",
 "const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).map(g => Object.assign({}, g, {age:clamp(g.age, a0 + 1, AS.end)})).sort(GOAL_ORDER);"),
# F2 mortgage-free costs the balance after that year's instalment
("(f.mortBal > 0 ? mPath[Math.min(n, N)] :", "(f.mortBal > 0 ? mPath[Math.min(n + 1, N)] :"),
("if (g.kind === 'mfree' && pay >= x.cost - 1){ mfreeDone = true; mBal = 0; } }",
 "if (g.kind === 'mfree' && pay >= x.cost - 1){ mfreeDone = true; mBal = 0; } else if (g.kind === 'mfree') mBal = Math.max(0, mBal - pay); }"),
# F3 debt repaid over at most 5 years when no (or a too-small) repayment is given
("let cash = f.cash, inv = f.invest,", "const dPay = Math.max(f.debtPayM * 12, annPay(f.debt, AS.debtRate, 5));\n  let cash = f.cash, inv = f.invest,"),
("if (dBal > 1){ const pay = Math.min(Math.max(f.debtPayM * 12, dBal * 0.1), dBal * (1 + AS.debtRate));",
 "if (dBal > 1){ const pay = Math.min(dPay, dBal * (1 + AS.debtRate));"),
# F10 self-employed USC surcharge (3% on non-PAYE income over 100,000)
("inflow += (netPay(gR) - pensionCost(gR, E, a)) * infl;",
 "inflow += (netPay(gR) - pensionCost(gR, E, a) - (f.work === 'Self-employed' ? 0.03 * Math.max(0, gR - 100000) : 0)) * infl;"),
# F6 ARF imputed distribution floor
("const draw = pen / Math.max(1, AS.end - a + 1);",
 "const draw = pen * Math.min(1, Math.max(1 / Math.max(1, AS.end - a + 1), a >= 71 ? 0.05 : a >= 61 ? 0.04 : 0));"),
# F7 in retirement, income above the spending goal is kept, not spent
("      free += budget;                                            // saved but not needed by any goal: unallocated\n",
 "      free += budget;                                            // saved but not needed by any goal: unallocated\n      if (!working){ free += spent; saved += spent; spent = 0; }  // retired: pension drawn above your spending goal stays in savings\n"),
# F1 colours follow the percentages
("  const s0 = rows[0], sur0",
 "  fg.forEach(g => { if (pct[g.id] < 95){ const r = rows[g.age - a0]; if (r) r.goalShort = true; } });   // a goal below 95% always shows purple in its year\n  if (rg && rows.some(r => r.retired && r.shortLiving > Math.max(500, r.needs * 0.02))) pct[rg.id] = Math.min(pct[rg.id], 94);   // any purple retired year: never 'On track'\n  const s0 = rows[0], sur0"),
("const isShort = r => r.short > Math.max(500, r.needs * 0.02);",
 "const isShort = r => r.shortLiving > Math.max(500, r.needs * 0.02) || !!r.goalShort;"),
# chart data
("rows.push({t, a, yr:YEAR0 + t, inflow, needs:living + fixed,", "rows.push({t, a, yr:YEAR0 + t, inflow, needs:living + fixed, goalPaid, goalCost:goalPaid + goalGap,"),
("let goalGap = 0", "let goalPaid = 0, goalGap = 0"),
("x.paid = pay; goalGap += x.cost - pay;", "x.paid = pay; goalPaid += pay; goalGap += x.cost - pay;"),
]
for a, b in R:
    if s.count(a) != 1: print('MISS', s.count(a), a[:70]); continue
    s = s.replace(a, b)
open(dst, 'w').write(s)
