import { euro, percent } from '../../lib/format.ts'
import { grownLump } from './maths.ts'
import { input, type Calculator } from './types.ts'
import {
  adjustNeedsInflation,
  beforeTax,
  NO_INFLATION,
  NO_INFLATION_GOAL,
  realReturnLine,
  years,
} from './words.ts'
import { WAIT_YEARS, afterFees, growGoal, todaysMoney } from './invest.shared.ts'

export const lumpSum: Calculator = {
  id: 'lumpsum',
  inputs: [
    input('p', 'Amount', 10000, 500, 500000, 100, '€'),
    input('r', 'Growth rate a year (before fees)', 4, 0, 8, 0.5, '%'),
    input('y', 'Years', 15, 1, 40, 1, 'y'),
    input('f', 'Yearly fees', 0, 0, 3, 0.05, '%'),
    input('wait', 'Years you might wait before investing', 5, 1, 20, 1, 'y'),
  ],
  run(v, context) {
    const fee = v.f || 0
    const growth = afterFees(v.r, fee)
    const gross = grownLump(v.p, v.r, v.y)
    const grown = v.p * (1 + growth) ** v.y
    const wait = v.wait ?? WAIT_YEARS
    const late =
      v.p * (1 + context.cash) ** Math.min(wait, v.y) * (1 + growth) ** Math.max(0, v.y - wait)
    const { today, realReturn, adjusted } = todaysMoney(grown, v.y, growth, context)
    const known = today != null
    const discount = known ? grown / today : 1
    const headline = adjusted ? (known ? today : NO_INFLATION) : grown
    const waitCost = adjusted ? (known ? (grown - late) / discount : NO_INFLATION) : grown - late
    const feesNote = v.f ? ' (after fees)' : ''
    const opening =
      adjusted && known
        ? realReturnLine(growth * 100, 'growth' + (v.f ? ' after fees' : ''), context.inflation!)
        : adjustNeedsInflation(context)
    const waiting =
      typeof waitCost !== 'number'
        ? ''
        : waitCost > 0
          ? `Waiting ${years(wait)} before starting could mean about ${euro(waitCost)} less, which is the cost of waiting. `
          : `With growth of ${(growth * 100).toFixed(2)}% a year after fees, no more than the cash rate, waiting ${years(wait)} costs nothing here. `
    return {
      label: (adjusted ? "In today's money" : 'Could grow to') + feesNote,
      value: typeof headline === 'number' ? euro(headline) : headline,
      line: `${opening}While it waits, the money earns the cash savings rate (${percent(context.cash)} a year, before DIRT). ${waiting}${beforeTax(context.rules)}`,
      rows: [
        ['If you start today (after fees)', euro(grown)],
        [`If you start in ${years(wait)}`, euro(late)],
        ...(adjusted
          ? [["Worth in today's money", known ? euro(today) : NO_INFLATION] as [string, string]]
          : []),
        ...(v.f ? [['Fees cost', euro(gross - grown)] as [string, string]] : []),
      ],
      goal: growGoal(today, v.y),
      numbers: {
        Headline: headline,
        Grows_To: grown,
        Value_Start_Later: late,
        Value_Today: today ?? NO_INFLATION,
        Cost_Of_Waiting: waitCost,
        Fees_Cost: gross - grown,
        Growth_After_Fees: growth,
        Real_Return: realReturn,
        Plan_Goal_Amount: known ? Math.round(today) : NO_INFLATION_GOAL,
      },
    }
  },
}
