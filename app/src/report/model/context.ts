// What every report page reads: the plan, its projection and the figures, worked out once.
import type { Plan } from '../../state/types.ts'
import { planSettings } from '../../domain/planning/planSettings.ts'
import { project, type YearRow } from '../../domain/planning/project.ts'
import { hasShortfall } from '../../components/results/chart/cashflow.ts'

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
