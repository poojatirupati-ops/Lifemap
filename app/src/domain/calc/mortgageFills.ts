// What the home and mortgage tools start from.
import type { Fill, Known } from './known.ts'

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

export const MORTGAGE_FILLS: Record<string, (known: Known) => Fill> = {
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
}
