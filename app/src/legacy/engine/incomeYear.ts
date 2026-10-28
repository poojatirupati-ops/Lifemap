// One year of income for the household: person 1's pay or pension drawdown, State Pension, the partner. Pure.
import type { A } from './assume.ts'
import type { F } from './finNums.ts'
import type { P } from './hhTax.ts'
import { RI } from './rates.ts'
import type { Year } from './retire.ts'
import { arfMin, lumpSum, reliefOn, sftFor } from './tax.ts'

export type YearCtx = { f: F; A: A; y: Year; t: number; infl: number; wgw: number; tI: number; spI: number; penExtraM: number; wgR: boolean; wm: number; V: number; end: number }
/** Returns both people's income, the pension fund after the year, take-home pay going to pension contributions, and any tax-free lump sum to free money. */
export function incomeYear(c: YearCtx, pen: number) {
  const { f, A, y, t, infl, wgw, tI, spI, penExtraM, wgR, wm, V, end } = c, a = y.age, yr = y.year, working = y.working
  const polInc = f.polInc > 0 && f.polIncAge > 0 && a >= f.polIncAge ? f.polInc : 0
  const p1: P = { emp: 0, se: f.work === 'Self-employed', sp: 0, draw: 0, other: (f.otherM + f.rentM) * 12 * infl + polInc, relief: 0, age: a }
  let cashOut = 0, lumpNet = 0   // own pension and auto-enrolment contributions come out of take-home pay
  if (working) {
    const gR = f.income * wgw, E = (f.pensionOwnM + penExtraM) * 12 * wgw
    p1.emp = gR; p1.relief = reliefOn(gR / tI, E / tI, a) * tI; cashOut += E
    let contrib = (f.pensionM + penExtraM) * 12 * wgw
    if (wgR) contrib = Math.max(0, contrib + wm * 12)
    if (f.ae) {   // auto-enrolment (phase 1 rates)
      const base = Math.min(gR / tI, RI.ae.earnCap) * tI
      contrib += (RI.ae.ee + RI.ae.er + RI.ae.state) * base; cashOut += RI.ae.ee * base
    }
    pen = pen * (1 + f.penG) + contrib
  } else if (!y.pension) pen = pen * (1 + f.penG)   // retired before access age (the bridge): the fund stays invested, living costs come from savings
  else {
    if (a === V) {   // ponytail: a customer already past this age at the start never gets the tax or lump sum (prototype rule: assumed taken before the plan)
      pen -= RI.pen.sftRate * Math.max(0, pen - sftFor(yr, A.infl))   // chargeable excess over the Standard Fund Threshold
      if (A.lumpSum > 0) { const L = lumpSum(pen, A.lumpSum); pen -= L.gross; lumpNet = L.net }
    }
    const mn = arfMin(a, pen)
    const want = A.rule === 'min' ? pen * mn : A.rule === 'fixed' ? Math.max(A.drawFixed * infl, pen * mn) : pen * Math.max(1 / Math.max(1, end - a + 1), mn)
    const draw = Math.min(pen, want)
    pen = (pen - draw) * (1 + A.penRet); p1.draw = draw
  }
  if (a >= A.spAge) p1.sp = A.sp * f.sp * spI + (a >= 80 && f.sp > 0 ? RI.sp.over80 * RI.sp.weeks * spI : 0)
  // --- partner: pay until their retirement age (66 if none), then their State Pension, or a Qualified Adult increase paid to you
  let p2: P | null = null
  if (f.partner) {
    const pa = f.pAge + t
    const emp = f.pAge > 0 && pa < (f.pRet || 66) ? f.pIncome * wgw : 0
    p2 = { emp, se: false, sp: 0, draw: 0, other: 0, relief: 0, age: pa }
    if (pa >= 66 && f.pSp !== 'qa') p2.sp = A.sp * (+f.pSp || 0) * spI
    if (f.pSp === 'qa' && a >= A.spAge && p2.emp === 0) p1.sp += (pa >= 66 ? RI.sp.qa66 : RI.sp.qaUnder66) * RI.sp.weeks * spI
  }
  return { p1, p2, pen, cashOut, lumpNet }
}
