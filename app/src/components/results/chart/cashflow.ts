// What the cashflow chart shows for each plan year, worked out from the projection's rows.
import type { YearRow } from '../../../domain/planning/project.ts'
import type { Goal } from '../../../state/types.ts'

export const PAD_LEFT = 34
export const PAD_RIGHT = 6
const MIN_WIDTH = 322
const MAX_WIDTH = 780

/** Phones in portrait get the fixed width; landscape stretches to the screen, within limits. */
export const chartWidth = (viewport: { landscape: boolean; width: number }) =>
  viewport.landscape ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, viewport.width - 72)) : MIN_WIDTH

/** How one year's spending is paid: from income, from savings, or not covered. */
export interface YearSplit {
  spending: number
  fromIncome: number
  fromSavings: number
  shortfall: number
}

export function yearSplit(row: YearRow): YearSplit {
  const living = row.living + row.repayments
  return {
    spending: living + row.goalCost,
    fromIncome: Math.min(row.inflow, living),
    fromSavings: row.drawnFromSavings + Math.max(0, row.goalCost - row.goalGap),
    shortfall: row.shortfall,
  }
}

export const isShortYear = (row: YearRow) => row.shortfall > 0.5

export function chartLabel(rows: YearRow[]) {
  const firstShort = rows.find(isShortYear)
  const range = `Yearly cashflow, age ${rows[0].age} to ${rows[rows.length - 1].age}.`
  return firstShort
    ? `${range} Shortfall from age ${firstShort.age}.`
    : `${range} Every year is covered.`
}

/** The year shown first: the first short year, else the year retirement starts, else today. */
export function defaultYear(rows: YearRow[], retiringAge?: number) {
  const short = rows.findIndex(isShortYear)
  if (short >= 0) return short
  return Math.max(
    0,
    rows.findIndex((row) => row.age === retiringAge),
  )
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

/** Goals the chart marks with their emoji: all but retirement and legacy. */
export const markedGoals = (goals: Goal[]) =>
  goals.filter((goal) => goal.kind !== 'retire' && goal.kind !== 'legacy')

/** Goals by year, each lifted a level when it would sit within 15px of an earlier one. */
export function stackMarkers(goals: Goal[], rows: YearRow[], centre: (index: number) => number) {
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
