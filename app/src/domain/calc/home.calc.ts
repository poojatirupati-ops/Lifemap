// Home & Mortgage: borrowing, repayments, deposit, overpaying, rate and term changes, rent vs buy,
// and mortgage protection.
import { LAW_TEXT } from '../planning/rates.ts'
import { euro, percent } from '../../lib/format.ts'
import { clamp } from '../../lib/clamp.ts'
import {
  balanceAfter,
  monthsToRepay,
  mortgageRepayment,
  repayment,
  stampDuty,
  totalInterest,
} from './maths.ts'
import type { CalcContext, Calculator } from './types.ts'
import { repaidIn, signed, years, yearsAndMonths } from './words.ts'

const HOME_GOAL_YEARS = 3
const STAMP_NOTE =
  'Stamp duty is worked out on the price shown; for a new home it is charged on the price excluding VAT, and Help to Buy is not included.'
const NOT_COVERED = "Your repayment doesn't cover the interest: please check the figures."
const BALANCE_YEARS = [5, 10, 15]

const homeGoal = (amount: number, saved?: number) => ({
  kind: 'spend',
  goalKind: 'home',
  name: 'Buy a home (deposit goal)',
  emoji: '🏡',
  amount,
  ...(saved != null && { saved }),
  years: HOME_GOAL_YEARS,
})
const buyingFeesOf = (context: CalcContext) => Number(context.assumption('buyFees'))

/** The customer's stated repayment, while the tool still shows their own mortgage figures. */
const statedPayment = (context: CalcContext, keys: string[]) =>
  context.untouched(keys) ? context.statedMortgagePayment : null

/** Price where the cash pays the deposit share and stamp duty, band by band (solved exactly). */
function priceFor(cash: number, share: number, bands: [number, number][]) {
  let from = 0
  let paid = 0
  for (const [upTo, stamp] of bands) {
    const bandCost = (share + stamp) * (Math.min(upTo, 1e15) - from)
    if (cash <= paid + bandCost || upTo >= 1e15) return from + (cash - paid) / (share + stamp)
    paid += bandCost
    from = upTo
  }
  return from
}

/** A yearly amount rising each year, added up over the years. */
const risingTotal = (yearly: number, rise: number, count: number) =>
  rise === 0 ? yearly * count : (yearly * ((1 + rise) ** count - 1)) / rise

