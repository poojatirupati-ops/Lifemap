// Loans: loan repayment, loan comparison, loan affordability, credit card repayment, debt repayment and
// the debt payoff plan. Monthly steps, interest on the opening balance, payment at the month's end.
import { euro, sum } from '../../lib/format.ts'
import {
  MAX_MONTHS,
  loanFromRepayment,
  monthlyFromYearly,
  monthsToRepay,
  repayment,
  totalInterest,
} from './maths.ts'
import type { CalcResult, Calculator } from './types.ts'
import { repaidIn, signed, years, yearsAndMonths } from './words.ts'

type Rows = CalcResult['rows']

const CLEARED = 0.005

/** A word of caution when any APR is above 30%. */
const highAprNote = (...aprs: number[]) =>
  Math.max(...aprs) > 30
    ? ' An APR above about 30% is unusual: check it on your statement or offer.'
    : ''

/** Paying only the card's minimum: the larger of the lowest amount and a share of the balance, never more than owed. */
function minimumOnly(balance: number, monthlyRate: number, share: number, lowest: number) {
  let months = 0
  let interest = 0
  while (balance > CLEARED && months < MAX_MONTHS) {
    const charged = balance * monthlyRate
    const paid = Math.min(balance + charged, Math.max(lowest, share * balance))
    interest += charged
    balance = balance + charged - paid
    months++
  }
  return balance > CLEARED ? { months: Infinity, interest: null } : { months, interest }
}

interface Debt {
  name: string
  balance: number
  apr: number
  monthlyRate: number
  minimum: number
}

type Order = 'highestRate' | 'smallestBalance' | 'minimumsOnly'

/**
 * Every debt gets its minimum first; the extra, and the repayments of cleared debts, go to the target debt
 * (highest rate, or smallest balance before this month's payment). Minimums only: no extra, nothing rolls on.
 */
function payOff(debts: Debt[], extra: number, order: Order) {
  const owed = debts
    .filter((debt) => debt.balance > CLEARED)
    .map((debt) => ({ ...debt, beforePayment: debt.balance }))
  const open = () => owed.filter((debt) => debt.balance > CLEARED)
  const pool = sum(owed, (debt) => debt.minimum) + (order === 'minimumsOnly' ? 0 : extra)
  let months = 0
  let interest = 0
  while (open().length && months < MAX_MONTHS) {
    months++
    for (const debt of open()) {
      const charged = debt.balance * debt.monthlyRate
      debt.balance += charged
      interest += charged
      debt.beforePayment = debt.balance
    }
    let budget = order === 'minimumsOnly' ? sum(open(), (debt) => debt.minimum) : pool
    for (const debt of open()) {
      const paid = Math.min(debt.balance, debt.minimum, budget)
      debt.balance -= paid
      budget -= paid
    }
    if (order === 'minimumsOnly') continue
    const targets = open().sort((a, b) =>
      order === 'highestRate' ? b.apr - a.apr : a.beforePayment - b.beforePayment,
    )
    for (const debt of targets) {
      const paid = Math.min(debt.balance, budget)
      debt.balance -= paid
      budget -= paid
    }
  }
  return open().length ? { months: Infinity, interest: null } : { months, interest }
}

const DEBT_NAMES = ['Credit card', 'Loan', 'Other debt']

