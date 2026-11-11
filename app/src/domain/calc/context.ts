// What a calculator reads from the plan: the plan fields every tool shares plus this tool's own entries.
import { assumption } from '../planning/assumptions.ts'
import { valueInUse, type AssumptionPlan } from '../planning/assumptionText.ts'
import { rulesFor } from '../planning/rates.ts'
import type { Plan, Ui } from '../../state/types.ts'
import type { CalcContext, PensionStatement } from './types.ts'

/** The plan fields a tool reads, selected one by one so a tool re-renders only when these change. */
const SHARED_KEYS = [
  // the projection and household figures (knownFigures' planSettings and take-home pay)
  'about',
  'partner',
  'figures',
  'sources',
  'lists',
  'goals',
  'rank',
  'answers',
  'monthlySaving',
  'savingAtRule',
  'pensionExtra',
  'partnerRetireAge',
  'partnerRetireSet',
  // the budget checks the everyday tools read (CheckPlan)
  'warnings',
  'acknowledged',
  'savedSections',
  // assumptions, inflation and the retirement age
  'assumptions',
  'assumptionSet',
  'inflation',
  'retireAge',
  'retireSet',
  // statements, the plan made, tool-local picks and switches
  'statements',
  'hasResults',
  'toolPick',
] as const satisfies readonly (keyof Plan)[]

export type ToolPlan = Pick<Plan, (typeof SHARED_KEYS)[number]> &
  Pick<Ui, 'editingInflation' | 'todaysMoney'> & {
    /** The inputs the customer moved in this tool: theirs from then on. */
    moved: Record<string, boolean>
    /** The figures they moved or typed. */
    stored: Record<string, number>
    /** A confirmed statement's figures for this tool, and the keys tagged "From your statement". */
    statementFigures: Record<string, number>
    statementKeys: string[]
  }

// the same empty object every time, so a selector's shallow compare stays equal
const NONE: Record<string, never> = Object.freeze({})
const NO_KEYS: string[] = []

export const toolPlan = (plan: Plan, ui: Ui, toolId: string): ToolPlan => ({
  ...(Object.fromEntries(SHARED_KEYS.map((key) => [key, plan[key]])) as Pick<
    Plan,
    (typeof SHARED_KEYS)[number]
  >),
  editingInflation: ui.editingInflation,
  todaysMoney: ui.todaysMoney,
  moved: plan.calcTouched[toolId] ?? NONE,
  stored: plan.calcValues[toolId] ?? NONE,
  statementFigures: plan.calcStatementFigures[toolId] ?? NONE,
  statementKeys: plan.calcStatementKeys[toolId] ?? NO_KEYS,
})

/** A "Your assumptions" value: the customer's choice, else the growth set, the standard or a planning figure. */
export const assumptionValue = (plan: AssumptionPlan, key: string): number | string =>
  ['planEnd', 'startYear'].includes(key) ? assumption(plan, key) : (valueInUse(plan, key) ?? 0)

export function calcContext(plan: ToolPlan, toolId: string): CalcContext {
  const value = (key: string) => assumptionValue(plan, key)
  const statedPayment = Number(plan.figures.mortPayM)
  return {
    rules: rulesFor(Number(value('startYear'))),
    inflation: plan.inflation,
    wage: Number(value('wage')),
    cash: Number(value('cash')),
    planEnd: Number(value('planEnd')),
    assumption: value,
    statedMortgagePayment:
      plan.sources.mortPayM && statedPayment > 0
        ? {
            amount: statedPayment,
            from: plan.sources.mortPayM === 'doc' ? 'your statement' : 'your figures',
          }
        : null,
    untouched: (keys) => !keys.some((key) => plan.moved[key]),
    pensionStatement: (plan.statements.retire?.figures as PensionStatement | undefined) ?? null,
    adjustForInflation: !!plan.todaysMoney?.[toolId],
    safetyMonths: Number(value('safetyMonths')),
  }
}
