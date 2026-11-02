// What every report page reads: the plan, its projection and the figures, worked out once.
import type { Goal, Plan } from '../../state/types.ts'
import { planSettings } from '../../domain/planning/planSettings.ts'
import { project, livingShort, type YearRow } from '../../domain/planning/project.ts'

/** A year with a shortfall the charts colour coral. */
export const hasShortfall = (row: YearRow) => row.shortfall > 0.5

/** The first year everyday costs are no longer covered (a goal falling short is a separate note). */
export const firstGapAge = (rows: YearRow[]) => rows.find(livingShort)?.age ?? null

/** A figure the customer gave (typed or from a document), not left blank. */
export const hasFigure = (plan: Plan, key: string) =>
  !!plan.sources[key] && plan.figures[key] != null && plan.figures[key] !== ''

/** A goal whose age is already behind the customer. */
export const isPassed = (goal: Goal, age: number | null) =>
  goal.kind !== 'legacy' && goal.age < (age ?? 0)

export function reportContext(plan: Plan, today: Date) {
  const settings = planSettings(plan)
  const figures = settings.figures
  const projection = project(plan)
  const { rows } = projection
  const startAge = rows[0].age
  const retirement = plan.goals.find((goal) => goal.kind === 'retire') ?? null
  const retireAge = figures.retireAge
  const gapRows = rows.filter(hasShortfall)
  const prices = (row: YearRow) => (1 + settings.growth.inflation) ** row.index
  return {
    plan,
    today,
    settings,
    figures,
    rules: settings.rules,
    projection,
    rows,
    startAge,
    endAge: settings.end,
    yearOf: (age: number) => rows[0].year + age - startAge,
    retirement,
    retireAge,
    retired: !!retirement && retireAge <= startAge,
    /** Divide by this to turn a row's future euros into today's money. */
    prices,
    statePensionAge: settings.rules.sp.age,
    statePensionYear: Math.round(settings.statePension),
    fullStatePension: figures.statePensionShare >= 0.999,
    gap: {
      rows: gapRows,
      runOut: gapRows[0] ?? null,
      today: rows.reduce((sum, row) => sum + row.shortfall / prices(row), 0),
      future: rows.reduce((sum, row) => sum + row.shortfall, 0),
    },
  }
}

export type ReportContext = ReturnType<typeof reportContext>