export const LOANS: Record<string, Calculator['run']> = {
  loan({ a: amount, apr, y: term }) {
    const monthlyRate = monthlyFromYearly(apr)
    const monthly = repayment(amount, monthlyRate, term * 12)
    const total = monthly * term * 12
    return {
      label: 'Monthly repayment',
      value: euro(monthly),
      line: `Total interest of about ${euro(total - amount)} over ${years(term)}. The APR is treated as an effective yearly rate (as for cards and loans; mortgage tools use the nominal rate ÷ 12, so the same percentage gives a slightly different repayment).${highAprNote(apr)}`,
      rows: [
        ['Total repaid', euro(total)],
        ['Total interest', euro(total - amount)],
      ],
      goal: null,
      numbers: {
        Monthly_Repayment: monthly,
        Total_Repaid: total,
        Total_Interest: total - amount,
        Monthly_Rate: monthlyRate,
      },
    }
  },

  loancompare({ a: amount, apr1, y1, apr2, y2 }) {
    const offer = (apr: number, term: number) => {
      const months = term * 12
      const monthly = repayment(amount, monthlyFromYearly(apr), months)
      const total = monthly * months
      return { monthly, total, interest: total - amount }
    }
    const a = offer(apr1, y1)
    const b = offer(apr2, y2)
    const difference = a.interest - b.interest
    const monthlyDifference = a.monthly - b.monthly
    const same = Math.abs(difference) < 1
    const cheaper = difference > 0 ? 'B' : 'A'
    const lowerMonthly = monthlyDifference > 0 ? 'B' : 'A'
    const lessAMonth = `has the lower monthly repayment (${euro(Math.abs(monthlyDifference))} less a month)`
    const monthlySame = Math.abs(monthlyDifference) < 1
    const sameLine = `The two offers cost about the same in interest${monthlySame ? '. ' : `, but offer ${lowerMonthly} ${lessAMonth} because its term is longer or its rate lower. `}Check fees, insurance and early-repayment charges in each offer.`
    const longerCostsMore = monthlyDifference > 0 !== difference > 0
    const monthlyLine = monthlySame
      ? 'The monthly repayments are about the same.'
      : `Offer ${lowerMonthly} ${lessAMonth}${longerCostsMore ? ', but a longer term makes it cost more overall.' : '.'}`
    const cheaperLine = `Offer ${cheaper} costs about ${euro(Math.abs(difference))} less in interest over its term. ${monthlyLine} The APR is the yearly cost of the loan including its charges, so compare offers by APR and total interest, not by the monthly figure alone. Check each offer's fees, insurance and early-repayment charges.${highAprNote(apr1, apr2)}`
    return {
      label: 'Cheaper overall',
      value: same ? 'About the same' : `Offer ${cheaper}`,
      line: same ? sameLine : cheaperLine,
      rows: [
        ['Offer A: monthly repayment', euro(a.monthly)],
        ['Offer A: total interest', euro(a.interest)],
        ['Offer A: total repaid', euro(a.total)],
        ['Offer B: monthly repayment', euro(b.monthly)],
        ['Offer B: total interest', euro(b.interest)],
        ['Offer B: total repaid', euro(b.total)],
        ['Difference in interest (A minus B)', signed(difference)],
      ],
      goal: null,
      numbers: {
        Repayment_A: a.monthly,
        Interest_A: a.interest,
        Total_A: a.total,
        Repayment_B: b.monthly,
        Interest_B: b.interest,
        Total_B: b.total,
        Interest_Difference: difference,
        Monthly_Difference: monthlyDifference,
      },
    }
  },

  loanafford({ inc: income, ess: essentials, debt: repayments, sav: saving = 0, apr, y, share }) {
    const months = y * 12
    const spare = income - essentials - repayments - saving
    const used = (Math.max(0, spare) * share) / 100
    const loan = loanFromRepayment(used, monthlyFromYearly(apr), months)
    const total = used * months
    const ifRateUp = repayment(loan, monthlyFromYearly(apr + 3), months)
    const savingKept =
      saving > 0
        ? ' Your saving towards your goals is kept: the loan repayment comes out of what is left.'
        : ' No saving is taken off here: a loan repayment would reduce what you can save towards your goals. Enter what you save to keep it.'
    const affordable = [
      `Spare money is ${euro(spare)} a month after essentials, your repayments${saving > 0 ? ` and your saving of ${euro(saving)}` : ''}.`,
      ` Using ${share}% of it keeps ${100 - share}% as a buffer: a repayment of ${euro(used)} a month over ${years(y)}.`,
      share >= 100 ? ' Using all of it leaves no buffer.' : '',
      ifRateUp > spare
        ? ` If the rate were 3 points higher the repayment (${euro(ifRateUp)}) would be more than your spare money.`
        : '',
      savingKept,
      highAprNote(apr),
      " It is guidance, not a lender's decision or an offer.",
    ].join('')
    const none = spare <= 0
    return {
      label: 'A loan size your spare money supports',
      value: none ? 'Not affordable now' : euro(loan),
      line: none
        ? `After essential spending, your repayments${saving > 0 ? ' and your saving' : ''} there is no spare money each month, so a new loan would not be comfortable now.`
        : affordable,
      rows: [
        ...(saving > 0 ? ([['Your saving towards goals', euro(saving)]] satisfies Rows) : []),
        ['Spare money a month', euro(Math.max(0, spare))],
        ['Repayment you could use', euro(used)],
        ['Total interest on this loan', none ? '—' : euro(total - loan)],
        ['If the rate were 3 points higher', none ? '—' : `${euro(ifRateUp)} a month`],
      ],
      goal: null,
      numbers: {
        Spare_Money: Math.max(0, spare),
        Repayment_Used: used,
        Loan_Amount: loan,
        Total_Interest: total - loan,
        Repayment_If_Rate_Up: ifRateUp,
      },
    }
  },

  creditcard({ b: balance, apr, p: payment, mp: minimumShare, mf: minimumLowest, t: target }) {
    const monthlyRate = monthlyFromYearly(apr)
    const hasRule = minimumShare > 0 || minimumLowest > 0
    const minimum = hasRule
      ? minimumOnly(balance, monthlyRate, minimumShare / 100, minimumLowest)
      : null
    const months = monthsToRepay(balance, monthlyRate, payment)
    const never = months === Infinity
    const interest = never ? null : totalInterest(balance, monthlyRate, payment, months)
    const toClear = repayment(balance, monthlyRate, target)
    const saving =
      minimum?.interest != null && interest != null ? minimum.interest - interest : null
    const saved = saving != null && saving > 0 ? saving : null
    const thisMonth = balance * monthlyRate
    const firstMinimum = hasRule ? Math.max(minimumLowest, (minimumShare / 100) * balance) : 0
    const below = hasRule && payment < firstMinimum - 1e-9
    const minimumNever =
      minimum?.months === Infinity && firstMinimum <= thisMonth + 1e-9 ? 'Never' : 'Over 100 years'
    const minimumTime =
      minimum && minimum.months !== Infinity ? yearsAndMonths(minimum.months) : minimumNever
    const yours = never
      ? `Your payment of ${euro(payment)} does not cover the monthly interest (about ${euro(thisMonth)}): the balance would not fall. `
      : `Paying ${euro(payment)} a month clears it in ${yearsAndMonths(months)}${interest != null ? ` and costs about ${euro(interest)} in interest` : ''}. `
    const savedShown = saved != null && !below

    const minimumLine = !minimum
      ? ''
      : minimum.interest == null
        ? minimumNever === 'Never'
          ? "At your card's minimum the balance would never clear, because the minimum does not cover the monthly interest. "
          : "At your card's minimum the balance would take over 100 years to clear. "
        : `Paying only your card's minimum would cost about ${euro(minimum.interest)} in interest on ${euro(balance)}. `
    const withRule = [
      minimumLine,
      below ? '' : yours,
      savedShown ? `That saves about ${euro(saved)} in interest. ` : '',
      minimumShare > 0 && minimumLowest === 0
        ? 'No lowest amount is entered, so the minimum keeps shrinking with the balance and takes very long: most cards have a lowest amount, check yours. '
        : '',
    ].join('')
    const withoutRule = `${yours}Enter your card's minimum payment rule to see what paying only the minimum costs. It is on your statement or in your card terms, for example "3% of the balance or €6.35, whichever is greater". Irish cards differ, so use yours. `
    const belowLine = below
      ? `Your payment of ${euro(payment)} is below your card's minimum of about ${euro(firstMinimum)} this month: pay at least the minimum. `
      : ''

    return {
      label: hasRule ? 'Paying only the minimum' : 'Your payment clears it in',
      value: hasRule ? minimumTime : repaidIn(months, 'Not at this payment'),
      line: `${belowLine}${hasRule ? withRule : withoutRule}Assumes no new spending, fees or promotional rates.${highAprNote(apr)}`,
      rows: [
        ['Interest charged this month', euro(thisMonth)],
        ...(minimum
          ? ([
              ['Minimum only: debt free in', minimumTime],
              [
                'Minimum only: total interest',
                minimum.interest == null ? '—' : euro(minimum.interest),
              ],
            ] satisfies Rows)
          : []),
        ['Your payment: debt free in', repaidIn(months, 'Not at this payment')],
        ['Your payment: total interest', interest == null ? '—' : euro(interest)],
        ...(savedShown ? ([['Interest saved by your payment', euro(saved)]] satisfies Rows) : []),
        [`To clear it within ${yearsAndMonths(target)}`, `${euro(toClear)} a month`],
      ],
      goal: null,
      numbers: {
        Months_Minimum: !minimum ? '—' : minimum.months === Infinity ? 'Never' : minimum.months,
        Interest_Minimum: minimum?.interest ?? '—',
        Months_Your_Payment: never ? 'Never' : months,
        Interest_Your_Payment: interest ?? '—',
        Interest_Saved: saved ?? '—',
        Interest_This_Month: thisMonth,
        Months_Target: target,
        Payment_Target: toClear,
        Monthly_Rate: monthlyRate,
      },
    }
  },

  debtpay({ b: balance, apr, p: monthlyPayment, x: extra = 0 }) {
    const monthlyRate = monthlyFromYearly(apr)
    const payment = monthlyPayment + extra
    const months = monthsToRepay(balance, monthlyRate, payment)
    const never = months === Infinity
    const interest = never ? null : totalInterest(balance, monthlyRate, payment, months)
    const tooLong = !never && months > MAX_MONTHS
    const monthsBefore = monthsToRepay(balance, monthlyRate, monthlyPayment)
    const interestBefore =
      monthsBefore === Infinity
        ? null
        : totalInterest(balance, monthlyRate, monthlyPayment, monthsBefore)
    const extraHelps = extra > 0 && !never && monthsBefore !== Infinity
    const saved = extraHelps ? interestBefore! - interest! : null
    const extraLine = extraHelps
      ? `: the extra ${euro(extra)} a month saves about ${euro(saved!)} and ${repaidIn(monthsBefore - months)}. `
      : '. '
    return {
      label: 'Debt free in',
      value: never
        ? 'Never at this repayment'
        : tooLong
          ? 'Over 100 years'
          : yearsAndMonths(months),
      line: never
        ? 'The payment does not cover the interest. Try a higher amount.'
        : tooLong
          ? 'Payment too low to clear this debt in a reasonable time.'
          : `You would pay about ${euro(interest!)} in interest${extraLine}The APR is a yearly rate: about ${(monthlyRate * 100).toFixed(2)}% a month. For a credit card, Credit card repayment also shows what the minimum payment costs.${highAprNote(apr)}`,
      rows: [
        ['Total interest', interest == null ? '—' : euro(interest)],
        ...(extra > 0
          ? ([['Without the extra: debt free in', repaidIn(monthsBefore)]] satisfies Rows)
          : []),
        ...(extraHelps
          ? ([
              ['Time saved by the extra', repaidIn(monthsBefore - months)],
              ['Interest saved by the extra', euro(saved!)],
            ] satisfies Rows)
          : []),
      ],
      goal: null,
      numbers: {
        Months_To_Clear: never ? 'Never' : months,
        Total_Interest: interest ?? '—',
        Monthly_Rate: monthlyRate,
      },
    }
  },

  debtplan(figures): CalcResult {
    const debts: Debt[] = DEBT_NAMES.map((name, i) => {
      const apr = figures[`apr${i + 1}`]
      return {
        name,
        balance: figures[`b${i + 1}`] || 0,
        apr,
        monthlyRate: monthlyFromYearly(apr),
        minimum: figures[`m${i + 1}`] || 0,
      }
    })
    const extra = figures.x || 0
    const owed = debts.filter((debt) => debt.balance > CLEARED)
    if (!owed.length)
      return {
        label: 'Debt free in',
        value: 'No debts entered',
        line: 'Add a balance for at least one debt to see a plan.',
        rows: [],
        goal: null,
        numbers: {
          Months_Highest_Rate: 0,
          Interest_Highest_Rate: 0,
          Months_Smallest_Balance: 0,
          Interest_Smallest_Balance: 0,
          Months_Minimums: 0,
          Interest_Minimums: 0,
        },
      }

    const highest = payOff(debts, extra, 'highestRate')
    const smallest = payOff(debts, extra, 'smallestBalance')
    const minimums = payOff(debts, extra, 'minimumsOnly')
    const savedAgainst = (other: { interest: number | null }) =>
      other.interest != null && highest.interest != null ? other.interest - highest.interest : null
    const vsSmallest = savedAgainst(smallest)
    const vsMinimums = savedAgainst(minimums)
    const savesVsSmallest = vsSmallest != null && vsSmallest >= 1
    const savesVsMinimums = vsMinimums != null && vsMinimums >= 1
    const order = owed
      .toSorted((a, b) => b.apr - a.apr)
      .map((debt) => debt.name)
      .join(' → ')
    const plan = [
      `Pay every minimum, then put the extra and anything freed up by a cleared debt on the highest-rate debt first. That costs about ${euro(highest.interest ?? 0)} in interest`,
      savesVsSmallest
        ? ` and saves about ${euro(vsSmallest)} against paying the smallest balance first`
        : '',
      savesVsMinimums
        ? `${savesVsSmallest ? ', and about ' : ' and saves about '}${euro(vsMinimums)} against paying the minimums only`
        : '',
      '. Assumes no new borrowing.',
      owed.some((debt) => debt.minimum <= 0)
        ? ' A debt with a €0 repayment only grows until it gets extra money: add a repayment.'
        : '',
      ' Mortgages are not included: Mortgage overpay covers those.',
      highAprNote(...debts.map((debt) => debt.apr)),
    ].join('')
    const interestText = (result: { interest: number | null }) =>
      result.interest == null ? '—' : euro(result.interest)
    const monthsNumber = (result: { months: number }) =>
      result.months === Infinity ? 'Never' : result.months
    return {
      label: 'Debt free in (highest rate first)',
      value: repaidIn(highest.months, 'Not within 100 years'),
      line:
        highest.months === Infinity
          ? 'At these payments the debts would not clear within 100 years: at least one repayment does not cover its interest. Raise a repayment or add an extra amount.'
          : plan,
      rows: [
        ['Total owed today', euro(sum(owed, (debt) => debt.balance))],
        ['Highest rate first: debt free in', repaidIn(highest.months, 'Never')],
        ['Highest rate first: total interest', interestText(highest)],
        ['Smallest balance first: debt free in', repaidIn(smallest.months, 'Never')],
        ['Smallest balance first: total interest', interestText(smallest)],
        ['Minimums only: debt free in', repaidIn(minimums.months, 'Never')],
        ['Minimums only: total interest', interestText(minimums)],
        ['Order to pay (highest rate first)', order],
      ],
      goal: null,
      numbers: {
        Total_Owed: sum(owed, (debt) => debt.balance),
        Months_Highest_Rate: monthsNumber(highest),
        Interest_Highest_Rate: highest.interest ?? '—',
        Months_Smallest_Balance: monthsNumber(smallest),
        Interest_Smallest_Balance: smallest.interest ?? '—',
        Months_Minimums: monthsNumber(minimums),
        Interest_Minimums: minimums.interest ?? '—',
      },
    }
  },
}
