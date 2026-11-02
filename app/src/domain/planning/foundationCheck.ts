// What every financial foundation level is made of, and the helpers the levels share.
import { hasValue } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import type { Household } from './householdFigures.ts'

/** ok solid · mid in progress · bad needs attention · na not started · held solid above a weaker level */
export type FoundationStatus = 'ok' | 'mid' | 'bad' | 'na' | 'held'

export type Check = {
  status: FoundationStatus
  text: string
  /** the calculator that helps with it */
  tool?: string
  /** the finance section to fill in when there is nothing to check yet */
  section?: number
}

export type Foundation = Check & {
  level: number
  emoji: string
  name: string
  months?: number
  makePlan?: boolean
  checks?: Check[]
}

export type FoundationInputs = Household &
  Pick<Plan, 'figures' | 'sources' | 'goals' | 'lists' | 'moneyProfile' | 'hasResults'>

export const STATUS_LABEL: Record<FoundationStatus, string> = {
  ok: 'Solid',
  mid: 'In progress',
  bad: 'Needs attention',
  na: 'Not started',
  held: 'In place',
}

/** A figure the customer has given (typed, read from a statement or answered). */
export const hasFigure = (plan: Pick<Plan, 'figures' | 'sources'>, key: string) =>
  !!plan.sources[key] && hasValue(plan.figures[key])

/** Months rounded down to one decimal, as Irish English: "4.5". */
export const tenths = (months: number) => (Math.floor(months * 10) / 10).toLocaleString('en-IE')
