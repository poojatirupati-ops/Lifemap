// The monthly saving and the what-if, as numbers. Pure: no store, no React.
import { euro } from '../../lib/format.ts'
import type { Goal } from '../../state/types.ts'

/** The −/+ buttons move the saving and the what-if extra by this much. */
export const STEP = 25
/** The what-if extra each month stays within these. */
export const EXTRA_MIN = -5000
export const EXTRA_MAX = 10000
/** At most half of the spare money is suggested as a saving. */
const SUGGESTED_SHARE = 0.5

const roundToStep = (amount: number) => Math.round(amount / STEP) * STEP

/** The saving after a −/+ tap: whole steps, never below €0 or above the spare money. */
export function stepSaving(current: number, change: number, spare: number) {
  const wanted = Math.max(0, roundToStep(current + change))
  const most = Math.max(0, spare)
  return { amount: Math.min(wanted, most), capped: wanted > most }
}

/** A bigger saving worth suggesting, or null when the spare money does not leave €50 more. */
export function suggestedSaving(saving: number, chosen: number, spare: number) {
  const suggestion = Math.floor((SUGGESTED_SHARE * spare) / STEP) * STEP
  return suggestion >= saving + 50 && suggestion >= chosen + 50 ? suggestion : null
}

/** Saving plus the what-if extra, and whether that is more than the spare money. */
export function whatIfTotal(saving: number, spare: number, extra: number) {
  const total = Math.max(0, saving + extra)
  return { total, spare: Math.max(0, spare), over: extra !== 0 && total > Math.max(0, spare) + 0.5 }
}

/** Goals whose covered percent the what-if changes. */
export const changedGoals = (
  goals: Goal[],
  before: Record<number, number>,
  after: Record<number, number>,
) =>
  goals
    .filter((goal) => before[goal.id] !== after[goal.id])
    .map((goal) => ({ goal, before: before[goal.id], after: after[goal.id] }))

/** The goal a what-if starts on: the least covered, then the soonest. */
export const leastCovered = (goals: Goal[], percent: Record<number, number>) =>
  goals.toSorted((a, b) => percent[a.id] - percent[b.id] || a.age - b.age)[0] ?? null

/** "€X a month left after costs · €Y goes to your goals, €Z to everyday spending.", or '' with nothing spare. */
export function savingLine(spare: number, saving: number) {
  if (!(spare > 0)) return ''
  const spent = Math.max(0, spare - saving)
  return `${euro(spare)} a month left after costs · ${euro(saving)} goes to your goals, ${euro(spent)} to everyday spending.`
}