export const HOME: Record<string, Calculator['run']> = {
  borrow(figures, context) {
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
    const bands = home.stamp
      .slice(0, 3)
      .map(([upTo, r], i): [number, number] => [i === 2 ? 1e15 : upTo, r])
    const depositShare = 1 - home.ltv
    const multiple = firstTimeBuyer ? home.ltiFTB : home.ltiSSB
    const buyingFees = buyingFeesOf(context)
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

  repayment(figures, context) {
    const { loan, rate: ratePercent, term, dr: rateChange = 0 } = figures
    const monthlyRate = ratePercent / 100 / 12
    const formula = repayment(loan, monthlyRate, term * 12)
    const stated = statedPayment(context, ['loan', 'rate', 'term'])
    const base = stated?.amount || formula
    const newRate = Math.max(0, ratePercent + rateChange)
    const changed = base + repayment(loan, newRate / 1200, term * 12) - formula
    const months = monthsToRepay(loan, monthlyRate, base)
    const interest = months === Infinity ? null : totalInterest(loan, monthlyRate, base, months)
    const goalAmount = Math.round((loan * (1 - context.rules.home.ltv)) / context.rules.home.ltv)
    const numbers = {
      Monthly_Repayment: base,
      Formula_Repayment: formula,
      Months_To_Pay: months === Infinity ? 'Never' : months,
      Total_Interest: interest ?? '—',
      Total_Repaid: interest == null ? '—' : loan + interest,
      New_Rate: newRate / 100,
      Repayment_If_Changed: changed,
      Change_Per_Year: (changed - base) * 12,
      Plan_Goal_Amount: goalAmount,
    }
    const goal = homeGoal(goalAmount)
    if (rateChange) {
      const now = stated ? `the ${euro(stated.amount)} on ${stated.from}` : 'now'
      const approx = stated
        ? 'With a stated repayment this is an approximation: it moves by the same amount as the standard formula would.'
        : ''
      return {
        label: `If your rate changed to ${newRate.toFixed(2)}%`,
        value: euro(changed),
        line: `What-if: your repayment would be about ${euro(changed)} a month, ${euro(Math.abs(changed - base))}${changed >= base ? ' more' : ' less'} than ${now}. ${approx}`,
        rows: [
          ['Repayment now', euro(base)],
          ['Change over a year', signed((changed - base) * 12)],
        ],
        goal,
        numbers,
      }
    }
    const lenderNote =
      stated && Math.abs(stated.amount - formula) >= 5
        ? ` The standard formula on these figures gives about ${euro(formula)}; we use your lender's figure.`
        : ''
    return {
      label: stated ? 'Your monthly repayment' : 'Monthly repayment',
      value: euro(base),
      line: stated
        ? `From ${stated.from}.${lenderNote}`
        : `Over ${years(term)} at ${ratePercent.toFixed(2)}%, using the standard repayment formula. The rate is a yearly rate, compounded monthly (the way lenders quote mortgage rates).`,
      rows: [
        ['Mortgage free in', repaidIn(months)],
        ['Total interest', interest == null ? '—' : euro(interest)],
        ['Total repaid', interest == null ? '—' : euro(loan + interest)],
      ],
      goal,
      numbers,
    }
  },

  deposit(figures, context) {
    const { price, pc: depositPercent, saved, mo: monthlySaving, xmo: extraSaving = 0 } = figures
    const share = (price * depositPercent) / 100
    const duty = stampDuty(context.rules, price)
    const buyingFees = buyingFeesOf(context)
    const need = share + duty + buyingFees
    const left = Math.max(0, need - saved)
    const monthly = monthlySaving + extraSaving
    const months = left === 0 ? 0 : Math.ceil(left / monthly)
    const goalYears = Math.max(1, Math.ceil(months / 12))
    const closing = left
      ? `Saving ${euro(monthly)} a month closes the gap (no interest and no house-price rises assumed). `
      : ''
    return {
      label: 'Time to your deposit',
      value: left ? yearsAndMonths(months) : 'You have your deposit',
      line: `You need ${euro(need)} (deposit ${euro(share)}, stamp duty ${euro(duty)} and fees ${euro(buyingFees)}) and have ${euro(saved)}. ${closing}The Central Bank minimum deposit is 10%. ${STAMP_NOTE}`,
      rows: [
        ['Total you need', euro(need)],
        ['Deposit', euro(share)],
        ['Stamp duty', euro(duty)],
        ['Still to save', euro(left)],
      ],
      goal: {
        kind: 'spend',
        goalKind: 'home',
        name: 'Home deposit',
        emoji: '🔑',
        amount: Math.round(need),
        saved,
        years: goalYears,
      },
      numbers: {
        Months_To_Deposit: months,
        Total_Needed: need,
        Deposit_Needed: share,
        Stamp_Duty: duty,
        Still_To_Save: left,
        Plan_Goal_Amount: Math.round(need),
        Plan_Goal_Saved: saved,
        Plan_Goal_Years: goalYears,
      },
    }
  },

  overpay(figures, context) {
    const { bal: balance, rate: ratePercent, yrs: yearsLeft, x: extra } = figures
    const monthlyRate = ratePercent / 1200
    const stated = statedPayment(context, ['bal', 'rate', 'yrs'])
    const payment = stated?.amount || repayment(balance, monthlyRate, yearsLeft * 12)
    const now = monthsToRepay(balance, monthlyRate, payment)
    const withExtra = monthsToRepay(balance, monthlyRate, payment + extra)
    const both = now !== Infinity && withExtra !== Infinity
    const interest = (months: number, pay: number) =>
      months === Infinity ? null : totalInterest(balance, monthlyRate, pay, months)
    const interestNow = interest(now, payment)
    const interestWithExtra = interest(withExtra, payment + extra)
    const saved = both ? interestNow! - interestWithExtra! : null
    const sooner = both ? now - withExtra : null
    const from = stated ? ` (from ${stated.from})` : ''
    return {
      label: 'Mortgage free sooner by',
      value: !both ? '—' : sooner === 0 ? 'No change' : repaidIn(sooner!),
      line:
        now === Infinity
          ? `Your repayment of ${euro(payment)} doesn't clear the mortgage: not at this repayment.`
          : `Paying ${euro(extra)} extra a month on top of ${euro(payment)}${from} could save about ${saved == null ? '—' : euro(saved)} in interest (illustrative; check your lender's overpayment terms).`,
      rows: [
        ['Mortgage free now in', repaidIn(now, 'Not at this repayment')],
        ['With the extra', repaidIn(withExtra, '—')],
        ['Interest saved', saved == null ? '—' : euro(saved)],
      ],
      goal:
        withExtra === Infinity
          ? null
          : { kind: 'mfree', name: 'Mortgage free', emoji: '🔑', years: Math.ceil(withExtra / 12) },
      numbers: {
        Months_Now: now === Infinity ? 'Never' : now,
        Months_With_Extra: withExtra === Infinity ? 'Never' : withExtra,
        Months_Sooner: sooner ?? '—',
        Interest_Saved: saved ?? '—',
        Interest_Now: interestNow ?? '—',
        Interest_With_Extra: interestWithExtra ?? '—',
        Repayment_Now: payment,
        Plan_Goal_Years: withExtra === Infinity ? '—' : Math.ceil(withExtra / 12),
      },
    }
  },

  ratechange(figures, context) {
    const { loan, rate: ratePercent, term, d: rateChange } = figures
    const formula = mortgageRepayment(loan, ratePercent, term)
    const stated = statedPayment(context, ['loan', 'rate', 'term'])
    const now = stated?.amount || formula
    const newRate = Math.max(0, ratePercent + rateChange)
    const after = now + repayment(loan, newRate / 1200, term * 12) - formula
    const from = stated ? ` (from ${stated.from})` : ''
    return {
      label: 'Monthly change',
      value: signed(after - now),
      line: `What-if: if your rate changed to ${newRate.toFixed(2)}%, your repayment would be about ${euro(after)} a month instead of ${euro(now)}${from}.`,
      rows: [
        ['Now', euro(now)],
        ['After change', euro(after)],
        ['Change over a year', signed((after - now) * 12)],
      ],
      goal: null,
      numbers: {
        Monthly_Change: after - now,
        Repayment_Now: now,
        Repayment_After: after,
        Yearly_Change: (after - now) * 12,
        New_Rate: newRate / 100,
        Formula_Now: formula,
      },
    }
  },

  term({ loan, rate: r, a, b }) {
    const monthlyA = mortgageRepayment(loan, r, a)
    const monthlyB = mortgageRepayment(loan, r, b)
    const interestA = monthlyA * a * 12 - loan
    const interestB = monthlyB * b * 12 - loan
    return {
      label: 'Interest difference',
      value: euro(Math.abs(interestB - interestA)),
      line:
        a === b
          ? 'Both terms are the same.'
          : `The ${Math.min(a, b)}-year term costs more each month but less interest overall.`,
      rows: [
        [`${a}-year monthly`, euro(monthlyA)],
        [`${b}-year monthly`, euro(monthlyB)],
        [`${a}-year total interest`, euro(interestA)],
        [`${b}-year total interest`, euro(interestB)],
      ],
      goal: null,
      numbers: {
        Interest_Difference: Math.abs(interestB - interestA),
        Monthly_A: monthlyA,
        Monthly_B: monthlyB,
        Interest_A: interestA,
        Interest_B: interestB,
      },
    }
  },

  rentbuy(figures, context) {
    const { rent, price, dep: wantedDeposit, rate: ratePercent, term } = figures
    const { y: compareYears, g: growthPercent } = figures
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
    const buyingFees = buyingFeesOf(context)
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

  mortgageprotect(figures, context) {
    const { bal: balance, rate: ratePercent, y: yearsLeft } = figures
    const monthlyRate = ratePercent / 1200
    const stated = statedPayment(context, ['bal', 'rate', 'y'])
    const payment = stated?.amount || repayment(balance, monthlyRate, yearsLeft * 12)
    const notCovered = payment <= balance * monthlyRate
    const balances = BALANCE_YEARS.map((after) =>
      notCovered ? '—' : Math.max(0, balanceAfter(balance, monthlyRate, payment, after * 12)),
    )
    return {
      label: 'Cover needed today',
      value: euro(balance),
      line: notCovered
        ? NOT_COVERED
        : `Mortgage protection usually reduces as your mortgage does. Illustrative balance over time, repaying ${euro(payment)} a month:`,
      rows: balances.map((left, i) => [
        `In ${BALANCE_YEARS[i]} years`,
        typeof left === 'number' ? euro(left) : left,
      ]),
      goal: null,
      numbers: {
        Cover_Today: balance,
        Warning: notCovered ? NOT_COVERED : '',
        Balance_Year_1: balances[0],
        Balance_Year_2: balances[1],
        Balance_Year_3: balances[2],
        Repayment: payment,
      },
    }
  },
}
