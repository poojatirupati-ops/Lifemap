// What the cashflow chart shows for each plan year, worked out from the projection's rows.
import type { YearRow } from '../../../domain/planning/project.ts'

/** How one year's spending is paid: from income, from savings, or not covered. */
export function yearSplit(row: YearRow) {
  const living = row.living + row.repayments
  return {
    spending: living + row.goalCost,
    fromIncome: Math.min(row.inflow, living),
    fromSavings: row.drawnFromSavings + Math.max(0, row.goalCost - row.goalGap),
    shortfall: row.shortfall,
  }
}

export const isShortYear = (row: YearRow) => row.shortfall > 0.5

/** The year shown first: the first short year, else the year retirement starts, else today. */
export function defaultYear(rows: YearRow[], hasRetirement: boolean) {
  const short = rows.findIndex(isShortYear)
  if (short >= 0) return short
  const retiring = hasRetirement ? rows.findIndex((row) => row.retiresThisYear) : -1
  return Math.max(0, retiring)
}

const NICE_STEPS = [1.5, 2, 3, 4, 6, 8, 10]

/** A round axis top at or above the value: 1.5, 2, 3, 4, 6, 8 or 10 times a power of ten. */
export function axisMax(value: number) {
  const power = 10 ** Math.floor(Math.log10(Math.max(value, 1)))
  return NICE_STEPS.find((step) => value / power <= step)! * power
}

/** €40k, €2m, €1.5m */
export const axisLabel = (amount: number) =>
  amount >= 1e6
    ? `€${(amount / 1e6).toFixed(amount % 1e6 ? 1 : 0)}m`
    : `€${Math.round(amount / 1000)}k`

/** Goals by year, each lifted a level when it would sit within 15px of an earlier one. */
export function stackMarkers<Goal extends { age: number }>(
  goals: Goal[],
  rows: YearRow[],
  centre: (index: number) => number,
) {
  const levelEnds: number[] = []
  return goals
    .map((goal) => ({ goal, index: goal.age - rows[0].age }))
    .filter(({ index }) => index >= 0 && index < rows.length)
    .sort((a, b) => a.index - b.index)
    .map(({ goal, index }) => {
      const x = centre(index)
      let level = 0
      while (levelEnds[level] != null && x - levelEnds[level] < 15) level++
      levelEnds[level] = x
      return { goal, x, level }
    })
}
