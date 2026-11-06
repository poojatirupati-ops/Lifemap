// What a tool starts from, from what we know: the customer's statement for this tool, Your
// finances (statement > typed) and the plan.
import { retirementGoal } from '../goals/goals.ts'
import { pensionPotAfter } from '../planning/pensions.ts'
import { planSettings } from '../planning/planSettings.ts'
import { project } from '../planning/project.ts'
import { workedOutNote } from '../../components/finance/checkList.ts'
import { isNumber, toNumber } from '../../lib/format.ts'
import type { ToolPlan } from './context.ts'
import { monthlyFromYearly, payoff } from './maths.ts'

/** A tool's starting figures: undefined = nothing known; null = known to be missing. */
type Values = Record<string, number | null | undefined>

/** What a tool starts from, with a note for each figure worked out of the customer's own. */
interface Fill {
  values: Values
  workedOut?: Record<string, string>
}

function knownFigures(plan: ToolPlan) {
  const settings = planSettings(plan)
  const { figures } = settings
  const mortgageRate = toNumber(plan.figures.mortRate)
  return {
    plan,
    settings,
    figures,
    age: plan.about.age ?? 0,
    /** The customer gave us this figure (typed or from a statement). */
    has: (key: string) => !!plan.sources[key] && isNumber(plan.figures[key]),
    takeHome: () => project(plan).rows[0].inflow / 12,
    hasMortgage: figures.mortgageBalance > 0,
    mortgageRate: mortgageRate > 0 ? mortgageRate : undefined,
    mortgageYears: figures.mortgageYears || null,
    pensionGrowth: +(figures.pensionGrowth * 100).toFixed(2),
  }
}

type Known = ReturnType<typeof knownFigures>

const homeGoalOf = ({ plan }: Known) => plan.goals.find((goal) => goal.key === 'home')

/** The mortgage figures under each tool's own keys. */
function mortgage(known: Known, keys: { balance: string; years: string }): Fill {
  const { hasMortgage, figures, mortgageRate, mortgageYears } = known
  if (!hasMortgage) return { values: {} }
  return {
    values: {
      [keys.balance]: figures.mortgageBalance,
      rate: mortgageRate,
      [keys.years]: mortgageYears,
    },
  }
}

/** 20 or 40: the customer's top income tax rate. */
function taxRate({ figures, settings: { rules } }: Known) {
  const band = figures.married
    ? rules.it.bandMarried + Math.min(figures.partnerIncome, rules.it.bandUplift)
    : figures.singleParentCredit
      ? rules.it.bandSPCCC
      : rules.it.band
  const income = figures.married ? figures.income + figures.partnerIncome : figures.income
  return income > band ? 40 : 20
}

function contributions(known: Known): Fill {
  const { has, figures, plan, age, pensionGrowth } = known
  const paidYearly = (figures.monthlyOwnPension + Number(plan.pensionExtra || 0)) * 12
  return {
    values: {
      ...(has('income') && { sal: figures.income, tr: taxRate(known) }),
      ...(figures.monthlyOwnPension > 0 && { ex: Math.round(paidYearly) }),
      ...(plan.retireSet && { y: Math.max(1, plan.retireAge - age) }),
      g: pensionGrowth,
    },
  }
}

function drawdown({ has, figures, plan, age, settings }: Known): Values {
  const fixedWithdrawal =
    plan.assumptions.drawRule === 'fixed' && Number(plan.assumptions.drawFixed) > 0
  const potKnown = (has('pension') || has('pensionM')) && plan.retireSet
  const pot = () =>
    pensionPotAfter(
      Math.max(0, plan.retireAge - age),
      figures.pension,
      figures.monthlyPension,
      figures.pensionGrowth,
      settings.growth.wage,
    )
  return {
    ...(fixedWithdrawal && { w: Math.round(Number(plan.assumptions.drawFixed)) }),
    ...(potKnown && { pot: Math.round(pot()) }),
  }
}

function emergency({ has, figures }: Known): Values {
  const debtPayment = figures.debt > 0 ? figures.monthlyDebtPayment : 0
  return {
    ...(has('costsM') && { e: figures.monthlyCosts + figures.monthlyMortgage + debtPayment }),
    ...(has('cash') && { s: figures.cash }),
  }
}

