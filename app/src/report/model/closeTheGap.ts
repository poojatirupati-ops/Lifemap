// The changes worth naming: the best per lever (page 2), what helps most and a path to explore (page 7).
import { euro } from '../../lib/format.ts'
import type { HouseholdFigures } from '../../domain/planning/householdFigures.ts'
import type { ScenarioRow } from './scenarios.ts'

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

export function closeTheGap(found?: Found) {
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
