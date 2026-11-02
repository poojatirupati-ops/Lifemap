// What the tools start from, worked out once: the plan's figures and what the customer has told us.
import { planSettings } from '../planning/planSettings.ts'
import { project } from '../planning/project.ts'
import { isNumber, toNumber } from '../../lib/format.ts'
import type { ToolPlan } from './context.ts'

/** A tool's starting figures: undefined = nothing known; null = known to be missing. */
export type Values = Record<string, number | null | undefined>

/** What a tool starts from, with a note for each figure worked out of the customer's own. */
export interface Fill {
  values: Values
  workedOut?: Record<string, string>
}

export function knownFigures(plan: ToolPlan) {
  const settings = planSettings(plan)
  const { figures } = settings
  const age = plan.about.age ?? 0
  const mortgageRate = toNumber(plan.figures.mortRate)
  return {
    plan,
    settings,
    figures,
    age,
    /** The customer gave us this figure (typed or from a statement). */
    has: (key: string) => !!plan.sources[key] && isNumber(plan.figures[key]),
    takeHome: () => project(plan).rows[0].inflow / 12,
    hasMortgage: figures.mortgageBalance > 0,
    mortgageRate: mortgageRate > 0 ? mortgageRate : undefined,
    mortgageYears: figures.mortgageYears || null,
    pensionGrowth: +(figures.pensionGrowth * 100).toFixed(2),
  }
}

export type Known = ReturnType<typeof knownFigures>
