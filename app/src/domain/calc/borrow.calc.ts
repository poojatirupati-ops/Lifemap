import { LAW_TEXT } from '../planning/rates.ts'
import { euro } from '../../lib/format.ts'
import { mortgageRepayment, stampDuty } from './maths.ts'
import type { Calculator } from './types.ts'
import { STAMP_NOTE, homeGoal, fees, rate, priceFor } from './home.shared.ts'

export const borrow: Calculator = {
  id: 'borrow',
  inputs: [
    {
      key: 'inc',
      label: 'Your gross yearly income',
      example: 60000,
      min: 15000,
      max: 250000,
      step: 1000,
      unit: '€',
    },
    {
      key: 'inc2',
      label: "Partner's gross yearly income",
      example: 0,
      min: 0,
      max: 250000,
      step: 1000,
      unit: '€',
    },
    {
      key: 'dep',
      label: 'Deposit saved',
      example: 25000,
      min: 0,
      max: 200000,
      step: 1000,
      unit: '€',
    },
    { key: 'ftb', label: 'First-time buyer?', example: 1, min: 0, max: 1, step: 1, unit: 'yn' },
    rate('Interest rate', 3.75),
    {
      key: 'term',
      label: 'Mortgage term (years to repay)',
      example: 30,
      min: 10,
      max: 35,
      step: 1,
      unit: 'y',
    },
  ],
  whatIfs: [
    {
      key: 'xdep',
      label: 'Save extra towards deposit',
      example: 0,
      min: 0,
      max: 50000,
      step: 1000,
      unit: '€',
    },
  ],
  run(figures, context) {
    const {
      inc: income,
      inc2: partnerIncome,
      dep: savedDeposit,
      xdep: extraDeposit = 0,
      ftb: firstTimeBuyer,
      rate: ratePercent,
      term,
    } = figures
    const { home } = context.rules
    const bands = home.stamp.slice(0, 3).map(([upTo, r], i) => [i === 2 ? 1e15 : upTo, r]) as [
      number,
      number,
    ][]
    const depositShare = 1 - home.ltv
    const multiple = firstTimeBuyer ? home.ltiFTB : home.ltiSSB
    const buyingFees = fees(context)
    const deposit = savedDeposit + extraDeposit
    const byIncome = (income + partnerIncome) * multiple
    const cash = Math.max(0, deposit - buyingFees)
    const priceByDeposit = priceFor(cash, depositShare, bands)
    const priceByIncome = priceFor(byIncome + cash, 1, bands)
    const price = Math.min(priceByDeposit, priceByIncome)
    const loan = Math.min(byIncome, home.ltv * price)
    const duty = stampDuty(context.rules, price)
    const monthly = mortgageRepayment(loan, ratePercent, term)
    const limit = priceByDeposit < priceByIncome ? 'Your deposit' : 'Your income'
    const goalAmount = Math.round(price * depositShare + duty + buyingFees)
    const buyer = firstTimeBuyer ? 'first-time' : 'second and subsequent'
    return {
      label: 'Homes up to about',
      value: euro(price),
      line: `Central Bank rules: up to ${multiple}× income for ${buyer} buyers, and at least a 10% deposit (90% loan-to-value). Your deposit also pays the stamp duty (${LAW_TEXT.stampDuty}) and buying fees (${euro(buyingFees)}, your assumption). ${STAMP_NOTE} Here ${limit.toLowerCase()} sets the amount. Lenders can lend above these limits for a small share of loans each year, so some buyers get an exception. Your lender decides.`,
      rows: [
        ['Most you could borrow', euro(loan)],
        [`Borrowing allowed by income (${multiple}×)`, euro(byIncome)],
        ['Stamp duty on that price (paid from your deposit)', euro(duty)],
        ['Your deposit', euro(deposit)],
        ['Monthly repayment (illustrative)', euro(monthly)],
      ],
      goal: homeGoal(goalAmount, deposit),
      numbers: {
        Home_Price: price,
        Max_Loan: loan,
        Monthly_Repayment: monthly,
        Borrow_By_Income: byIncome,
        Stamp_Duty: duty,
        Price_By_Deposit: priceByDeposit,
        Price_By_Income: priceByIncome,
        Income_Multiple: multiple,
        Total_Deposit: deposit,
        Limit_Set_By: limit,
        Plan_Goal_Amount: goalAmount,
        Plan_Goal_Saved: deposit,
      },
    }
  },
}
