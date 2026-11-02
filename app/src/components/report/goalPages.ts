// Goal cards per page: a card with a chart weighs 2.1, a plain one 1, and a page holds 3.2.
import type { ReportData } from '../../report/model/reportData.ts'

export type ReportGoal = ReportData['goalsDetail']['goals'][number]
export interface PlacedGoal {
  goal: ReportGoal
  weight: number
}

const PAGE_WEIGHT = 3.2

export function goalPages(goals: ReportGoal[]): PlacedGoal[][] {
  const pages: PlacedGoal[][] = [[]]
  let used = 0
  for (const goal of goals) {
    const weight =
      goal.bars?.type === 'retire' || ('years' in goal && goal.years.cells.length) ? 2.1 : 1
    if (pages.at(-1)!.length && used + weight > PAGE_WEIGHT) {
      pages.push([])
      used = 0
    }
    pages.at(-1)!.push({ goal, weight })
    used += weight
  }
  return pages
}
