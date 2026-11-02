import { euro, euroWeekly } from '../../lib/format.ts'
import type { Calculator } from './types.ts'
import { monthsText } from './words.ts'

const ILLNESS_BENEFIT_MONTHS = 24 // paid for at most 2 years (624 days)
const PROTECTION_MAX_SHARE = 0.75

export const incomeGap: Calculator = {
  id: 'incomegap',
  inputs: [
    {
      key: 'e',
      label: 'Essential monthly spending',
      example: 2500,
      min: 500,
      max: 10000,
      step: 100,
      unit: '€',
    },
    {
      key: 'sp',
      label: "Months of sick pay from your employer's scheme",
      example: 3,
      min: 0,
      max: 12,
      step: 1,
      unit: 'm',
    },
    {
      key: 's',
      label: 'Easy-access savings',
      example: 8000,
      min: 0,
      max: 200000,
      step: 500,
      unit: '€',
    },
    {
      key: 'inc',
      label: 'Your gross yearly income',
      example: 60000,
      min: 0,
      max: 300000,
      step: 1000,
      unit: '€',
    },
    {
      key: 'ib',
      label: 'Illness Benefit a week',
      example: 254,
      min: 0,
      max: 500,
      step: 0.5,
      unit: '€',
    },
  ],
  run(figures, context) {
    const {
      e: essentialSpending,
      sp: sickPayMonths,
      s: savings,
      inc: income,
      ib: illnessBenefit,
    } = figures
    const { sp } = context.rules
    const weekly = illnessBenefit ?? sp.illness
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
