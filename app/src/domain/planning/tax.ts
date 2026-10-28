// Irish income tax and the household tax total (USC and PRSI live in levies.ts). Pure.
import { uscAndPrsi, type Person } from './levies'
import { sum } from './loans'
import type { Rules } from './rates'

export type { Person }

export interface TaxOptions {
  married?: boolean
  singleParent?: boolean
  renting?: boolean
  homeCarer?: boolean
  prsiRate: number
}

const person = (income: Partial<Person>): Person => ({
  pay: 0,
  selfEmployed: false,
  statePension: 0,
  drawdown: 0,
  otherIncome: 0,
  pensionRelief: 0,
  age: 40,
  ...income,
})

const taxAtBands = (rules: Rules, taxable: number, band: number) =>
  rules.it.r1 * Math.min(taxable, band) + rules.it.r2 * Math.max(0, taxable - band)

// a single employee with the personal and PAYE credits
export const incomeTax = (rules: Rules, gross: number) =>
  Math.max(0, taxAtBands(rules, gross, rules.it.band) - (rules.it.personal + rules.it.paye))

const taxable = (p: Person) =>
  Math.max(0, p.pay + p.drawdown + p.otherIncome + p.statePension - p.pensionRelief)

const payeCredit = (rules: Rules, p: Person) =>
  Math.min(rules.it.paye, rules.it.payeCapPct * (p.pay + p.drawdown + p.statePension))

const isOld = (rules: Rules, p: Person) => p.age >= rules.it.ageCreditAge
const ageCredit = (rules: Rules, p: Person) => (isOld(rules, p) ? rules.it.ageCredit : 0)

// over the age-exemption limit, tax is capped by marginal relief
const ageExempt = (rules: Rules, income: number, limit: number, due: number) =>
  income <= limit ? 0 : Math.min(due, rules.it.ageMarginal * (income - limit))

// joint assessment: one married band, raised by the lower income, and both people's credits
function jointIncomeTax(rules: Rules, first: Person, second: Person, options: TaxOptions) {
  const tax = rules.it
  const joint = taxable(first) + taxable(second)
  const lower = Math.min(taxable(first), taxable(second))
  const credits =
    tax.personalMarried +
    payeCredit(rules, first) +
    payeCredit(rules, second) +
    ageCredit(rules, first) +
    ageCredit(rules, second) +
    (options.renting ? tax.rentJoint : 0)
  const band = tax.bandMarried + Math.min(lower, tax.bandUplift)
  let due = Math.max(0, taxAtBands(rules, joint, band) - credits)
  if (options.homeCarer) {
    // the better of the increased band or the Home Carer credit
    const carerCredit = Math.max(0, tax.homeCarer - Math.max(0, lower - tax.homeCarerLimit) / 2)
    const withCarer = taxAtBands(rules, joint, tax.bandMarried) - credits - carerCredit
    due = Math.min(due, Math.max(0, withCarer))
  }
  const eitherOld = isOld(rules, first) || isOld(rules, second)
  return eitherOld ? ageExempt(rules, joint, tax.ageExemptMarried, due) : due
}

// one person assessed alone; the single-parent credit and band go to the first person
function singleIncomeTax(rules: Rules, p: Person, isFirst: boolean, options: TaxOptions) {
  const tax = rules.it
  const income = taxable(p)
  const singleParent = !!options.singleParent && isFirst
  const credits =
    tax.personal +
    payeCredit(rules, p) +
    ageCredit(rules, p) +
    (singleParent ? tax.spccc : 0) +
    (options.renting && (isFirst || income > 0) ? tax.rent : 0)
  const band = singleParent ? tax.bandSPCCC : tax.band
  const due = Math.max(0, taxAtBands(rules, income, band) - credits)
  return isOld(rules, p) ? ageExempt(rules, income, tax.ageExempt, due) : due
}

/** Household income tax, USC and PRSI for one year; joint assessment applies when married. */
export function householdTax(
  rules: Rules,
  first: Person,
  second: Person | null,
  options: TaxOptions,
) {
  const people = second ? [first, second] : [first]
  const incomeTaxDue =
    options.married && second
      ? jointIncomeTax(rules, first, second, options)
      : sum(people, (p, index) => singleIncomeTax(rules, p, index === 0, options))
  const levies = people.map((p) => uscAndPrsi(rules, p, options.prsiRate))
  const uscDue = sum(levies, (due) => due.usc)
  const prsiDue = sum(levies, (due) => due.prsi)
  return {
    incomeTax: incomeTaxDue,
    usc: uscDue,
    prsi: prsiDue,
    total: incomeTaxDue + uscDue + prsiDue,
  }
}

export function takeHomePay(
  rules: Rules,
  gross: number,
  options: Partial<Person> & Pick<TaxOptions, 'prsiRate' | 'singleParent' | 'renting'>,
) {
  const { prsiRate, singleParent, renting, ...income } = options
  const you = person({ ...income, pay: gross })
  if (gross <= 0 && !you.statePension) return 0
  const tax = householdTax(rules, you, null, { prsiRate, singleParent, renting })
  return gross + you.statePension - tax.total
}

export function retirementTakeHome(
  rules: Rules,
  drawdown: number,
  statePension: number,
  age: number,
  prsiRate: number,
) {
  if (drawdown + statePension <= 0) return 0
  const tax = householdTax(rules, person({ drawdown, statePension, age }), null, { prsiRate })
  return drawdown + statePension - tax.total
}

export function jointAssessmentSaving(rules: Rules, gross1: number, gross2: number) {
  const taxWhen = (married: boolean) => {
    const tax = householdTax(rules, person({ pay: gross1 }), person({ pay: gross2 }), {
      married,
      prsiRate: 0,
    })
    return tax.incomeTax
  }
  return Math.max(0, taxWhen(false) - taxWhen(true))
}
