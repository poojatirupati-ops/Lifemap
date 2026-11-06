// USC and PRSI, per person. Pure: the rules of the plan year are an argument.
import type { Rules } from './rates'

/** One person's income for a year. */
export interface Person {
  pay: number
  selfEmployed: boolean
  statePension: number
  /** ARF or PRSA drawdown */
  drawdown: number
  otherIncome: number
  /** own pension contributions relieved for income tax */
  pensionRelief: number
  age: number
}

export function usc(rules: Rules, gross: number, reducedRates?: boolean) {
  if (gross <= rules.usc.exempt) return 0
  let total = 0
  let from = 0
  for (const [upTo, rate] of reducedRates ? rules.usc.reducedBands : rules.usc.bands) {
    total += Math.max(0, Math.min(gross, upTo) - from) * rate
    from = upTo
    if (gross <= upTo) break
  }
  return total
}

// PRSI rate for a calendar year on the legislated path: each change applies from its month
export function prsiRate(rules: Rules, year: number) {
  const path = rules.prsi.path
  let total = 0
  for (let month = 0; month < 12; month++) {
    const started = path.filter((step) => year * 12 + month >= step.y * 12 + step.m - 1)
    total += (started.at(-1) ?? path[0]).r
  }
  return total / 12
}

// Class S (self-employed): all income once over the threshold, with a minimum and no credit.
// Class A (employee): with the PRSI credit.
export function prsi(rules: Rules, gross: number, rate: number, selfEmployed?: boolean) {
  const { sMinIncome, sMin, wkFree, creditTo, creditMax, creditTaper } = rules.prsi
  if (selfEmployed) return gross > sMinIncome ? Math.max(sMin, gross * rate) : 0
  const weekly = gross / 52
  if (weekly <= wkFree) return 0
  const credit =
    weekly <= creditTo ? Math.max(0, creditMax - (weekly - (wkFree + 0.01)) / creditTaper) : 0
  return Math.max(0, (weekly * rate - credit) * 52)
}

export function uscAndPrsi(rules: Rules, p: Person, rate: number) {
  // State Pension is USC-exempt
  const uscIncome = p.pay + p.drawdown + p.otherIncome
  const reduced = p.age >= rules.usc.reducedAge && uscIncome <= rules.usc.reducedMax
  const surcharge = p.selfEmployed
    ? rules.usc.seSurcharge * Math.max(0, p.pay - rules.usc.seSurchargeOver)
    : 0
  const { endAge, unearnedMin, arfApplies, arfToAge } = rules.prsi
  // no PRSI on pay or unearned income from 66
  const earned =
    p.age < endAge
      ? prsi(rules, p.pay, rate, p.selfEmployed) +
        (p.otherIncome > unearnedMin ? rate * p.otherIncome : 0)
      : 0
  // ARF / PRSA withdrawals: before 66, and from 66 to 70 without a contributory State Pension
  const drawdownCharged =
    arfApplies && p.drawdown > 0 && (p.age < endAge || (p.age < arfToAge && !(p.statePension > 0)))
  const prsiDue = earned + (drawdownCharged ? rate * p.drawdown : 0)
  return { usc: usc(rules, uscIncome, reduced) + surcharge, prsi: prsiDue }
}
