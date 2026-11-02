import { euro, percent } from '../../lib/format.ts'
import { clamp } from '../../lib/clamp.ts'
import { balanceAfter, repayment, stampDuty } from './maths.ts'
import type { Calculator } from './types.ts'
import { years } from './words.ts'
import { STAMP_NOTE, homeGoal, fees, risingTotal } from './home.shared.ts'

export const rentBuy: Calculator = {
  id: 'rentbuy',
  inputs: [
    { key: 'rent', label: 'Monthly rent', example: 1800, min: 500, max: 5000, step: 50, unit: '€' },
    {
      key: 'price',
      label: 'Home price',
      example: 350000,
      min: 100000,
      max: 1000000,
      step: 5000,
      unit: '€',
    },
    { key: 'dep', label: 'Deposit', example: 35000, min: 0, max: 300000, step: 1000, unit: '€' },
    { key: 'rate', label: 'Mortgage rate', example: 3.75, min: 1, max: 8, step: 0.05, unit: '%' },
    { key: 'term', label: 'Mortgage term', example: 30, min: 5, max: 35, step: 1, unit: 'y' },
    { key: 'y', label: 'Years to compare', example: 10, min: 1, max: 30, step: 1, unit: 'y' },
    {
      key: 'g',
      label: 'House prices rise a year',
      example: 2,
      min: 0,
      max: 6,
      step: 0.5,
      unit: '%',
    },
  ],
  run(figures, context) {
    const {
      rent,
      price,
      dep: wantedDeposit,
      rate: ratePercent,
      term,
      y: compareYears,
      g: growthPercent,
    } = figures
    const minimumDeposit = price * (1 - context.rules.home.ltv)
    const dep = clamp(wantedDeposit, minimumDeposit, price)
    const loan = Math.max(0, price - dep)
    const monthlyRate = ratePercent / 1200
    const monthly = repayment(loan, monthlyRate, term * 12)
    const months = Math.min(compareYears, term) * 12
    const balance = Math.max(0, balanceAfter(loan, monthlyRate, monthly, months))
    const interest = monthly * months - (loan - balance)
    const growth = growthPercent / 100
    const rentRise = Number(context.assumption('rentRise'))
    const buyingFees = fees(context)
    const rentPaid = risingTotal(rent * 12, rentRise, compareYears)
    const upkeep = risingTotal(price * Number(context.assumption('upkeep')), growth, compareYears)
    const duty = stampDuty(context.rules, price)
    const lostEarnings = dep * ((1 + Number(context.assumption('depEarn'))) ** compareYears - 1)
    const costs = interest + upkeep + duty + buyingFees + lostEarnings
    const value = price * (1 + growth) ** compareYears
    const equity = value - balance
    const depositNote =
      wantedDeposit < minimumDeposit
        ? ` The deposit must be at least 10% of the price, so ${euro(dep)} is used.`
        : wantedDeposit > price
          ? ` The deposit can't be more than the price, so ${euro(dep)} is used.`
          : ''
    const goalAmount = Math.round(dep + duty + buyingFees)
    return {
      label: `Home equity after ${years(compareYears)}`,
      value: euro(equity),
      line: `Illustration only: renting costs about ${euro(rentPaid)} over ${years(compareYears)} (rent rising ${percent(rentRise)} a year), while the costs of buying that don't build equity are about ${euro(costs)}: interest, upkeep, stamp duty, fees and what your deposit could have earned. Local Property Tax and insurance are not included.${depositNote} Home equity is before selling costs. ${STAMP_NOTE}`,
      rows: [
        ['Rent paid (rising each year)', euro(rentPaid)],
        ["Buying costs that don't build equity", euro(costs)],
        ['Home value', euro(value)],
        ['Mortgage left after the years', euro(balance)],
      ],
      goal: homeGoal(goalAmount),
      numbers: {
        Home_Equity: equity,
        Rent_Paid: rentPaid,
        Buying_Costs: costs,
        Home_Value: value,
        Loan: loan,
        Monthly_Repayment: monthly,
        Balance_After: balance,
        Interest_Paid: interest,
        Upkeep: upkeep,
        Stamp_Duty: duty,
        Opportunity_Cost: lostEarnings,
        Plan_Goal_Amount: goalAmount,
      },
    }
  },
}
