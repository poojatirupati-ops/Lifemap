import { euro } from '../../lib/format.ts'
import { clamp } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { ONE_IN_20, STYLES } from './invest.shared.ts'

export const riskReturn: Calculator = {
  id: 'riskreturn',
  inputs: [
    input('p', 'Amount', 20000, 1000, 1000000, 100, '€'),
    input('y', 'Years', 10, 1, 30, 1, 'y'),
    input('s', 'Style', 2, 1, 3, 1, 'style'),
  ],
  run({ p: amount, y: term, s }, context) {
    const style = clamp(Math.round(s), 1, 3)
    const growth = Number(context.assumption('riskMu' + style))
    const volatility = Number(context.assumption('riskVol' + style))
    const spread = volatility / Math.sqrt(term)
    const middle = amount * (1 + growth) ** term
    const weaker = amount * (1 + growth - spread) ** term
    const stronger = amount * (1 + growth + spread) ** term
    const fall = Math.round((volatility * ONE_IN_20 - growth) * 100) / 100
    const name = STYLES[style - 1]
    const badYear =
      Math.round(fall * 100) >= 1
        ? `About a 1-in-20 bad year could see a fall of around ${Math.round(fall * 100)}%.`
        : 'On these assumptions a 1-in-20 bad year is not expected to bring a fall.'
    return {
      label: `${name} · middle outcome`,
      value: euro(middle),
      line: `Illustrative only. ${badYear} Over longer timeframes the yearly return range narrows, but the gap in euros between the weaker and stronger outcomes widens; "weaker" is roughly a 1-in-6 chance of doing worse, not the worst case.`,
      rows: [
        ['Weaker outcome', euro(weaker)],
        ['Middle outcome', euro(middle)],
        ['Stronger outcome', euro(stronger)],
      ],
      goal: null,
      numbers: {
        Middle: middle,
        Weaker: weaker,
        Stronger: stronger,
        Difficult_Year_Fall: fall,
        Style_Name: name,
        Spread: spread,
      },
    }
  },
}
