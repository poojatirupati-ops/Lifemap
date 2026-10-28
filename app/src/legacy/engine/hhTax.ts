// Household income tax, USC and PRSI for one year. Pure.
import { RI } from './rates.ts'
import { prsiA, prsiS, usc } from './tax.ts'

export type P = { emp: number; se: boolean; sp: number; draw: number; other: number; relief: number; age: number }
export type TaxOpt = { married: boolean; spccc: boolean; rent: boolean; carer: boolean; rate: number }
const itBand = (T: number, band: number) => RI.it.r1 * Math.min(T, band) + RI.it.r2 * Math.max(0, T - band)
/** Household income tax, USC and PRSI for one year (joint assessment when married, in working and retired years). */
export function hhTax(p1: P, p2: P | null, o: TaxOpt): number {
  const I = RI.it, ps = p2 ? [p1, p2] : [p1]
  const tx = (p: P) => Math.max(0, p.emp + p.draw + p.other + p.sp - p.relief), payeAmt = (p: P) => Math.min(I.paye, I.payeCapPct * (p.emp + p.draw + p.sp))
  const paye = (p: P) => payeAmt(p) / I.paye, ageCr = (p: P) => (p.age >= I.ageCreditAge ? I.ageCredit : 0)
  let it = 0
  if (o.married && p2) {
    const x1 = tx(p1), x2 = tx(p2), T = x1 + x2, cr = I.personalMarried + I.paye * (paye(p1) + paye(p2)) + ageCr(p1) + ageCr(p2) + (o.rent ? I.rentJoint : 0)
    it = Math.max(0, itBand(T, I.bandMarried + Math.min(Math.min(x1, x2), I.bandUplift)) - cr)
    if (o.carer) {   // the better of the increased band or the Home Carer credit
      const hc = Math.max(0, I.homeCarer - Math.max(0, Math.min(x1, x2) - I.homeCarerLimit) / 2)
      it = Math.min(it, Math.max(0, itBand(T, I.bandMarried) - cr - hc))
    }
    if (p1.age >= I.ageCreditAge || p2.age >= I.ageCreditAge) it = T <= I.ageExemptMarried ? 0 : Math.min(it, I.ageMarginal * (T - I.ageExemptMarried))
  } else ps.forEach((p, k) => {
    const x = tx(p), lone = o.spccc && k === 0, cr = I.personal + payeAmt(p) + ageCr(p) + (lone ? I.spccc : 0) + (o.rent && (k === 0 || x > 0) ? I.rent : 0)
    let a = Math.max(0, itBand(x, lone ? I.bandSPCCC : I.band) - cr)
    if (p.age >= I.ageCreditAge) a = x <= I.ageExempt ? 0 : Math.min(a, I.ageMarginal * (x - I.ageExempt))
    it += a
  })
  let us = 0, pr = 0
  ps.forEach(p => {
    const base = p.emp + p.draw + p.other   // State Pension is USC-exempt
    us += usc(base, p.age >= RI.usc.reducedAge && base <= RI.usc.reducedMax) + (p.se ? RI.usc.seSurcharge * Math.max(0, p.emp - RI.usc.seSurchargeOver) : 0)
    if (p.age < RI.prsi.endAge) {
      const earned = p.se ? prsiS(p.emp, o.rate) : prsiA(p.emp, o.rate)
      pr += earned + o.rate * p.draw + (p.other > RI.prsi.unearnedMin ? o.rate * p.other : 0)
    }
  })
  return it + us + pr
}

/** A person's income in today's bands (divided by the band index tI). */
export const deflate = (p: P | null, tI: number): P | null => p && { ...p, emp: p.emp / tI, sp: p.sp / tI, draw: p.draw / tI, other: p.other / tI, relief: p.relief / tI }
