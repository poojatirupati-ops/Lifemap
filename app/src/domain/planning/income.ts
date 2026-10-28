// One year's income: pay, pension and State Pension for you and a partner, and the tax on it.
import { arfMinimum, lumpSum, pensionRelief } from './pensions'
import type { PlanSettings } from './planSettings'
import { prsiRate } from './levies'
import { householdTax, type Person } from './tax'
import { deposit, type Wallet } from './wallet'
import type { Balances } from './balances'

const person = (age: number): Person => ({
  pay: 0,
  selfEmployed: false,
  statePension: 0,
  drawdown: 0,
  otherIncome: 0,
  pensionRelief: 0,
  age,
})

/** Pay, pension and State Pension for the year; the pension pot grows or is drawn down. */
/** pensionWhatIf: a what-if's extra monthly pension contribution, when it targets retirement */
export function incomes(
  plan: PlanSettings,
  balances: Balances,
  wallet: Wallet,
  year: number,
  pensionWhatIf: number | null,
) {
  const { figures: f, growth, rules } = plan
  const age = (f.age ?? 0) + year
  const prices = (1 + growth.inflation) ** year
  const pay = (1 + growth.wage) ** year
  const taxBands = plan.flatBands ? 1 : prices
  const statePensionRise = { pay, flat: 1 }[plan.statePensionGrowth] ?? prices
  const policyIncome = f.policyIncome > 0 && f.policyIncomeAge > 0 && age >= f.policyIncomeAge
  const you = person(age)
  you.selfEmployed = f.work === 'Self-employed'
  you.otherIncome =
    (f.otherIncomeMonthly + f.monthlyRentReceived) * 12 * prices +
    (policyIncome ? f.policyIncome : 0)
  // own pension and auto-enrolment contributions come out of take-home pay
  let contributionsPaid = 0
  if (age < f.retireAge) {
    you.pay = f.income * pay
    const own = (f.monthlyOwnPension + plan.extraPension) * 12 * pay
    you.pensionRelief = pensionRelief(rules, you.pay / taxBands, own / taxBands, age) * taxBands
    contributionsPaid += own
    let contributions = (f.monthlyPension + plan.extraPension) * 12 * pay
    if (pensionWhatIf != null) contributions = Math.max(0, contributions + pensionWhatIf * 12)
    if (f.autoEnrolled) {
      const earnings = Math.min(you.pay / taxBands, rules.ae.earnCap) * taxBands
      contributions += (rules.ae.ee + rules.ae.er + rules.ae.state) * earnings
      contributionsPaid += rules.ae.ee * earnings
    }
    balances.pension = balances.pension * (1 + f.pensionGrowth) + contributions
  } else if (age < Math.max(f.retireAge, plan.accessAge)) {
    // most pensions can't be drawn yet: the fund stays invested
    balances.pension *= 1 + f.pensionGrowth
  } else {
    you.drawdown = drawDown(plan, balances, wallet, age, prices)
  }
  if (age >= rules.sp.age) {
    const over80 = age >= 80 && f.statePensionShare > 0 ? rules.sp.over80 * rules.sp.weeks : 0
    you.statePension = (plan.statePension * f.statePensionShare + over80) * statePensionRise
  }
  const partner = f.partner ? person((f.partnerAge ?? 0) + year) : null
  if (partner) {
    const working = (f.partnerAge ?? 0) > 0 && partner.age < (f.partnerRetireAge || 66)
    partner.pay = working ? f.partnerIncome * pay : 0
    const share = f.partnerStatePensionShare
    if (partner.age >= 66 && share !== 'qa')
      partner.statePension = plan.statePension * (Number(share) || 0) * statePensionRise
    // a Qualified Adult increase is paid to you
    if (share === 'qa' && age >= rules.sp.age && partner.pay === 0) {
      const weekly = partner.age >= 66 ? rules.sp.qa66 : rules.sp.qaUnder66
      you.statePension += weekly * rules.sp.weeks * statePensionRise
    }
  }
  const inToday = (p: Person | null) =>
    p && {
      ...p,
      pay: p.pay / taxBands,
      statePension: p.statePension / taxBands,
      drawdown: p.drawdown / taxBands,
      otherIncome: p.otherIncome / taxBands,
      pensionRelief: p.pensionRelief / taxBands,
    }
  const tax =
    householdTax(rules, inToday(you)!, inToday(partner), {
      married: f.married,
      singleParent: f.singleParentCredit,
      renting: f.rentCredit && plan.startYear + year <= rules.it.rentLastYear,
      homeCarer: f.homeCarerCredit,
      prsiRate: prsiRate(rules, plan.startYear + year),
    }).total * taxBands
  const gross =
    you.pay +
    you.statePension +
    you.drawdown +
    you.otherIncome +
    (partner ? partner.pay + partner.statePension : 0)
  return { gross, tax, inflow: gross - tax - contributionsPaid }
}

/** At the access age: the threshold tax and the lump sum; then the yearly drawdown. */
function drawDown(
  plan: PlanSettings,
  balances: Balances,
  wallet: Wallet,
  age: number,
  prices: number,
) {
  const { rules } = plan
  if (age === Math.max(plan.figures.retireAge, plan.accessAge)) {
    const year = plan.startYear + age - (plan.figures.age ?? 0)
    balances.pension -= rules.pen.sftRate * Math.max(0, balances.pension - plan.sftAt(year))
    if (plan.lumpShare > 0) {
      const lump = lumpSum(rules, balances.pension, plan.lumpShare)
      balances.pension -= lump.gross
      deposit(wallet, lump.net)
    }
  }
  const pot = balances.pension
  const minimum = arfMinimum(rules, age, pot)
  const yearsLeft = Math.max(1, plan.end - age + 1)
  const wanted =
    plan.drawRule === 'min'
      ? pot * minimum
      : plan.drawRule === 'fixed'
        ? Math.max(plan.drawFixed * prices, pot * minimum)
        : pot * Math.max(1 / yearsLeft, minimum)
  const drawn = Math.min(pot, wanted)
  balances.pension = (pot - drawn) * (1 + plan.growth.pensionRetired)
  return drawn
}
