// Irish tax helpers on the 2026 rules (RI from rates.ts). Pure; law values stay fixed.
// Budget 2027 values are deliberately not applied until final and official.
import { RI } from './rates.ts'

export const incomeTax = (g: number, credits: number = RI.it.personal + RI.it.paye, band: number = RI.it.band): number =>
  Math.max(0, RI.it.r1 * Math.min(g, band) + RI.it.r2 * Math.max(0, g - band) - credits)

export function usc(g: number, reduced = false): number {
  if (g <= RI.usc.exempt) return 0
  let t = 0
  let lo = 0
  for (const [hi, r] of reduced ? RI.usc.reducedBands : RI.usc.bands) {
    t += Math.max(0, Math.min(g, hi) - lo) * r
    lo = hi
    if (g <= hi) break
  }
  return t
}

/** PRSI rate for a calendar year on the legislated path (months before and after each 1 Oct change are blended). */
export function prsiRate(year: number): number {
  const P = RI.prsi.path
  let s = 0
  for (let m = 0; m < 12; m++) {
    let r = P[0].r
    for (const x of P) if (year * 12 + m >= x.y * 12 + x.m - 1) r = x.r
    s += r
  }
  return s / 12
}

/** Class A PRSI with the weekly credit. */
export function prsiA(g: number, rate: number): number {
  const P = RI.prsi
  const wk = g / 52
  if (wk <= P.wkFree) return 0
  const cr = wk <= P.creditTo ? Math.max(0, P.creditMax - (wk - (P.wkFree + 0.01)) / P.creditTaper) : 0
  return Math.max(0, (wk * rate - cr) * 52)
}

/** Class S PRSI: all income over the minimum income, with a minimum charge, no credit. */
export const prsiS = (g: number, rate: number): number => (g > RI.prsi.sMinIncome ? Math.max(RI.prsi.sMin, g * rate) : 0)

const reliefRate = (age: number): number => (RI.pen.relief.find(([lim]) => age < lim) ?? RI.pen.relief[RI.pen.relief.length - 1])[1]

/** Employee pension contribution `E` relieved for income tax: age band, within the earnings cap. */
export const reliefOn = (g: number, E: number, age: number): number => Math.min(E, reliefRate(age) * Math.min(g, RI.pen.earnCap))

/** Lump sum at retirement (nominal): up to 25%, first 200k tax-free, 200k to 500k at 20%, above at the higher rate. */
export function lumpSum(potNom: number, pct: number): { gross: number; tax: number; net: number } {
  const P = RI.pen
  const gross = potNom * Math.min(pct, P.lsMaxPct)
  const tax = P.lsBandRate * Math.max(0, Math.min(gross, P.lsCap) - P.lsTaxFree) + RI.it.r2 * Math.max(0, gross - P.lsCap)
  return { gross, tax, net: gross - tax }
}

/** Standard Fund Threshold: set by law to 2029, then assumed to rise with `infl` (the customer's own inflation choice). */
export function sftFor(yr: number, infl: number): number {
  const T: Readonly<Record<number, number>> = RI.pen.sft
  const ks = Object.keys(T).map(Number).sort((a, b) => a - b)
  const last = ks[ks.length - 1]
  return yr <= ks[0] ? T[ks[0]] : yr <= last ? T[yr] : T[last] * Math.pow(1 + infl, yr - last)
}

/** Minimum ARF drawdown rate (0 before 61). */
export const arfMin = (age: number, pot: number): number =>
  age >= 61 ? (pot > RI.pen.arfBig ? RI.pen.arfMinBig : age >= 71 ? RI.pen.arfMin71 : RI.pen.arfMin61) : 0
