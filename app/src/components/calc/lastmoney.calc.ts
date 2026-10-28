import { LAW_TEXT } from '../../domain/planning/rates.ts'
import { euro } from '../../lib/format.ts'
import { MAX_YEARS, yearsLasting } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { inflationText, NO_INFLATION } from './words.ts'
import { atYearEnd, lastingText, withdrawals } from './retire.shared.ts'

export const lastMoney: Calculator = {
  id: 'lastmoney',
  inputs: [
    ...withdrawals,
    input('g', 'Growth assumption a year (once retired)', 3.15, 0, 7, 0.05, '%'),
    input('age', 'Your age when withdrawals start', 66, 50, 90, 1, 'age'),
  ],
  run(v, context) {
    const { inflation, planEnd, rules } = context
    const end = atYearEnd(context)
    const lasting = inflation == null ? null : yearsLasting(v.pot, v.w, v.g, inflation * 100, end)
    const toAge = lasting == null ? null : v.age + lasting
    let outcome = '. Choose your inflation rate to see how long it lasts.'
    if (lasting != null) {
      const until =
        lasting >= MAX_YEARS
          ? `money lasts beyond age ${planEnd}, your plan-until age.`
          : lasting < 1
            ? 'your savings would run out in the first year.'
            : `money lasts to about age ${toAge}` +
              (toAge! < planEnd
                ? `, before the end of your plan (${planEnd}).`
                : toAge! > planEnd
                  ? `, beyond the end of your plan (${planEnd}).`
                  : '.')
      outcome = `, rising with prices (${inflationText(inflation!)}): ${until}`
    }
    const early =
      v.age < rules.pen.earliestAge
        ? ` Most pensions can't be taken before ${rules.pen.earliestAge} (PRSA and personal pensions; occupational schemes from 50 only if you have left that job).`
        : ''
    const arf = LAW_TEXT.arf.charAt(0).toUpperCase() + LAW_TEXT.arf.slice(1)
    const lastsTo =
      lasting == null
        ? NO_INFLATION
        : lasting >= MAX_YEARS
          ? `Beyond ${planEnd}`
          : lasting < 1
            ? 'Less than a year'
            : toAge!
    return {
      label: 'Could last about',
      value: lastingText(lasting),
      line: `Withdrawing ${euro(v.w)} at the ${end ? 'end' : 'start'} of each year${outcome}${early} Before tax: ARF and vested PRSA withdrawals pay income tax and USC (and PRSI before 66). ${arf}. An illustration, not a guarantee.`,
      rows: [
        [
          'Money lasts to about age',
          lasting == null
            ? NO_INFLATION
            : lasting >= MAX_YEARS
              ? `Beyond ${planEnd} (your plan-until age)`
              : lasting < 1
                ? 'Less than a year after you start'
                : String(toAge),
        ],
        ['Withdrawal rate (first year)', ((v.w / v.pot) * 100).toFixed(1) + '%'],
      ],
      goal: null,
      numbers: {
        Years_Lasting: lasting ?? NO_INFLATION,
        Lasts_To_Age: lastsTo,
        Withdrawal_Rate: v.w / v.pot,
      },
    }
  },
}
