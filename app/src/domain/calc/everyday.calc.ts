// Everyday Money and Protection: net worth, surplus, budget, debt and loan repayment, life cover,
// income protection.
import { euro, euroWeekly } from '../../lib/format.ts'
import { MAX_MONTHS, monthlyFromYearly, monthsToRepay, repayment, totalInterest } from './maths.ts'
import type { Calculator } from './types.ts'
import { monthsText, years, yearsAndMonths } from './words.ts'

const ILLNESS_BENEFIT_MONTHS = 24 // paid for at most 2 years (624 days)
const PROTECTION_MAX_SHARE = 0.75

export const EVERYDAY: Record<string, Calculator['run']> = {
  networth({ sav, inv, pen, prop, mort, loans }) {
    const own = sav + inv + pen + prop
    const owe = mort + loans
    return {
      label: 'Your net worth',
      value: euro(own - owe),
      line: 'Everything you own minus everything you owe. Pensions are before tax; property is before selling costs. Track it once or twice a year.',
      rows: [
        ['You own', euro(own)],
        ['You owe', euro(owe)],
      ],
      goal: null,
      numbers: { Net_Worth: own - owe, You_Own: own, You_Owe: owe },
    }
  },

  surplus({ inc, ess, life, debt }) {
    const out = ess + life + debt
    const left = inc - out
    const goalAmount = Math.round(left * 12)
    return {
      label: 'Monthly surplus',
      value: euro(left),
      line:
        left > 0
          ? `About ${Math.round((left / inc) * 100)}% of your take-home pay is free for goals.`
          : left === 0
            ? 'Nothing left over this month.'
            : 'Spending is above income right now. Small changes to lifestyle spending can help.',
      rows: [
        ['Take-home', euro(inc)],
        ['Going out', euro(out)],
      ],
      goal:
        left > 0
          ? { kind: 'pot', name: 'Save my surplus', emoji: '🐷', amount: goalAmount, years: 1 }
          : null,
      numbers: { Surplus: left, Going_Out: out, Plan_Goal_Amount: left > 0 ? goalAmount : '—' },
    }
  },

  budget({ inc }, context) {
    const [needs, wants, save] = ['budgetNeeds', 'budgetWants', 'budgetSave'].map((key) =>
      Number(context.assumption(key)),
    )
    const share = (part: number) => Math.round(part * 100) + '%'
    const total = needs + wants + save
    const check =
      Math.abs(total - 1) > 1e-6 ? `Your shares add up to ${share(total)}, not 100%. ` : ''
    return {
      label: 'Save each month',
      value: euro(inc * save),
      line: `${check}A common starting point: ${share(needs)} needs, ${share(wants)} wants, ${share(save)} savings and debt. Adjust it to fit your life in Your assumptions.`,
      rows: [
        [`Needs (${share(needs)})`, euro(inc * needs)],
        [`Wants (${share(wants)})`, euro(inc * wants)],
        [`Savings & debt (${share(save)})`, euro(inc * save)],
      ],
      goal: null,
      numbers: {
        Save: inc * save,
        Needs: inc * needs,
        Wants: inc * wants,
        Split_Check: check.trim(),
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
          : `You would pay about ${euro(interest!)} in interest. The APR is a yearly rate: about ${(monthlyRate * 100).toFixed(2)}% a month.`,
      rows: [['Total interest', interest == null ? '—' : euro(interest)]],
      goal: null,
      numbers: {
        Months_To_Clear: never ? 'Never' : months,
        Total_Interest: interest ?? '—',
        Monthly_Rate: monthlyRate,
      },
    }
  },

  loan({ a: amount, apr, y: term }) {
    const monthlyRate = monthlyFromYearly(apr)
    const monthly = repayment(amount, monthlyRate, term * 12)
    const total = monthly * term * 12
    return {
      label: 'Monthly repayment',
      value: euro(monthly),
      line: `Total interest of about ${euro(total - amount)} over ${years(term)}. The APR is treated as an effective yearly rate (as for cards and loans; mortgage tools use the nominal rate ÷ 12, so the same percentage gives a slightly different repayment).`,
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

  lifecover(figures, context) {
    const { inc: income, y: supportYears, mort: mortgage, mp: mortgageProtected } = figures
    const { debt: otherDebts, sav: savings, ex: existingCover, surv: survivorsWeekly } = figures
    const share = Number(context.assumption('lifeShare'))
    const replacement = income * share * supportYears
    const need =
      Math.max(0, income * share - survivorsWeekly * context.rules.sp.weeks) * supportYears
    const debts = (mortgageProtected ? 0 : mortgage) + otherDebts
    const have = existingCover + savings
    const gap = Math.max(0, need + debts - have)
    return {
      label: 'Illustrative cover gap',
      value: euro(gap),
      line:
        gap > 0
          ? "A rough estimate of the gap between what your family might need and what you have. A protection expert can refine this. Cohabiting partners can now qualify for the State Bereaved Partner's Pension."
          : 'Your existing cover and savings look like they meet this rough estimate.',
      rows: [
        ['Income your family would need (after the State pension)', euro(need)],
        ['Debts to clear', euro(debts)],
        ['Existing cover + savings', euro(have)],
        [
          `Income replacement before State pension (${Math.round(share * 100)}%)`,
          euro(replacement),
        ],
      ],
      goal:
        gap > 0
          ? {
              kind: 'need',
              need: 'life',
              name: 'Life cover need (for your adviser)',
              emoji: '🛡️',
              amount: gap,
            }
          : null,
      numbers: {
        Cover_Gap: gap,
        Income_Need: need,
        Debts_To_Clear: debts,
        Already_Have: have,
        Income_Replacement: replacement,
        Plan_Goal_Need: gap,
      },
    }
  },

  incomegap(figures, context) {
    const { e: essentialSpending, sp: sickPayMonths, s: savings, inc: income } = figures
    const { sp } = context.rules
    const weekly = figures.ib ?? sp.illness
    const benefit = (weekly * sp.weeks) / 12
    const gap = Math.max(0, essentialSpending - benefit)
    const protectionMax = Math.max(0, (income * PROTECTION_MAX_SHARE) / 12 - benefit)
    const protection = Math.min(gap, protectionMax)
    const uncapped = gap === 0 ? ILLNESS_BENEFIT_MONTHS : sickPayMonths + savings / gap
    const coping = Math.min(ILLNESS_BENEFIT_MONTHS, uncapped)
    const capped = uncapped >= ILLNESS_BENEFIT_MONTHS
    const savingsMonths = gap === 0 ? 'Not needed' : savings / gap
    const first =
      gap === 0
        ? `Illness Benefit (${euro(weekly)} a week, if you have enough PRSI) would cover your essential spending.`
        : `After Illness Benefit (${euro(weekly)} a week, if you have enough PRSI; lower if you earned under €300 a week) you would have a gap of about ${euro(gap)} a month. Some people cover a gap like this with income protection; your adviser can explain the options. Statutory sick pay is only 5 days a year.`
    return {
      label: capped ? 'You could cope for' : 'You could cope for about',
      value: capped ? 'up to 2 years' : monthsText(coping),
      line: `${first} Illness Benefit is paid for up to 2 years (624 days), so we do not count time after that.`,
      rows: [
        ['Monthly gap after Illness Benefit', euro(gap)],
        ['Income protection to aim for, a month', euro(protection)],
        [
          'Savings would cover',
          typeof savingsMonths === 'string'
            ? savingsMonths + ' while Illness Benefit covers your spending'
            : savingsMonths >= ILLNESS_BENEFIT_MONTHS
              ? 'more than 2 years'
              : monthsText(savingsMonths),
        ],
        ['Sick pay', monthsText(sickPayMonths)],
        [
          `Illness Benefit a week (your figure; the most is ${euroWeekly(sp.illness)})`,
          euroWeekly(weekly),
        ],
      ],
      goal:
        protection > 0
          ? {
              kind: 'need',
              need: 'ip',
              name: 'Income protection need (for your adviser)',
              emoji: '🩺',
              amount: protection,
            }
          : null,
      numbers: {
        Months_Coping: coping,
        Monthly_Gap: gap,
        IP_Needed: protection,
        Illness_Benefit_Month: benefit,
        Savings_Months: savingsMonths,
        IP_Max: protectionMax,
        Plan_Goal_Need: protection,
      },
    }
  },
}