/** Life cover the customer has (their own and through work). */
function coverHeld({ figures, lists }: ToolPlan, income: number) {
  const total = (list: 'life' | 'workCover') =>
    figures[list] !== 'Yes'
      ? 0
      : (lists[list] ?? []).reduce((sum, { fields }) => {
          if (isNumber(fields.amount)) return sum + Number(fields.amount)
          if (list === 'workCover' && isNumber(fields.mult) && income > 0)
            return sum + Number(fields.mult) * income
          return sum
        }, 0)
  return total('life') + total('workCover')
}

/** The customer's card, and their own loans without other mortgages (the debt tools leave those out). */
function cardAndLoan({ figures }: Known) {
  return {
    card: {
      payKey: 'cardPayM',
      estimated: figures.cardPaymentEstimated,
      balance: figures.cardBalance,
      payment: figures.monthlyCardPayment,
      rate: figures.cardRate,
      apr: figures.cardRateKnown ? figures.cardRate * 100 : undefined,
    },
    loan: {
      payKey: 'ownLoanPayM',
      estimated: figures.ownLoanPaymentEstimated,
      balance: figures.ownLoanBalance,
      payment: figures.monthlyOwnLoanPayment,
      rate: figures.ownLoanRate,
      apr: figures.loanRateKnown ? figures.ownLoanRate * 100 : undefined,
    },
  }
}

/** The debt that takes longest to clear. */
function debtpay(known: Known): Fill {
  const { card, loan } = cardAndLoan(known)
  if (card.balance + loan.balance <= 0) return { values: {} }
  const monthsToClear = (debt: typeof card) =>
    debt.balance > 0
      ? payoff(debt.balance, debt.payment, monthlyFromYearly(debt.rate * 100)).months
      : 0
  const debt = monthsToClear(card) >= monthsToClear(loan) ? card : loan
  return {
    values: { b: debt.balance, p: debt.payment, apr: debt.apr },
    workedOut: debt.estimated ? { p: workedOutNote(debt.payKey, known.plan) } : {},
  }
}

/** Up to three debts: the card first, then the customer's own loans; nothing else owed, no extra. */
function debtplan(known: Known): Fill {
  const { card, loan } = cardAndLoan(known)
  if (card.balance + loan.balance <= 0) return { values: {} }
  const note = (debt: typeof card) =>
    debt.estimated && debt.balance > 0 ? workedOutNote(debt.payKey, known.plan) : ''
  return {
    values: {
      b1: card.balance,
      m1: card.payment,
      apr1: card.apr,
      b2: loan.balance,
      m2: loan.payment,
      apr2: loan.apr,
      b3: 0,
      m3: 0,
      x: 0,
    },
    workedOut: { m1: note(card), m2: note(loan) },
  }
}

/** The card's balance, payment and rate. */
function creditcard(known: Known): Fill {
  const { card } = cardAndLoan(known)
  if (card.balance <= 0) return { values: {} }
  return {
    values: { b: card.balance, p: card.payment, apr: card.apr },
    workedOut: card.estimated ? { p: workedOutNote(card.payKey, known.plan) } : {},
  }
}

/** Spending and repayments as for the monthly surplus, the plan's saving and the loan rate. */
function loanafford(known: Known): Fill {
  const { has, figures, plan } = known
  if (!has('income')) return { values: {} }
  const { values, workedOut } = surplus(known)
  const saving = project(plan).saving.savingMonthly
  return {
    values: {
      inc: values.inc,
      ess: values.ess,
      debt: values.debt,
      sav: Math.max(0, Math.round(saving / 5) * 5),
      apr: figures.loanRateKnown ? figures.loanRate * 100 : undefined,
    },
    workedOut,
  }
}

/** Matches the plan's spare money this year. */
function surplus({ has, figures, plan, hasMortgage, takeHome }: Known): Fill {
  if (!has('income')) return { values: {} }
  const workedOut: Record<string, string> = {}
  if (figures.mortgageEstimated && hasMortgage) workedOut.ess = workedOutNote('mortPayM', plan)
  if (figures.debtPaymentEstimated) {
    const payKey = figures.cardPaymentEstimated ? 'cardPayM' : 'loanPayM'
    workedOut.debt = workedOutNote(payKey, plan)
  }
  return {
    values: {
      inc: takeHome(),
      ess: figures.monthlyCosts + figures.yearlyOneOffs / 12 + figures.monthlyMortgage,
      life: 0,
      debt: figures.debt > 0 ? figures.monthlyDebtPayment : 0,
    },
    workedOut,
  }
}

