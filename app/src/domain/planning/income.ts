// One year's income: pay, pension and State Pension for you and a partner, and the tax on it.
import type { PlanSettings } from './planSettings'
import { prsiRate, type Person } from './levies'
import { householdTax, person } from './tax'
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
  { index, age, prices, working, stressed }: YearContext,
  pensionWhatIf: number | null,
) {
  const { figures, growth, rules } = plan
  const payGrowth = (1 + growth.wage) ** index
  const taxBands = plan.flatBands ? 1 : prices
  const salary = working ? figures.income * payGrowth : 0
  const contributions = working
    ? payIntoPension(plan, balances, salary, { age, payGrowth, taxBands, stressed }, pensionWhatIf)
    : { relief: 0, paid: 0 }
  const pension = working
    ? { drawn: 0, lumpSumTax: 0, sftTax: 0 }
    : drawPension(plan, balances, wallet, { age, prices, stressed })
  const rise = statePensionRise(plan.statePensionGrowth, payGrowth, prices)
  const { partner, qualifiedAdult } = partnerIncome(plan, index, age, { payGrowth, rise, taxBands })
  const policyIncome =
    figures.policyIncome > 0 && figures.policyIncomeAge > 0 && age >= figures.policyIncomeAge
  const you: Person = {
    age,
    pay: salary,
    selfEmployed: figures.work === 'Self-employed',
    statePension: ownStatePension(plan, age) * rise + qualifiedAdult,
    drawdown: pension.drawn,
    otherIncome: otherIncome(figures, prices) + (policyIncome ? figures.policyIncome : 0),
    pensionRelief: contributions.relief,
  }
  const due = householdTax(rules, inToday(you, taxBands), partner && inToday(partner, taxBands), {
    married: figures.married,
    singleParent: figures.singleParentCredit,
    renting: figures.rentCredit && plan.startYear + index <= rules.it.rentLastYear,
    homeCarer: figures.homeCarerCredit,
    prsiRate: prsiRate(rules, plan.startYear + index),
  })
  const tax = due.total * taxBands
  const gross =
    you.pay +
    you.statePension +
    you.drawdown +
    you.otherIncome +
    (partner ? partner.pay + partner.statePension : 0)
  return {
    gross,
    tax,
    inflow: gross - tax - contributions.paid,
    // the year's money in and taxes, for the cash-flow sheet
    cashflow: {
      lumpSumTax: pension.lumpSumTax,
      sftTax: pension.sftTax,
      pay: you.pay,
      partnerPay: partner ? partner.pay : 0,
      statePension: you.statePension + (partner ? partner.statePension : 0),
      drawdown: you.drawdown,
      otherIncome: you.otherIncome,
      incomeTax: due.incomeTax * taxBands,
      usc: due.usc * taxBands,
      prsi: due.prsi * taxBands,
      contributions: contributions.paid,
    },
  }
}

/** Other income, rent less its costs (costs above the rent are not counted) and dividends, a year. */
const otherIncome = (figures: PlanSettings['figures'], prices: number) =>
  (figures.otherIncomeMonthly +
    figures.monthlyRentReceived -
    Math.min(figures.monthlyRentCosts, figures.monthlyRentReceived)) *
    12 *
    prices +
  figures.yearlyDividends * prices

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

/** The partner's pay and State Pension; a Qualified Adult increase is paid to you instead, while
 * the partner's own income is within the limit. */
function partnerIncome(
  { figures, rules, statePension }: PlanSettings,
  year: number,
  yourAge: number,
  { payGrowth, rise, taxBands }: { payGrowth: number; rise: number; taxBands: number },
) {
  if (!figures.partner) return { partner: null, qualifiedAdult: 0 }
  const age = (figures.partnerAge ?? 0) + year
  const working = (figures.partnerAge ?? 0) > 0 && age < (figures.partnerRetireAge || 66)
  const pay = working ? figures.partnerIncome * payGrowth : 0
  const share = figures.partnerStatePensionShare
  const isQualifiedAdult = share === 'qa'
  const partnerPension = age >= 66 && !isQualifiedAdult ? statePension * (Number(share) || 0) : 0
  const partner = person({ age, pay, statePension: partnerPension * rise })
  const withinLimit = pay / taxBands / rules.sp.weeks <= rules.sp.iqaLimit
  if (!isQualifiedAdult || yourAge < rules.sp.age || !withinLimit)
    return { partner, qualifiedAdult: 0 }
  const weekly = age >= 66 ? rules.sp.qa66 : rules.sp.qaUnder66
  return { partner, qualifiedAdult: weekly * rules.sp.weeks * rise }
}

const inToday = (p: Person, taxBands: number): Person => ({
  ...p,
  pay: p.pay / taxBands,
  statePension: p.statePension / taxBands,
  drawdown: p.drawdown / taxBands,
  otherIncome: p.otherIncome / taxBands,
  pensionRelief: p.pensionRelief / taxBands,
})
