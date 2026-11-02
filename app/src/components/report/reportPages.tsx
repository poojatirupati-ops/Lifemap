// The report's pages in order: cover, plan, money, roadmap, goals..., cashflow, scenarios,
// foundations, next steps, assumptions, appendix...
import type { ReactElement } from 'react'
import type { ReportData } from '../../report/model/reportData.ts'
import AppendixPage from './AppendixPage.tsx'
import AssumptionsPage from './AssumptionsPage.tsx'
import CashflowPage from './CashflowPage.tsx'
import CoverPage from './CoverPage.tsx'
import FoundationsPage from './FoundationsPage.tsx'
import GoalsPage, { type PlacedGoal, type ReportGoal } from './GoalsPage.tsx'
import MoneyPage from './MoneyPage.tsx'
import NextPage from './NextPage.tsx'
import type { PageProps } from './PageFrame.tsx'
import PlanPage from './PlanPage.tsx'
import RoadmapPage from './RoadmapPage.tsx'
import ScenariosPage from './ScenariosPage.tsx'

const APPENDIX_ROWS = 54

const PAGE_WEIGHT = 3.2

/** Goal cards per page: a card with a chart weighs 2.1, a plain one 1, and a page holds 3.2. */
function goalPages(goals: ReportGoal[]): PlacedGoal[][] {
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

/** One keyed element per A4 page. */
export function reportPages(data: ReportData) {
  const goals = goalPages(data.goalsDetail.goals)
  const { rows } = data.appendix
  const appendix = Array.from(
    { length: Math.max(1, Math.ceil(rows.length / APPENDIX_ROWS)) },
    (_, i) => rows.slice(i * APPENDIX_ROWS, (i + 1) * APPENDIX_ROWS),
  )
  const pages: ((props: PageProps) => ReactElement)[] = [
    CoverPage,
    PlanPage,
    MoneyPage,
    RoadmapPage,
    ...goals.map((placed, index) => (props: PageProps) => (
      <GoalsPage {...props} goals={placed} index={index} count={goals.length} />
    )),
    CashflowPage,
    ScenariosPage,
    FoundationsPage,
    NextPage,
    AssumptionsPage,
    ...appendix.map((chunk, index) => (props: PageProps) => (
      <AppendixPage {...props} rows={chunk} index={index} count={appendix.length} />
    )),
  ]
  return pages.map((Page, index) => (
    <Page key={index} data={data} page={index + 1} total={pages.length} />
  ))
}
