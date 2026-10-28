// What could change the answer: the plan run again with each candidate change.
import { project } from '../../domain/planning/project.ts'
import { firstGapAge, type ReportContext } from './context.ts'
import { changedPlan } from './changedPlan.ts'
import { candidateChanges, type Candidate, type ScenarioRow } from './scenarioChanges.ts'
import { closeTheGap } from './closeTheGap.ts'

export type { ScenarioRow }
export type Scenarios = ReturnType<typeof planScenarios>

export function planScenarios(context: ReportContext) {
  const { plan, projection, figures: f, rows } = context
  const { percent } = projection
  const target = [...plan.goals].sort((a, b) => percent[a.id] - percent[b.id] || a.age - b.age)[0]
  const today = { covered: target ? percent[target.id] : 100, gapStartsAt: firstGapAge(rows) }
  const fullStatePension = f.statePensionShare >= 0.999
  const base = { today, fullStatePension, allOnTrack: today.covered >= 95 }
  if (!target || today.covered >= 95) return { ...base, rows: [], combined: [], ...closeTheGap() }

  const run = ({ row, change }: Candidate): ScenarioRow => {
    const result = project(changedPlan(plan, change, context.today))
    const covered = result.percent[target.id]
    return {
      ...row,
      covered,
      gapStartsAt: firstGapAge(result.rows),
      points: covered - today.covered,
    }
  }
  const candidates = candidateChanges(context)
  const single = candidates.single.map(run)
  const combined = candidates.combined.map(run)

  // skip rows that do nothing, or are worse than today
  const helps = (row: ScenarioRow) =>
    row.covered >= today.covered &&
    (row.covered > today.covered ||
      (row.gapStartsAt == null
        ? today.gapStartsAt != null
        : today.gapStartsAt != null && row.gapStartsAt > today.gapStartsAt))
  // adding the pension must not make the retire-only path worse
  const noWorseThanRetiring = (row: ScenarioRow) => {
    const retiring = single.find(
      (other) => other.id === (row.id === 'c65' ? 'retire65' : 'retire60'),
    )
    return !retiring || row.id === 'c60more' || row.covered >= retiring.covered
  }
  const byCovered = (a: ScenarioRow, b: ScenarioRow) => a.covered - b.covered
  const kept = single.filter(helps).sort(byCovered)
  const keptCombined = combined.filter(helps).filter(noWorseThanRetiring).sort(byCovered)
  return {
    ...base,
    rows: kept,
    combined: keptCombined,
    ...closeTheGap({ today, rows: kept, combined: keptCombined, figures: f, fullStatePension }),
  }
}
