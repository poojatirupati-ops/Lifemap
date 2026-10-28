import { LAW_TEXT } from '../../domain/planning/rates.ts'
import { euro } from '../../lib/format.ts'
import { mortgageRepayment, repayment, stampDuty } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { years } from './words.ts'
import { STAMP_NOTE, homeGoal, fees, rate, priceFor } from './home.shared.ts'

export const borrow: Calculator = {
  id: 'borrow',
  inputs: [
    input('inc', 'Your gross yearly income', 60000, 15000, 250000, 1000, '€'),
    input('inc2', "Partner's gross yearly income", 0, 0, 250000, 1000, '€'),
    input('dep', 'Deposit saved', 25000, 0, 200000, 1000, '€'),
    input('ftb', 'First-time buyer?', 1, 0, 1, 1, 'yn'),
    rate('Interest rate', 3.75),
    input('term', 'Mortgage term (years to repay)', 30, 10, 35, 1, 'y'),
  ],
  whatIfs: [input('xdep', 'Save extra towards deposit', 0, 0, 50000, 1000, '€')],
  run(v, context) {
    const { home } = context.rules
    const bands = home.stamp.slice(0, 3).map(([upTo, r], i) => [i === 2 ? 1e15 : upTo, r]) as [
      number,
      number,
    ][]
    const depositShare = 1 - home.ltv
    const multiple = v.ftb ? home.ltiFTB : home.ltiSSB
    const buyingFees = fees(context)
    const deposit = v.dep + (v.xdep || 0)
    const byIncome = (v.inc + v.inc2) * multiple
    const cash = Math.max(0, deposit - buyingFees)
    const priceByDeposit = priceFor(cash, depositShare, bands)
    const priceByIncome = priceFor(byIncome + cash, 1, bands)
    const price = Math.min(priceByDeposit, priceByIncome)
    const loan = Math.min(byIncome, home.ltv * price)
    const duty = stampDuty(context.rules, price)
    const monthly = mortgageRepayment(loan, v.rate, v.term)
    const limit = priceByDeposit < priceByIncome ? 'Your deposit' : 'Your income'
    const goalAmount = Math.round(price * depositShare + duty + buyingFees)
    const buyer = v.ftb ? 'first-time' : 'second and subsequent'
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
