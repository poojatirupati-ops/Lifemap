// Loan maths: repayments, other mortgages and the customer's cards and loans.
import { toNumber } from '../../lib/format'
import type { ListItem } from '../../state/types'
import { assumption, isChosen, type AssumptionInputs } from './assumptions'

// APR is an effective annual rate; mortgages use the nominal rate / 12 instead
export const monthlyRateFromApr = (apr: number) => (1 + apr) ** (1 / 12) - 1

export function monthlyRepayment(balance: number, monthlyRate: number, months: number) {
  if (balance <= 0) return 0
  if (!monthlyRate) return balance / months
  return (balance * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
}

export const mortgageRepayment = (balance: number, rate: number, years: number) =>
  monthlyRepayment(balance, rate / 12, Math.max(1, Math.round(years * 12)))

// twelve monthly repayments; monthlyRate defaults to rate / 12
export function repayForYear(
  balance: number,
  rate: number,
  payment: number,
  monthlyRate = rate / 12,
) {
  let paid = 0
  for (let month = 0; month < 12 && balance > 0.5; month++) {
    const interest = balance * monthlyRate
    const thisMonth = Math.min(payment, balance + interest)
    paid += thisMonth
    balance = balance + interest - thisMonth
  }
  return { balance: Math.max(0, balance), paid }
}

// a percentage the customer typed, else the assumption
export const statedRate = (inputs: DebtInputs, key: RateKey) =>
  positive(inputs.fin[key]) > 0 ? positive(inputs.fin[key]) / 100 : assumption(inputs, key)

const positive = (value: unknown) => Math.max(0, toNumber(value))

export const sum = <T>(items: T[], amount: (item: T, index: number) => number) =>
  items.reduce((total, item, index) => total + amount(item, index), 0)

// Mortgages on other properties count as other loans: total balance, repayment and a balance-weighted rate.
export function otherMortgages(items: ListItem[], fallbackRate: number) {
  const mortgages = items.map((item) => item.f).filter((mortgage) => positive(mortgage.owed) > 0)
  const rateOf = (mortgage: ListItem['f']) => positive(mortgage.rate) / 100 || fallbackRate
  // no term and no repayment: 25 years assumed
  const repaymentOf = (mortgage: ListItem['f']) =>
    positive(mortgage.pay) ||
    mortgageRepayment(positive(mortgage.owed), rateOf(mortgage), positive(mortgage.years) || 25)
  const balance = sum(mortgages, (mortgage) => positive(mortgage.owed))
  const weightedRate = sum(mortgages, (mortgage) => positive(mortgage.owed) * rateOf(mortgage))
  return {
    balance,
    repayment: sum(mortgages, repaymentOf),
    rate: balance > 0 ? weightedRate / balance : 0,
    count: mortgages.length,
  }
}

/** The home mortgage; no term given means 25 years. */
export function homeMortgage(
  fin: { home?: string; mortBal?: Figure; mortYears?: Figure; mortPayM?: Figure },
  rate: number,
) {
  const hasMortgage = fin.home === 'Own with mortgage'
  const balance = toNumber(fin.mortBal)
  const years = toNumber(fin.mortYears)
  const stated = hasMortgage ? toNumber(fin.mortPayM) : 0
  const required = mortgageRepayment(balance, rate, years || 25)
  return {
    balance: hasMortgage ? balance : 0,
    monthly: hasMortgage ? stated || required : 0,
    estimated: hasMortgage && !stated,
    termKnown: years > 0,
    paymentLow: stated > 0 && balance > 0 && years > 0 && stated < required - 1,
    years: hasMortgage ? years : 0,
  }
}

// own loans and other mortgages, weighted by balance
function blendedLoanRate(
  ownLoans: number,
  ownRate: number,
  others: { balance: number; rate: number },
) {
  if (others.balance <= 0) return ownRate
  if (ownLoans <= 0) return others.rate
  return (ownLoans * ownRate + others.balance * others.rate) / (ownLoans + others.balance)
}

type RateKey = 'cardRate' | 'loanRate' | 'mortRate'
export type Figure = number | string | null | undefined

/** The cards and loans the customer typed in. */
export type DebtFinances = AssumptionInputs['fin'] & {
  [key in 'loanBal' | 'debt' | 'loanPayM' | 'debtPayM' | 'cardBal' | 'cardPayM' | RateKey]?: Figure
}

export interface DebtInputs extends AssumptionInputs {
  fin: DebtFinances
  lists?: { mort2?: ListItem[] }
}

const coversInterest = (balance: number, pay: number, apr: number) =>
  balance > 0 && pay > balance * monthlyRateFromApr(apr)

// A stated repayment is used if it more than covers the interest, else a 5-year repayment.
function debtRepayment(balance: number, stated: number, apr: number) {
  if (balance <= 0) return { monthly: 0, estimated: false }
  const estimated = !coversInterest(balance, stated, apr)
  const monthly = estimated ? monthlyRepayment(balance, monthlyRateFromApr(apr), 60) : stated
  return { monthly, estimated }
}

// Cards and loans amortise separately at their APR.
export function debts(inputs: DebtInputs) {
  const { fin, asm } = inputs
  const mortgages = otherMortgages(inputs.lists?.mort2 ?? [], assumption(inputs, 'mortRate'))
  const ownLoans = toNumber(fin.loanBal) + toNumber(fin.debt)
  const cardRate = statedRate(inputs, 'cardRate')
  const loanRate = blendedLoanRate(ownLoans, statedRate(inputs, 'loanRate'), mortgages)
  const cardBal = toNumber(fin.cardBal)
  const loanBal = ownLoans + mortgages.balance
  const statedLoanPay = toNumber(fin.loanPayM) + toNumber(fin.debtPayM) + mortgages.repayment
  const card = debtRepayment(cardBal, toNumber(fin.cardPayM), cardRate)
  const loan = debtRepayment(loanBal, statedLoanPay, loanRate)
  return {
    cardRateKnown: toNumber(fin.cardRate) > 0 || isChosen(asm, 'cardRate'),
    loanRateKnown: toNumber(fin.loanRate) > 0 || isChosen(asm, 'loanRate'),
    cardBalance: cardBal,
    cardRate,
    monthlyCardPayment: card.monthly,
    cardPaymentEstimated: card.estimated,
    loanBalance: loanBal,
    loanRate,
    monthlyLoanPayment: loan.monthly,
    loanPaymentEstimated: loan.estimated,
    debt: cardBal + loanBal,
    monthlyDebtPayment: card.monthly + loan.monthly,
    debtPaymentEstimated: card.estimated || loan.estimated,
  }
}
