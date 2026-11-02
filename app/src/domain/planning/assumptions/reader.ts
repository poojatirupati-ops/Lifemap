// Reads one plan's assumptions for "What your plan assumes": figures, words and where each comes from.
import { ASSUMPTIONS } from '../assumptionFields.data.ts'
import { formatAssumption, standardNote } from '../assumptionText.ts'
import { assumption, chosenAssumption } from '../assumptions.ts'
import { planSettings, type ProjectionInputs } from '../planSettings.ts'
import { euroWeekly } from '../../../lib/format.ts'
import type { Plan } from '../../../state/types.ts'

export const GOVERNMENT = 'Set by Government · 2026'
export const MINE = 'Your choice'
export const HOW = 'How the plan works'
export const SET = 'Set by LifeMap'
export const ASSUMED = 'Assumed: add yours'
export const NOT_CHOSEN = 'Not chosen yet'

export interface AssumptionRow {
  label: string
  value: string
  tag: string
  note?: string
}

/** The projection's inputs, plus what only these rows read. */
export type AssumptionPlan = ProjectionInputs &
  Pick<Plan, 'figures' | 'retireSet' | 'needs' | 'ratesForAdviser'>

export function assumptionReader(plan: AssumptionPlan) {
  const settings = planSettings(plan)
  const { inputs, rules } = settings
  const value = (key: string) => assumption(inputs, key)
  const mine = (key: string) => chosenAssumption(plan.assumptions, key) != null
  const source = (key: string) => {
    if (mine(key) || key === 'planEnd') return MINE
    const standard = ASSUMPTIONS[key]?.standard || key === 'startYear'
    return standard ? SET : ASSUMED
  }
  return {
    plan,
    settings,
    value,
    mine,
    source,
    /** the customer's own figure, in words */
    chosen: (key: string) => formatAssumption(key, chosenAssumption(plan.assumptions, key)),
    /** the figure in use, in words */
    shown: (key: string) => formatAssumption(key, inputs.assumptions[key] ?? value(key)),
    /** a row tagged by its source; a LifeMap standard says where it comes from */
    row: (label: string, text: string, key: string): AssumptionRow => {
      const tag = source(key)
      return { label, value: text, tag, note: tag === SET ? standardNote(key) : '' }
    },
    usually: (key: string) => {
      const [low, high] = ASSUMPTIONS[key].range!(rules).map((end) => euroWeekly(end))
      return `Usually ${low}–${high} a week`
    },
  }
}

export type AssumptionReader = ReturnType<typeof assumptionReader>
