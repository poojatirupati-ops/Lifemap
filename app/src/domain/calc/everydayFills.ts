// What the everyday money, saving, investing and protection tools start from.
import { toNumber } from '../../lib/format.ts'
import { workedOutNote } from '../../components/finance/checkList.ts'
import { coverHeld } from './coverHeld.ts'
import type { Fill, Known, Values } from './known.ts'
import { monthlyFromYearly, payoff } from './maths.ts'

function emergency({ has, figures }: Known): Values {
  const debtPayment = figures.debt > 0 ? figures.monthlyDebtPayment : 0
  return {
    ...(has('costsM') && { e: figures.monthlyCosts + figures.monthlyMortgage + debtPayment }),
    ...(has('cash') && { s: figures.cash }),
  }
}

/** The debt that takes longest to clear. */
function debtpay({ figures, plan }: Known): Fill {
  if (figures.debt <= 0) return { values: {} }
  const monthsToClear = (balance: number, pay: number, rate: number) =>
    balance > 0 ? payoff(balance, pay, monthlyFromYearly(rate * 100)).months : 0
  const card =
    monthsToClear(figures.cardBalance, figures.monthlyCardPayment, figures.cardRate) >=
    monthsToClear(figures.loanBalance, figures.monthlyLoanPayment, figures.loanRate)
  const debt = card
    ? {
        payKey: 'cardPayM',
        estimated: figures.cardPaymentEstimated,
        b: figures.cardBalance,
        p: figures.monthlyCardPayment,
        apr: figures.cardRateKnown ? figures.cardRate * 100 : undefined,
      }
    : {
        payKey: 'loanPayM',
        estimated: figures.loanPaymentEstimated,
        b: figures.loanBalance,
        p: figures.monthlyLoanPayment,
        apr: figures.loanRateKnown ? figures.loanRate * 100 : undefined,
      }
  return {
    values: { b: debt.b, p: debt.p, apr: debt.apr },
    workedOut: debt.estimated ? { p: workedOutNote(debt.payKey, plan) } : {},
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

export const EVERYDAY_FILLS: Record<string, (known: Known) => Fill> = {
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
}
