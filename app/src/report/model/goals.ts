// Each goal as the report tells it: covered percent, band and one sentence (pages 2 and 5).
import type { Goal } from '../../state/types.ts'
import { project } from '../../domain/planning/project.ts'
import { fundingOrder } from '../../domain/planning/fund.ts'
import { euro } from '../../lib/format.ts'
import { band, hasShortfall, type ReportContext } from './context.ts'
import type { Scenarios } from './scenarios.ts'
import { yearSplit } from '../../components/results/chart/cashflow.ts'

export type GoalSummary = ReturnType<typeof goalSummaries>[number]
export type YearsKind = 'gap' | 'savings' | 'income'

/** The smallest extra a month (to €5) that fully covers the goal, on top of a what-if for it. */
function extraToFullyCover({ plan }: ReportContext, goal: Goal) {
  const whatIf = plan.wi.g === goal.id ? plan.wi : { m: 0, l: 0 }
  const covers = (monthly: number) =>
    project(plan, { goalId: goal.id, monthly: (+whatIf.m || 0) + monthly, lumpSum: +whatIf.l || 0 })
      .percent[goal.id] >= 100
  if (!covers(5000)) return null
  let low = 0
  let high = 5000
  for (let step = 0; step < 13; step++) {
    const middle = (low + high) / 2
    if (covers(middle)) high = middle
    else low = middle
  }
  return Math.ceil(high / 5) * 5
}

/** Retirement years in runs: paid from income, from savings, or a gap. */
function retirementYears(context: ReportContext) {
  const rows = context.rows.filter((row) => row.retired)
  const kindOf = (row: (typeof rows)[number]): YearsKind =>
    hasShortfall(row) ? 'gap' : yearSplit(row).fromSavings > 0.5 ? 'savings' : 'income'
  const strip: { kind: YearsKind; from: number; to: number }[] = []
  for (const row of rows) {
    const last = strip.at(-1)
    if (last?.kind === kindOf(row)) last.to = row.age
    else strip.push({ kind: kindOf(row), from: row.age, to: row.age })
  }
  const total = (amount: (row: (typeof rows)[number]) => number) =>
    rows.reduce((sum, row) => sum + amount(row), 0)
  const gapYears = rows.filter(hasShortfall).length
  return {
    strip,
    years: rows.length,
    gapYears,
    fundedYears: rows.length - gapYears,
    costToday: total((row) => row.needs / context.prices(row)),
    gapToday: total((row) => row.shortfall / context.prices(row)),
    costFuture: total((row) => row.needs),
    gapFuture: total((row) => row.shortfall),
  }
}

export function goalSummaries(context: ReportContext, scenarios: Scenarios) {
  const { plan, projection, figures, endAge } = context
  const order = plan.rank
    ? fundingOrder(plan.goals, plan.rank)
    : [...plan.goals].sort((a, b) => a.age - b.age)
  const withFullStatePension =
    figures.statePensionShare >= 0.999
      ? null
      : ([...scenarios.rows, ...scenarios.combined].find((row) => row.id === 'statePension')
          ?.covered ?? null)

  return order.map((goal) => {
    const percent = projection.percent[goal.id]
    const summary = {
      id: goal.id,
      key: goal.k,
      kind: goal.kind,
      name: goal.name,
      age: goal.kind === 'legacy' ? endAge : goal.age,
      amount: goal.amount,
      pct: percent,
      band: band(percent),
      onTrack: percent >= 95,
    }
    if (goal.kind === 'retire') {
      const years = retirementYears(context)
      const statePension =
        figures.statePensionShare > 0 ? 'with your State Pension' : 'without a State Pension'
      const full =
        withFullStatePension != null && withFullStatePension > percent
          ? `, about ${withFullStatePension}% with the full one`
          : ''
      const paidFor = !years.years
        ? ''
        : years.gapYears === 0
          ? `Your plan pays for all ${years.years} retirement years.`
          : `Your savings pay for ${years.fundedYears} of ${years.years} retirement years.`
      return {
        ...summary,
        sentence: `${percent}% covered ${statePension}${full}. ${paidFor}`,
        retirement: years,
      }
    }
    const funding = projection.goals[goal.id]
    const puttingIn = funding?.averageMonthly ?? 0
    const extra = percent >= 100 ? null : extraToFullyCover(context, goal)
    const needs =
      percent >= 100
        ? puttingIn
        : extra != null
          ? puttingIn + extra
          : Math.max(funding?.neededMonthly ?? 0, puttingIn + 5)
    return {
      ...summary,
      sentence:
        percent >= 100
          ? 'Fully funded. Your income and savings cover it.'
          : `${percent}% covered. Needs about ${euro(needs)} a month; you are putting in about ${euro(puttingIn)}.`,
      monthly: { needsM: Math.round(needs), puttingInM: Math.round(puttingIn) },
    }
  })
}
