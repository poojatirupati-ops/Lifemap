import { percent } from '../../lib/format.ts'
import { yearsLasting } from './maths.ts'
import type { Calculator } from './types.ts'
import { inflationText, NO_INFLATION } from './words.ts'
import { atYearEnd, lastingText, withdrawals } from './retire.shared.ts'

export const drawdown: Calculator = {
  id: 'drawdown',
  inputs: [withdrawals[0], { ...withdrawals[1], example: 20000 }],
  run(figures, context) {
    const { pot, w: withdrawal } = figures
    const { inflation } = context
    const end = atYearEnd(context)
    const growths = [1, 2, 3].map((style) => Number(context.assumption('riskMu' + style)) * 100)
    const lasting = growths.map((growth) =>
      inflation == null ? null : yearsLasting(pot, withdrawal, growth, inflation * 100, end),
    )
    const prices =
      inflation == null
        ? '. Choose your inflation rate to see them.'
        : `, rising with prices (${inflationText(inflation)}).`
    return {
      label: 'Balanced scenario lasts',
      value: lastingText(lasting[1]),
      line: `Three illustrative growth scenarios (your assumptions); withdrawals at the ${end ? 'end' : 'start'} of each year${prices} Real returns vary year to year. Before tax.`,
      rows: ['Cautious', 'Balanced', 'Growth'].map((name, i) => [
        `${name} (${percent(growths[i] / 100)})`,
        lastingText(lasting[i]),
      ]),
      goal: null,
      numbers: {
        Years_Cautious: lasting[0] ?? NO_INFLATION,
        Years_Balanced: lasting[1] ?? NO_INFLATION,
        Years_Growth: lasting[2] ?? NO_INFLATION,
      },
    }
  },
}
