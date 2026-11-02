import { euro, percent } from '../../lib/format.ts'
import { grownLump } from './maths.ts'
import type { Calculator } from './types.ts'
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
    { key: 'p', label: 'Amount', example: 10000, min: 500, max: 500000, step: 100, unit: '€' },
    {
      key: 'r',
      label: 'Growth rate a year (before fees)',
      example: 4,
      min: 0,
      max: 8,
      step: 0.5,
      unit: '%',
    },
    { key: 'y', label: 'Years', example: 15, min: 1, max: 40, step: 1, unit: 'y' },
    { key: 'f', label: 'Yearly fees', example: 0, min: 0, max: 3, step: 0.05, unit: '%' },
    {
      key: 'wait',
      label: 'Years you might wait before investing',
      example: 5,
      min: 1,
      max: 20,
      step: 1,
      unit: 'y',
    },
  ],
  run(figures, context) {
    const { p: amount, r: ratePercent, y: term, f: fee = 0 } = figures
    const growth = afterFees(ratePercent, fee)
    const gross = grownLump(amount, ratePercent, term)
    const grown = amount * (1 + growth) ** term
    const wait = figures.wait ?? WAIT_YEARS
    const late =
      amount * (1 + context.cash) ** Math.min(wait, term) * (1 + growth) ** Math.max(0, term - wait)
    const { today, realReturn, adjusted } = todaysMoney(grown, term, growth, context)
    const known = today != null
    const discount = known ? grown / today : 1
    const headline = adjusted ? (known ? today : NO_INFLATION) : grown
    const waitCost = adjusted ? (known ? (grown - late) / discount : NO_INFLATION) : grown - late
    const feesNote = fee ? ' (after fees)' : ''
    const opening =
      adjusted && known
        ? realReturnLine(growth * 100, 'growth' + (fee ? ' after fees' : ''), context.inflation!)
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
        ...(fee ? [['Fees cost', euro(gross - grown)] as [string, string]] : []),
      ],
      goal: growGoal(today, term),
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
