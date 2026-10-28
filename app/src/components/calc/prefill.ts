// What a tool starts from, from what we know: the customer's statement for this tool, Your
// finances (statement > typed) and the plan. Undefined = nothing known; null = known to be missing.
import { planSettings } from '../../domain/planning/planSettings.ts'
import { pensionPotAfter } from '../../domain/planning/pensions.ts'
import { project } from '../../domain/planning/project.ts'
import { retirementGoal } from '../../domain/goals/goals.ts'
import { toNumber } from '../../lib/format.ts'
import { workedOutNote } from '../finance/checkList.ts'
import type { CalcPlan } from './context.ts'
import { monthlyFromYearly, payoff } from './maths.ts'

type Prefill = Record<string, number | null | undefined>

const isFigure = (value: unknown) => value != null && value !== '' && !isNaN(Number(value))

/** Life cover the customer has (their own and through work). */
function coverHeld(plan: CalcPlan, income: number) {
  const total = (list: 'life' | 'workCover') =>
    plan.fin[list] !== 'Yes'
      ? 0
      : (plan.lists[list] ?? []).reduce((sum, { f }) => {
          if (isFigure(f.amount)) return sum + Number(f.amount)
          if (list === 'workCover' && isFigure(f.mult) && income > 0)
            return sum + Number(f.mult) * income
          return sum
        }, 0)
  return total('life') + total('workCover')
}

