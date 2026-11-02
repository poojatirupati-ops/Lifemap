// The three bands a goal or a plan year falls in: teal, gold or coral.
import { livingShort, type YearRow } from './project'

export type Band = 'good' | 'nudge' | 'alert'

/** A goal's band from its covered percent. */
export const band = (percent: number): Band =>
  percent >= 95 ? 'good' : percent >= 70 ? 'nudge' : 'alert'
export const BAND_WORDS: Record<Band, string> = {
  good: 'On track',
  nudge: 'Needs a nudge',
  alert: 'Needs attention',
}

type Year = Pick<YearRow, 'livingShortfall' | 'needs' | 'goalShort' | 'drawnFromSavings'>

export const isShortYear = (row: Year) => livingShort(row) || row.goalShort
/** Short of money, paid from savings, or covered by income. */
export const yearBand = (row: Year): Band =>
  isShortYear(row) ? 'alert' : row.drawnFromSavings > 1 ? 'nudge' : 'good'
