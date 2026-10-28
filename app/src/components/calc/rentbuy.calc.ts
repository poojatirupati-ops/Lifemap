import { euro, percent } from '../../lib/format.ts'
import { balanceAfter, clamp, repayment, stampDuty } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { years } from './words.ts'
import { STAMP_NOTE, homeGoal, fees, rate, risingTotal } from './home.shared.ts'

export const rentBuy: Calculator = {
  id: 'rentbuy',
  inputs: [
    input('rent', 'Monthly rent', 1800, 500, 5000, 50, '€'),
    input('price', 'Home price', 350000, 100000, 1000000, 5000, '€'),
    input('dep', 'Deposit', 35000, 0, 300000, 1000, '€'),
    input('rate', 'Mortgage rate', 3.75, 1, 8, 0.05, '%'),
    input('term', 'Mortgage term', 30, 5, 35, 1, 'y'),
    input('y', 'Years to compare', 10, 1, 30, 1, 'y'),
    input('g', 'House prices rise a year', 2, 0, 6, 0.5, '%'),
  ],
  run(v, context) {
    const minimumDeposit = v.price * (1 - context.rules.home.ltv)
    const dep = clamp(v.dep, minimumDeposit, v.price)
    const loan = Math.max(0, v.price - dep)
    const monthlyRate = v.rate / 1200
    const monthly = repayment(loan, monthlyRate, v.term * 12)
    const months = Math.min(v.y, v.term) * 12
    const balance = Math.max(0, balanceAfter(loan, monthlyRate, monthly, months))
    const interest = monthly * months - (loan - balance)
    const growth = v.g / 100
    const rentRise = Number(context.assumption('rentRise'))
    const buyingFees = fees(context)
    const rentPaid = risingTotal(v.rent * 12, rentRise, v.y)
    const upkeep = risingTotal(v.price * Number(context.assumption('upkeep')), growth, v.y)
    const duty = stampDuty(context.rules, v.price)
    const lostEarnings = dep * ((1 + Number(context.assumption('depEarn'))) ** v.y - 1)
    const costs = interest + upkeep + duty + buyingFees + lostEarnings
    const value = v.price * (1 + growth) ** v.y
    const equity = value - balance
    const depositNote =
      v.dep < minimumDeposit
        ? ` The deposit must be at least 10% of the price, so ${euro(dep)} is used.`
        : v.dep > v.price
          ? ` The deposit can't be more than the price, so ${euro(dep)} is used.`
          : ''
    const goalAmount = Math.round(dep + duty + buyingFees)
    return {
      label: `Home equity after ${years(v.y)}`,
      value: euro(equity),
      line: `Illustration only: renting costs about ${euro(rentPaid)} over ${years(v.y)} (rent rising ${percent(rentRise)} a year), while the costs of buying that don't build equity are about ${euro(costs)}: interest, upkeep, stamp duty, fees and what your deposit could have earned. Local Property Tax and insurance are not included.${depositNote} Home equity is before selling costs. ${STAMP_NOTE}`,
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