export function prefill(plan: CalcPlan, toolId: string) {
  const settings = planSettings(plan)
  const { rules, figures: f, growth } = settings
  const known = (key: string) => !!plan.src[key] && isFigure(plan.fin[key])
  const takeHome = () => project(plan).rows[0].inflow / 12
  const essentials = f.monthlyCosts + f.monthlyMortgage + (f.debt > 0 ? f.monthlyDebtPayment : 0)
  const age = plan.about.age ?? 0
  const retireIn = Math.max(1, plan.retireAge - age)
  const homeGoal = plan.goals.find((goal) => goal.k === 'home')
  const mortgage = f.mortgageBalance > 0
  const mortgageRate = toNumber(plan.fin.mortRate) > 0 ? toNumber(plan.fin.mortRate) : undefined
  const mortgageYears = f.mortgageYears || null
  const pensionGrowth = +(f.pensionGrowth * 100).toFixed(2)
  const taxRate = () => {
    const band = f.married
      ? rules.it.bandMarried + Math.min(f.partnerIncome, rules.it.bandUplift)
      : f.singleParentCredit
        ? rules.it.bandSPCCC
        : rules.it.band
    return (f.married ? f.income + f.partnerIncome : f.income) > band ? 40 : 20
  }
  const pensionTool = (): Prefill => ({
    ...(known('income') && { sal: f.income, tr: taxRate() }),
    ...(f.monthlyOwnPension > 0 && {
      ex: Math.round((f.monthlyOwnPension + Number(plan.penExtra || 0)) * 12),
    }),
    ...(plan.retireSet && { y: retireIn }),
    g: pensionGrowth,
  })

  const values: Prefill = age >= 18 ? { age } : {}
  const workedOut: Record<string, string> = {}
  const fill: Record<string, () => Prefill> = {
    borrow: () => ({
      ...(known('income') && { inc: f.income }),
      ...(known('pIncome') && { inc2: f.partnerIncome }),
      ...(homeGoal?.saved && { dep: homeGoal.saved }),
      ...(plan.fin.home && { ftb: /^Own/.test(plan.fin.home) ? 0 : 1 }),
    }),
    deposit: () => (homeGoal?.saved ? { saved: homeGoal.saved } : {}),
    rentbuy: () => (homeGoal?.amount ? { dep: homeGoal.amount } : {}),
    repayment: () =>
      mortgage ? { loan: f.mortgageBalance, rate: mortgageRate, term: mortgageYears } : {},
    ratechange: () => fill.repayment(),
    term: () => (mortgage ? { loan: f.mortgageBalance, rate: mortgageRate, a: mortgageYears } : {}),
    overpay: () =>
      mortgage ? { bal: f.mortgageBalance, rate: mortgageRate, yrs: mortgageYears } : {},
    mortgageprotect: () =>
      mortgage ? { bal: f.mortgageBalance, rate: mortgageRate, y: mortgageYears } : {},
    emergency: () => ({
      ...(known('costsM') && { e: essentials }),
      ...(known('cash') && { s: f.cash }),
    }),
    incomegap: () => ({ ...fill.emergency(), ...(known('income') && { inc: f.income }) }),
    retirement: () => ({
      ...(known('pension') && { pot: f.pension }),
      ...(known('pensionM') && { m: f.monthlyPension }),
      ...(plan.retireSet && { ra: plan.retireAge }),
      ...(f.statePensionKnown && {
        o: Math.round(rules.sp.week * rules.sp.weeks * f.statePensionShare),
      }),
      g: pensionGrowth,
      ...(retirementGoal(plan.goals) && { d: retirementGoal(plan.goals)!.amount }),
    }),
    contrib: pensionTool,
    avc: pensionTool,
    lastmoney: () => ({
      ...fill.drawdown(),
      ...(plan.retireSet && {
        age: Math.max(plan.retireAge, Number(settings.accessAge)),
      }),
    }),
    drawdown: () => ({
      ...(plan.asm.drawRule === 'fixed' &&
        Number(plan.asm.drawFixed) > 0 && { w: Math.round(Number(plan.asm.drawFixed)) }),
      ...((known('pension') || known('pensionM')) &&
        plan.retireSet && {
          pot: Math.round(
            pensionPotAfter(
              Math.max(0, plan.retireAge - age),
              f.pension,
              f.monthlyPension,
              f.pensionGrowth,
              growth.wage,
            ),
          ),
        }),
    }),
    lumpsum: () => (known('invest') ? { p: f.invest } : {}),
    fees: () => fill.lumpsum(),
    riskreturn: () => fill.lumpsum(),
    realreturn: () => fill.lumpsum(),
    lifecover: () => {
      const held = coverHeld(plan, toNumber(plan.fin.income))
      return {
        ...(held > 0 && { ex: Math.round(held) }),
        ...(known('income') && { inc: f.income }),
        ...(mortgage && { mort: f.mortgageBalance }),
        ...(f.debt > 0 && { debt: f.debt }),
        ...((known('cash') || known('invest')) && { sav: f.cash + f.invest }),
      }
    },
    networth: () => ({
      ...(known('cash') && { sav: f.cash }),
      ...(known('invest') && { inv: f.invest }),
      ...(known('pension') && { pen: f.pension }),
      ...(/^Own/.test(plan.fin.home || '') && {
        prop: toNumber(plan.fin.homeValue) + toNumber(plan.fin.propValue),
      }),
      ...(mortgage && { mort: f.mortgageBalance }),
      ...(f.debt > 0 && { loans: f.debt }),
    }),
    // matches the plan's spare money this year
    surplus: () => {
      if (!known('income')) return {}
      if (f.mortgageEstimated && mortgage) workedOut.ess = workedOutNote('mortPayM', plan)
      if (f.debtPaymentEstimated)
        workedOut.debt = workedOutNote(f.cardPaymentEstimated ? 'cardPayM' : 'loanPayM', plan)
      return {
        inc: takeHome(),
        ess: f.monthlyCosts + f.yearlyOneOffs / 12 + f.monthlyMortgage,
        life: 0,
        debt: f.debt > 0 ? f.monthlyDebtPayment : 0,
      }
    },
    budget: () => (known('income') ? { inc: takeHome() } : {}),
    // the debt that takes longest to clear
    debtpay: () => {
      if (f.debt <= 0) return {}
      const months = (balance: number, pay: number, rate: number) =>
        balance > 0 ? payoff(balance, pay, monthlyFromYearly(rate * 100)).months : 0
      const card =
        months(f.cardBalance, f.monthlyCardPayment, f.cardRate) >=
        months(f.loanBalance, f.monthlyLoanPayment, f.loanRate)
      const [payKey, estimated] = card
        ? ['cardPayM', f.cardPaymentEstimated]
        : ['loanPayM', f.loanPaymentEstimated]
      if (estimated) workedOut.p = workedOutNote(payKey, plan)
      return card
        ? {
            b: f.cardBalance,
            p: f.monthlyCardPayment,
            apr: f.cardRateKnown ? f.cardRate * 100 : undefined,
          }
        : {
            b: f.loanBalance,
            p: f.monthlyLoanPayment,
            apr: f.loanRateKnown ? f.loanRate * 100 : undefined,
          }
    },
  }
  Object.assign(values, fill[toolId]?.(), plan.calcDoc[toolId])
  return { values, workedOut }
}
