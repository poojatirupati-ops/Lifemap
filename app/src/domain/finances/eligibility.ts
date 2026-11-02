// The mortgage eligibility quiz: four questions, then a rough borrowing estimate.
import { rules2026 } from '../planning/rates.ts'

export interface EligibilityQuestion {
  question: string
  options: { icon: string; label: string; amount?: number }[]
}

export const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  {
    question: 'Are you buying on your own?',
    options: [
      { icon: '🙋', label: 'Just me' },
      { icon: '👫', label: 'With a partner' },
    ],
  },
  {
    question: 'Is this your first home?',
    options: [
      { icon: '🔑', label: 'Yes, my first home' },
      { icon: '🏠', label: "No, I've owned before" },
    ],
  },
  {
    question: 'Yearly income before tax (both of you, if joint)',
    options: [
      { icon: '💶', label: 'Under €50,000', amount: 40000 },
      { icon: '💶', label: '€50,000 to €80,000', amount: 65000 },
      { icon: '💶', label: '€80,000 to €120,000', amount: 100000 },
      { icon: '💶', label: 'Over €120,000', amount: 140000 },
    ],
  },
  {
    question: 'How much have you saved for a deposit?',
    options: [
      { icon: '🐷', label: 'Under €20,000', amount: 15000 },
      { icon: '🐷', label: '€20,000 to €40,000', amount: 30000 },
      { icon: '🐷', label: '€40,000 to €70,000', amount: 55000 },
      { icon: '🐷', label: 'Over €70,000', amount: 85000 },
    ],
  },
]

export interface Estimate {
  borrow: number
  price: number
  deposit: number
  firstHome: boolean
  incomeMultiple: number
  /** the smallest deposit lenders accept, as a share of the price */
  depositShare: number
  limitedBy: 'income' | 'deposit'
}

const amountOf = (question: number, answer: number) =>
  ELIGIBILITY_QUESTIONS[question].options[answer].amount ?? 0

/** Central Bank lending limits: income times a multiple, and a minimum deposit share. */
export function estimate(answers: number[], { home } = rules2026): Estimate {
  const firstHome = answers[1] === 0
  const income = amountOf(2, answers[2])
  const deposit = amountOf(3, answers[3])
  const incomeMultiple = firstHome ? home.ltiFTB : home.ltiSSB
  const loanToValue = firstHome ? home.ltv : Math.min(home.ltv, 0.8)
  const byIncome = income * incomeMultiple + deposit
  const byDeposit = deposit / (1 - loanToValue)
  const price = Math.min(byIncome, byDeposit)
  return {
    borrow: Math.max(0, price - deposit),
    price,
    deposit,
    firstHome,
    incomeMultiple,
    depositShare: 1 - loanToValue,
    limitedBy: byIncome <= byDeposit ? 'income' : 'deposit',
  }
}
