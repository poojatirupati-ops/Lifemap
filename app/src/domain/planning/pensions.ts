// Pension maths: tax relief, the State Pension share, lump sums, the threshold, ARF drawdown, pot growth.
import type { Rules } from './rates'
import { incomeTax } from './tax'

// share of pay that can get pension relief, by age band
function reliefLimit(rules: Rules, age: number) {
  const bands = rules.pen.relief
  return (bands.find(([upTo]) => age < upTo) ?? bands.at(-1)!)[1]
}

// pro rata from the minimum to the full number of contribution years
export const statePensionFraction = (rules: Rules, years: number) =>
  years < rules.sp.minYears ? 0 : Math.min(1, years / rules.sp.fullYears)

const PARTNER_STATE_PENSION: Record<string, number | 'qa' | 'partial'> = {
  'Own full': 1,
  'Own partial': 'partial',
  'Not sure': 'partial',
  'Qualified adult increase': 'qa',
  None: 0,
}

// the partner's State Pension share, or 'qa' for the qualified adult increase
export function partnerStatePension(option: string, partialShare: () => number) {
  const share = PARTNER_STATE_PENSION[option]
  return share === 'partial' ? partialShare() : share
}

// auto-enrolment by age and earnings (employees with no pension of their own)
export const canAutoEnrol = ({ ae }: Rules, age: number | null, income: number) =>
  age != null && age >= ae.ageMin && age <= ae.ageMax && income > ae.earnMin

// income tax relief on the employee's own contributions, within the age band and the earnings cap
export const pensionRelief = (rules: Rules, gross: number, contribution: number, age: number) =>
  Math.min(contribution, reliefLimit(rules, age) * Math.min(gross, rules.pen.earnCap))

export const pensionNetCost = (rules: Rules, gross: number, contribution: number, age: number) => {
  const relieved = Math.max(0, gross - pensionRelief(rules, gross, contribution, age))
  return contribution - (incomeTax(rules, gross) - incomeTax(rules, relieved))
}

// Lump sum: up to the maximum share, the first part tax-free, the next band at a set rate, the rest at the higher rate. Caps are nominal.
export function lumpSum(rules: Rules, pot: number, share: number) {
  const { lsMaxPct, lsBandRate, lsCap, lsTaxFree } = rules.pen
  const gross = pot * Math.min(share, lsMaxPct)
  const tax =
    lsBandRate * Math.max(0, Math.min(gross, lsCap) - lsTaxFree) +
    rules.it.r2 * Math.max(0, gross - lsCap)
  return { gross, tax, net: gross - tax }
}

// Standard Fund Threshold: set by law year by year, then rising with prices
export function standardFundThreshold(rules: Rules, year: number, inflation: number) {
  const byYear = rules.pen.sft as Record<number, number>
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
  const first = years[0]
  const last = years.at(-1)!
  if (year <= first) return byYear[first]
  if (year <= last) return byYear[year]
  return byYear[last] * (1 + inflation) ** (year - last)
}

// minimum yearly ARF drawdown
export function arfMinimum(rules: Rules, age: number, pot: number) {
  const { arfBig, arfMinBig, arfMin61, arfMin71 } = rules.pen
  if (age < 61) return 0
  if (pot > arfBig) return arfMinBig
  return age >= 71 ? arfMin71 : arfMin61
}

// pension pot after some years: grows yearly, contributions rise with pay
export function pensionPotAfter(
  years: number,
  pot: number,
  monthly: number,
  growth: number,
  payRise: number,
) {
  for (let year = 0; year < years; year++)
    pot = pot * (1 + growth) + monthly * 12 * (1 + payRise) ** year
  return pot
}
