// The report's pages in order: cover, plan, money, roadmap, goals..., cashflow, scenarios,
// foundations, next steps, assumptions, appendix...
import { Fragment, type ReactElement } from 'react'
import type { ReportData } from '../../report/model/reportData.ts'
import AppendixPage from './AppendixPage.tsx'
import AssumptionsPage from './AssumptionsPage.tsx'
import CashflowPage from './CashflowPage.tsx'
import CoverPage from './CoverPage.tsx'
import FoundationsPage from './FoundationsPage.tsx'
import GoalsPage from './GoalsPage.tsx'
import MoneyPage from './MoneyPage.tsx'
import NextPage from './NextPage.tsx'
import type { PageProps } from './PageFrame.tsx'
import PlanPage from './PlanPage.tsx'
import RoadmapPage from './RoadmapPage.tsx'
import ScenariosPage from './ScenariosPage.tsx'
import { goalPages } from './goalPages.ts'

const APPENDIX_ROWS = 54

/** One keyed element per A4 page. */
export function reportPages(data: ReportData) {
  const goals = goalPages(data.goalsDetail.goals)
  const { rows } = data.appendix
  const appendix = Array.from(
    { length: Math.max(1, Math.ceil(rows.length / APPENDIX_ROWS)) },
    (_, i) => rows.slice(i * APPENDIX_ROWS, (i + 1) * APPENDIX_ROWS),
  )
  const pages: ((props: PageProps) => ReactElement)[] = [
    (props) => <CoverPage {...props} />,
    (props) => <PlanPage {...props} />,
    (props) => <MoneyPage {...props} />,
    (props) => <RoadmapPage {...props} />,
    ...goals.map((placed, index) => (props: PageProps) => (
      <GoalsPage {...props} goals={placed} index={index} count={goals.length} />
    )),
    (props) => <CashflowPage {...props} />,
    (props) => <ScenariosPage {...props} />,
    (props) => <FoundationsPage {...props} />,
    (props) => <NextPage {...props} />,
    (props) => <AssumptionsPage {...props} />,
    ...appendix.map((chunk, index) => (props: PageProps) => (
      <AppendixPage {...props} rows={chunk} index={index} count={appendix.length} />
    )),
  ]
  return pages.map((page, index) => (
    <Fragment key={index}>{page({ data, page: index + 1, total: pages.length })}</Fragment>
  ))
}