const FILLS: Record<string, (known: Known) => Fill> = {
  borrow: (known) => {
    const { has, figures, plan } = known
    const saved = homeGoalOf(known)?.saved
    return {
      values: {
        ...(has('income') && { inc: figures.income }),
        ...(has('pIncome') && { inc2: figures.partnerIncome }),
        ...(saved && { dep: saved }),
        ...(plan.figures.home && { ftb: plan.figures.home.startsWith('Own') ? 0 : 1 }),
      },
    }
  },
  deposit: (known) => {
    const saved = homeGoalOf(known)?.saved
    return { values: saved ? { saved } : {} }
  },
  rentbuy: (known) => {
    const amount = homeGoalOf(known)?.amount
    return { values: amount ? { dep: amount } : {} }
  },
  repayment: (known) => mortgage(known, { balance: 'loan', years: 'term' }),
  term: (known) => mortgage(known, { balance: 'loan', years: 'a' }),
  overpay: (known) => mortgage(known, { balance: 'bal', years: 'yrs' }),
  mortgageprotect: (known) => mortgage(known, { balance: 'bal', years: 'y' }),

  retirement: ({ has, figures, plan, settings: { rules }, pensionGrowth }) => {
    const goal = retirementGoal(plan.goals)
    return {
      values: {
        ...(has('pension') && { pot: figures.pension }),
        ...(has('pensionM') && { m: figures.monthlyPension }),
        ...(plan.retireSet && { ra: plan.retireAge }),
        ...(figures.statePensionKnown && {
          o: Math.round(rules.sp.week * rules.sp.weeks * figures.statePensionShare),
        }),
        g: pensionGrowth,
        ...(goal && { d: goal.amount }),
      },
    }
  },
  contrib: contributions,
  avc: contributions,
  drawdown: (known) => ({ values: drawdown(known) }),
  lastmoney: (known) => {
    const { plan, settings } = known
    return {
      values: {
        ...drawdown(known),
        ...(plan.retireSet && { age: Math.max(plan.retireAge, Number(settings.accessAge)) }),
      },
    }
  },

  emergency: (known) => ({ values: emergency(known) }),
  incomegap: (known) => ({
    values: { ...emergency(known), ...(known.has('income') && { inc: known.figures.income }) },
  }),
  lumpsum: ({ has, figures }) => ({ values: has('invest') ? { p: figures.invest } : {} }),
  lifecover: ({ has, figures, plan, hasMortgage }) => {
    const held = coverHeld(plan, toNumber(plan.figures.income))
    return {
      values: {
        ...(held > 0 && { ex: Math.round(held) }),
        ...(has('income') && { inc: figures.income }),
        ...(hasMortgage && { mort: figures.mortgageBalance }),
        ...(figures.debt > 0 && { debt: figures.debt }),
        ...((has('cash') || has('invest')) && { sav: figures.cash + figures.invest }),
      },
    }
  },
  networth: ({ has, figures, plan, hasMortgage }) => ({
    values: {
      ...(has('cash') && { sav: figures.cash }),
      ...(has('invest') && { inv: figures.invest }),
      ...(has('pension') && { pen: figures.pension }),
      ...(plan.figures.home?.startsWith('Own') && {
        prop: toNumber(plan.figures.homeValue) + toNumber(plan.figures.propValue),
      }),
      ...(hasMortgage && { mort: figures.mortgageBalance }),
      ...(figures.debt > 0 && { loans: figures.debt }),
    },
  }),
  surplus,
  budget: ({ has, takeHome }) => ({ values: has('income') ? { inc: takeHome() } : {} }),
  debtpay,
  debtplan,
  creditcard,
  loanafford,
}

/** Tools that start from another tool's figures. */
const SAME_AS: Record<string, string> = {
  ratechange: 'repayment',
  fees: 'lumpsum',
  riskreturn: 'lumpsum',
  realreturn: 'lumpsum',
}

export function prefill(plan: ToolPlan, toolId: string): Required<Fill> {
  const known = knownFigures(plan)
  const fill = FILLS[SAME_AS[toolId] ?? toolId]?.(known)
  return {
    values: {
      ...(known.age >= 18 && { age: known.age }),
      ...fill?.values,
      ...plan.statementFigures,
    },
    workedOut: fill?.workedOut ?? {},
  }
}
