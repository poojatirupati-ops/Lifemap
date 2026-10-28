import { euro, euroWeekly } from '../../lib/format.ts'
import { input, type Calculator } from './types.ts'
import { monthsText } from './words.ts'
import { ILLNESS_BENEFIT_MONTHS, PROTECTION_MAX_SHARE } from './protect.shared.ts'

export const incomeGap: Calculator = {
  id: 'incomegap',
  inputs: [
    input('e', 'Essential monthly spending', 2500, 500, 10000, 100, '€'),
    input('sp', "Months of sick pay from your employer's scheme", 3, 0, 12, 1, 'm'),
    input('s', 'Easy-access savings', 8000, 0, 200000, 500, '€'),
    input('inc', 'Your gross yearly income', 60000, 0, 300000, 1000, '€'),
    input('ib', 'Illness Benefit a week', 254, 0, 500, 0.5, '€'),
  ],
  run(v, context) {
    const { sp } = context.rules
    const weekly = v.ib ?? sp.illness
    const benefit = (weekly * sp.weeks) / 12
    const gap = Math.max(0, v.e - benefit)
    const protectionMax = Math.max(0, (v.inc * PROTECTION_MAX_SHARE) / 12 - benefit)
    const protection = Math.min(gap, protectionMax)
    const uncapped = gap === 0 ? ILLNESS_BENEFIT_MONTHS : v.sp + v.s / gap
    const coping = Math.min(ILLNESS_BENEFIT_MONTHS, uncapped)
    const capped = uncapped >= ILLNESS_BENEFIT_MONTHS
    const savingsMonths = gap === 0 ? 'Not needed' : v.s / gap
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
        ['Sick pay', monthsText(v.sp)],
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
              em: '🩺',
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
