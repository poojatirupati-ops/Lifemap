/* ===== PASTE-READY cashflow changes ===== */
const AS = {infl:0.025, wage:0.03, cash:0.007, inv:0.03, pen:0.04, penRet:0.028, sp:15564, spAge:66, end:90, mortRate:0.038, debtRate:0.09};
// 2026 Irish rules, today's money. Bands/credits are assumed to rise with prices (call with income / infl, then multiply back).
const TX = {band:44000, credits:4000, ageCredit:245, ageExempt:18000,
  usc:[[12012, .005], [28700, .02], [70044, .03], [Infinity, .08]], uscExempt:13000, prsi:0.0435, prsiWk:352};
function incomeTax(g, cr){ return Math.max(0, 0.2 * Math.min(g, TX.band) + 0.4 * Math.max(0, g - TX.band) - (cr == null ? TX.credits : cr)); }
function usc(g, reduced){ if (g <= TX.uscExempt) return 0; const b = reduced ? [[12012, .005], [Infinity, .02]] : TX.usc; let t = 0, lo = 0;
  for (const [hi, r] of b){ t += Math.max(0, Math.min(g, hi) - lo) * r; lo = hi; if (g <= hi) break; } return t; }
function prsi(g){ const wk = g / 52; if (wk <= TX.prsiWk) return 0; const cr = wk <= 424 ? Math.max(0, 12 - (wk - 352.01) / 6) : 0; return Math.max(0, (wk * TX.prsi - cr) * 52); }
function netPay(g){ return g <= 0 ? 0 : g - incomeTax(g) - usc(g) - prsi(g); }
// Retirement: no PRSI at 66+, State Pension is USC-exempt, age credit and age exemption from 65, reduced USC from 70 (income <= €60,000)
function netRet(draw, sp, age){ const g = draw + sp; if (g <= 0) return 0;
  const it = age >= 65 && g <= TX.ageExempt ? 0 : incomeTax(g, TX.credits + (age >= 65 ? TX.ageCredit : 0));
  return g - it - usc(draw, age >= 70 && g <= 60000); }
// Net cost to take-home of the employee's own pension contributions (relief at marginal income-tax rate, within age limits and the €115,000 cap)
const relLim = a => a < 30 ? .15 : a < 40 ? .2 : a < 50 ? .25 : a < 55 ? .3 : a < 60 ? .35 : .4;
function pensionCost(g, E, age){ const Er = Math.min(E, relLim(age) * Math.min(g, 115000)); return E - (incomeTax(g) - incomeTax(Math.max(0, g - Er))); }
/* In project(), replace the working / retired branch with:
    if (working){
      const gR = f.income * wgw / infl;                                   // gross in today's money
      const E  = f.pensionM * 12 * (f.work === 'Self-employed' ? 1 : 0.5) * wgw / infl;   // own share of "paid in each month"
      inflow += (netPay(gR) - pensionCost(gR, E, a)) * infl;
      let contrib = f.pensionM * 12 * wgw; if (wg && wg.kind === 'retire') contrib = Math.max(0, contrib + wm * 12);
      pen = pen * (1 + AS.pen) + contrib;
      if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;                   // working past 66 (rare): keep as today
    } else {
      if (a === R){ const ls = Math.min(pen * 0.25, 200000); pen -= ls; cash += ls; }   // tax-free lump sum (limit is not indexed)
      const draw = pen / Math.max(1, AS.end - a + 1);                      // >= ARF imputed 4% (61-70) / 5% (71+)
      pen = (pen - draw) * (1 + AS.penRet);
      const sp = a >= AS.spAge ? AS.sp * f.sp : 0;                         // today's money
      inflow += netRet(draw / infl, sp, a) * infl;
    }
   and delete the separate line  `if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;`
   Partner: `inflow += netPay(f.pIncome * wgw / infl) * infl`. Their State Pension alone stays below the €18,000 age exemption, so keep it gross.
*/
