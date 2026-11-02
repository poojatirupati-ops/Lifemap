// Every number, sentence and chart series of the plan report (schema 1.0.0, docs/report-data.schema.json).
import type { Plan } from '../../state/types.ts'
import { reportContext } from './context.ts'
import { planMissing } from '../../domain/plan/readiness.ts'
import { planScenarios } from './scenarios.ts'
import { scenariosPage } from './scenariosPage.ts'
import { goalSummaries } from './goals.ts'
import { coverPages } from './coverPage.ts'
import { planPage } from './planPage.ts'
import { moneyPage } from './moneyPage.ts'
import { roadmapPage } from './roadmapPage.ts'
import { goalsPage } from './goalsPage.ts'
import { cashflowPage } from './cashflowPage.ts'
import { foundationsPage } from './foundationsPage.ts'
import { nextPage } from './nextPage.ts'
import { assumptionsPages } from './assumptionsPage.ts'

/** Typographic apostrophes in every display string. */
function curly<T>(value: T): T {
  if (typeof value === 'string') return value.replace(/(\w)'(\w)/g, '$1’$2') as T
  if (Array.isArray(value)) return value.map(curly) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, curly(item)])) as T
  return value
}

/** The report's data, or what is still missing before it can be built. Expects a normalized plan. */
export function reportData(plan: Plan, today: Date) {
  const missing = planMissing(plan)
  if (missing.length) return { ready: false as const, missing }
  const context = reportContext(plan, today)
  const scenarios = planScenarios(context)
  const goals = goalSummaries(context, scenarios)
  return curly({
    ready: true as const,
    schemaVersion: '1.0.0',
    ...coverPages(context, goals),
    plan: planPage(context, goals, scenarios),
    money: moneyPage(context),
    roadmap: roadmapPage(context),
    goalsDetail: goalsPage(context, goals),
    cashflow: cashflowPage(context),
    scenarios: scenariosPage(context, scenarios),
    foundations: foundationsPage(context),
    next: nextPage(context),
    ...assumptionsPages(context),
  })
}

export type ReportData = Exclude<ReturnType<typeof reportData>, { ready: false }>
