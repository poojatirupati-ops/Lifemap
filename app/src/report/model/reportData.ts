// Every number, sentence and chart series of the plan report (schema 1.0.0, docs/report-data.schema.json).
import type { Plan } from '../../state/types.ts'
import { reportContext } from './context.ts'
import { planMissing } from './readiness.ts'
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
const curly = (value: unknown): unknown =>
  typeof value === 'string'
    ? value.replace(/(\w)'(\w)/g, '$1’$2')
    : Array.isArray(value)
      ? value.map(curly)
      : value && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, curly(item)]))
        : value

/** The report's data, or what is still missing before it can be built. Expects a normalized plan. */
export function reportData(plan: Plan, today: Date) {
  const missing = planMissing(plan)
  if (missing.length) return { ready: false as const, missing }
  const context = reportContext(plan, today)
  const scenarios = planScenarios(context)
  const goals = goalSummaries(context, scenarios)
  return curly({
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
  }) as ReportData
}

// ponytail: the renderer validates nothing and reads it loosely; type it when a screen reads fields
export type ReportData = Record<string, any>
