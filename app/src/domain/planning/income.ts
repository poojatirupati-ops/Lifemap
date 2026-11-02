// One year's income: pay, pension and State Pension for you and a partner, and the tax on it.
import type { PlanSettings } from './planSettings'
import { prsiRate, type Person } from './levies'
import { householdTax } from './tax'
import type { Wallet } from './wallet'
import { drawPension, payIntoPension, type Balances } from './balances'
import type { YearContext } from './fundYear'

/**
 * Pay, pension and State Pension for the year, and the tax on it. Grows or draws down the pension
 * in `balances`; a pension lump sum goes into `wallet`.
 * @param pensionWhatIf a what-if's extra monthly pension contribution, when it targets retirement
 */
export function yearIncome(
  plan: PlanSettings,
  balances: Balances,
  wallet: Wallet,
  { index, age, prices, working }: YearContext,
  pensionWhatIf: number | null,
) {
  const { figures, growth, rules } = plan
  const payGrowth = (1 + growth.wage) ** index
  const taxBands = plan.flatBands ? 1 : prices
  const salary = working ? figures.income * payGrowth : 0
  const contributions = working
    ? payIntoPension(plan, balances, salary, { age, payGrowth, taxBands }, pensionWhatIf)
    : { relief: 0, paid: 0 }
  const drawdown = working ? 0 : drawPension(plan, balances, wallet, age, prices)
  const rise = statePensionRise(plan.statePensionGrowth, payGrowth, prices)
  const { partner, qualifiedAdult } = partnerIncome(plan, index, age, payGrowth, rise)
  const policyIncome =
    figures.policyIncome > 0 && figures.policyIncomeAge > 0 && age >= figures.policyIncomeAge
  const you: Person = {
    age,
    pay: salary,
    selfEmployed: figures.work === 'Self-employed',
    statePension: ownStatePension(plan, age) * rise + qualifiedAdult,
    drawdown,
    otherIncome:
      (figures.otherIncomeMonthly + figures.monthlyRentReceived) * 12 * prices +
      (policyIncome ? figures.policyIncome : 0),
    pensionRelief: contributions.relief,
  }
  const tax =
    householdTax(rules, inToday(you, taxBands), partner && inToday(partner, taxBands), {
      married: figures.married,
      singleParent: figures.singleParentCredit,
      renting: figures.rentCredit && plan.startYear + index <= rules.it.rentLastYear,
      homeCarer: figures.homeCarerCredit,
      prsiRate: prsiRate(rules, plan.startYear + index),
    }).total * taxBands
  const gross =
    you.pay +
    you.statePension +
    you.drawdown +
    you.otherIncome +
    (partner ? partner.pay + partner.statePension : 0)
  return { gross, tax, inflow: gross - tax - contributions.paid }
}

function statePensionRise(growth: string, payGrowth: number, prices: number) {
  switch (growth) {
    case 'pay':
      return payGrowth
    case 'flat':
      return 1
    default:
      return prices
  }
}

/** Your State Pension this year in today's money, before it rises. */
function ownStatePension({ figures, rules, statePension }: PlanSettings, age: number) {
  if (age < rules.sp.age) return 0
  const over80 = age >= 80 && figures.statePensionShare > 0 ? rules.sp.over80 * rules.sp.weeks : 0
  return statePension * figures.statePensionShare + over80
}

/** The partner's pay and State Pension; a Qualified Adult increase is paid to you instead. */
function partnerIncome(
  { figures, rules, statePension }: PlanSettings,
  year: number,
  yourAge: number,
  payGrowth: number,
  rise: number,
) {
  if (!figures.partner) return { partner: null, qualifiedAdult: 0 }
  const age = (figures.partnerAge ?? 0) + year
  const working = (figures.partnerAge ?? 0) > 0 && age < (figures.partnerRetireAge || 66)
  const pay = working ? figures.partnerIncome * payGrowth : 0
  const share = figures.partnerStatePensionShare
  const isQualifiedAdult = share === 'qa'
  const partner: Person = {
    age,
    pay,
    selfEmployed: false,
    statePension: age >= 66 && !isQualifiedAdult ? statePension * (Number(share) || 0) * rise : 0,
    drawdown: 0,
    otherIncome: 0,
    pensionRelief: 0,
  }
  if (!isQualifiedAdult || yourAge < rules.sp.age || pay !== 0)
    return { partner, qualifiedAdult: 0 }
  const weekly = age >= 66 ? rules.sp.qa66 : rules.sp.qaUnder66
  return { partner, qualifiedAdult: weekly * rules.sp.weeks * rise }
}

const inToday = (person: Person, taxBands: number): Person => ({
  ...person,
  pay: person.pay / taxBands,
  statePension: person.statePension / taxBands,
  drawdown: person.drawdown / taxBands,
  otherIncome: person.otherIncome / taxBands,
  pensionRelief: person.pensionRelief / taxBands,
})
