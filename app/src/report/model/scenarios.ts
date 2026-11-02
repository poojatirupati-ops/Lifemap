// What could change the answer: the plan run again with each candidate change, and the changes
// worth naming (the best per lever for page 2; what helps most and a path to explore for page 7).
import { produce } from 'immer'
import { euro } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import { normalize } from '../../domain/plan/normalize.ts'
import { livingShort, project, type YearRow } from '../../domain/planning/project.ts'
import type { HouseholdFigures } from '../../domain/planning/householdFigures.ts'
import type { ReportContext } from './context.ts'
import {
  candidateChanges,
  type Candidate,
  type Change,
  type ScenarioRow,
} from './scenarioChanges.ts'

export type { ScenarioRow }
export type Scenarios = ReturnType<typeof planScenarios>

/** The first year everyday costs are no longer covered (a goal falling short is a separate note). */
const firstGapAge = (rows: YearRow[]) => rows.find(livingShort)?.age ?? null

/** The plan with one or more changes made. */
function changedPlan(plan: Plan, change: Change, today: Date) {
  return produce(plan, (draft) => {
    if (change.retireAge != null) {
      draft.retireAge = change.retireAge
      draft.retireSet = true
      const retirement = draft.goals.find((goal) => goal.kind === 'retire')
      if (retirement) retirement.age = change.retireAge
      draft.figures.retireAge = change.retireAge
      draft.sources.retireAge ||= 'pre'
    }
    if (change.saveM != null) {
      draft.monthlySaving = change.saveM
      draft.savingAtRule = true
    }
    if (change.pensionAddM) {
      draft.figures.pensionM = (Number(draft.figures.pensionM) || 0) + change.pensionAddM
      draft.figures.pensionOwnM = (Number(draft.figures.pensionOwnM) || 0) + change.pensionAddM
      draft.sources.pensionM = 'typed'
      draft.sources.pensionOwnM = 'typed'
    }
    if (change.fullStatePension) {
      draft.figures.sp = 'Expect full'
      draft.sources.sp = 'typed'
      delete draft.figures.spYears
      delete draft.assumptions.spYears
      delete draft.assumptions.spWeek
    }
    normalize(draft, today)
  })
}

interface Found {
  today: { covered: number }
  rows: ScenarioRow[]
  combined: ScenarioRow[]
  figures: HouseholdFigures
  fullStatePension: boolean
}

const HELPS_MOST: Record<string, string> = {
  payMorePension: 'Paying more into a pension',
  startPension: 'Starting a pension',
  retirementAge: 'Retiring later',
  statePension: 'Counting your State Pension',
  saveMore: 'Saving more',
}

const byPoints = (a: ScenarioRow, b: ScenarioRow) => b.points - a.points
const retireAgeOf = (row: ScenarioRow) => (row.id === 'c65' ? 65 : 60)

function leverText(row: ScenarioRow, { today, rows, figures }: Found) {
  const at60 = rows.find((other) => other.id === 'retire60')
  const at65 = rows.find((other) => other.id === 'retire65')
  switch (row.lever) {
    case 'statePension':
      return {
        title: 'Check your State Pension',
        body: `Not confirmed, so the plan counts ${figures.statePensionShare > 0 ? 'only part of it' : '€0'}. A full one could lift cover from ${today.covered}% to about ${row.covered}%.`,
      }
    case 'startPension':
      return {
        title: figures.monthlyOwnPension > 0 ? 'Raise your pension' : 'Start a pension',
        body: `${euro(row.monthlyM!)} a month (about ${euro(row.afterReliefM!)} after tax relief) could lift cover to ${row.covered}%.`,
      }
    case 'retirementAge':
      return {
        title: 'Choose your retirement age',
        body:
          at60 && at65
            ? `Retire at 60 and cover reaches ${at60.covered}%. At 65, ${at65.covered}%.`
            : `${row.title} and cover reaches ${row.covered}%.`,
      }
    default:
      return {
        title: 'Save more each month',
        body: `About ${euro(row.amountM!)} more a month could lift cover to ${row.covered}%.`,
      }
  }
}

function closeTheGap(found?: Found) {
  if (!found) return { topThree: [], helpsMost: null, bestCovered: undefined, pathToExplore: null }
  const { today, rows, combined, fullStatePension } = found

  // the best change in each lever (paying more into a pension is shown with starting one)
  const bestPerLever = new Map<string, ScenarioRow>()
  for (const row of rows) {
    const best = bestPerLever.get(row.lever)
    if (row.lever !== 'payMorePension' && (!best || row.points > best.points))
      bestPerLever.set(row.lever, row)
  }
  const topThree = [...bestPerLever.values()]
    .filter((row) => row.points > 0)
    .sort(byPoints)
    .slice(0, 3)
    .map((row) => ({ lever: row.lever, points: row.points, ...leverText(row, found) }))

  const best = [...rows].sort(byPoints)[0]
  const helpsMost = best
    ? { text: `${HELPS_MOST[best.lever]} helps most`, points: best.points }
    : null
  const bestCombined = [...combined].sort((a, b) => b.covered - a.covered)[0]
  const bestCovered = bestCombined?.covered ?? best?.covered ?? today.covered
  if (!bestCombined) return { topThree, helpsMost, bestCovered, pathToExplore: null }

  const other = combined.find(
    (row) =>
      row.id !== bestCombined.id &&
      (row.id === 'c60') !== (bestCombined.id === 'c60') &&
      row.id !== 'c60more',
  )
  const gap =
    bestCombined.gapStartsAt != null
      ? `with a gap only from age ${bestCombined.gapStartsAt}`
      : 'with no gap'
  const text =
    `Retire at ${retireAgeOf(bestCombined)}, start a pension` +
    (fullStatePension ? '' : ' and check your State Pension record') +
    `: about ${bestCombined.covered}% covered, ${gap}.` +
    (other ? ` Retiring at ${retireAgeOf(other)} instead reaches ${other.covered}%.` : '')
  return { topThree, helpsMost, bestCovered, pathToExplore: { text } }
}

export function planScenarios(context: ReportContext) {
  const { plan, projection, figures: f, rows } = context
  const { percent } = projection
  const target = [...plan.goals].sort((a, b) => percent[a.id] - percent[b.id] || a.age - b.age)[0]
  const today = { covered: target ? percent[target.id] : 100, gapStartsAt: firstGapAge(rows) }
  const { fullStatePension } = context
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
