// Your financial foundations: five levels, bottom to top, read from the customer's own figures.
import { euro } from '../../lib/format.ts'
import { assumption } from './assumptions.ts'
import { hasFigure, tenths } from './foundationCheck.ts'
import type { Check, Foundation, FoundationInputs } from './foundationCheck.ts'
import { essentialMonthly, householdFigures, type HouseholdFigures } from './householdFigures.ts'
import type { project } from './project.ts'
import { debtAndProtection } from './protection.ts'
import { rulesFor } from './rates.ts'

type Projection = ReturnType<typeof project>

/** u14 (savings to fall back on) -> status, words and months */
const SAVINGS_ANSWER = [
  ['bad', 'Less than a month', 0.5],
  ['bad', '1 to 3 months', 2],
  ['mid', '3 to 6 months', 4.5],
  ['ok', '6 months or more', 6],
] as const

const isWeak = ({ status }: Check) => status === 'bad' || status === 'mid'

const isCovered = (projection: Projection, goalId: number) => projection.percent[goalId] >= 95

function spending(plan: FoundationInputs, projection: Projection): Check {
  const incomeKnown = hasFigure(plan, 'income') || plan.figures.work === 'Not working'
  if (!incomeKnown || !hasFigure(plan, 'costsM'))
    return { status: 'na', text: 'Add your income and spending to check this', section: 1 }
  const firstYear = projection.rows[0]
  const spare = Math.round((firstYear.inflow - firstYear.needs) / 12)
  const takeHome = Math.max(1, firstYear.inflow / 12)
  if (spare < 0)
    return { status: 'bad', text: `Spending about ${euro(-spare)} a month more than comes in` }
  return {
    status: spare < 0.05 * takeHome ? 'mid' : 'ok',
    text: `About ${euro(spare)} a month spare`,
  }
}

function savedMonths(
  plan: FoundationInputs,
  figures: HouseholdFigures,
): Check & Pick<Foundation, 'months'> {
  const target = assumption(plan, 'safetyMonths')
  const essential = essentialMonthly(figures)
  if (hasFigure(plan, 'cash') && hasFigure(plan, 'costsM') && essential > 0) {
    const months = figures.cash / essential
    if (months >= target) {
      const text = `${tenths(months)} months of essential spending · target of ${target} met`
      return { status: 'ok', text, months }
    }
    const text = `${tenths(months)} of ${target} months of essential spending`
    return { status: months >= 3 ? 'mid' : 'bad', text, months }
  }
  const answer = SAVINGS_ANSWER[plan.moneyProfile.answers.u14]
  if (!answer) return { status: 'na', text: 'Add your assets to check this', section: 2 }
  const [status, words, months] = answer
  return { status, text: `${words} of savings (your answer)`, months }
}

/** Saved months, or "in progress" when the plan's safety goal builds the fund in time. */
function emergencyFund(plan: FoundationInputs, figures: HouseholdFigures, projection: Projection) {
  const saved = savedMonths(plan, figures)
  const safetyGoal = plan.hasResults ? plan.goals.find((goal) => goal.key === 'safety') : undefined
  if (!safetyGoal || !isWeak(saved) || !isCovered(projection, safetyGoal.id)) return saved
  const year = assumption(plan, 'startYear') + safetyGoal.age - (plan.about.age ?? 0)
  return {
    ...saved,
    status: 'mid' as const,
    text: `${saved.text} · your plan builds it by ${year}`,
  }
}

function goalsAndRetirement(
  plan: FoundationInputs,
  figures: HouseholdFigures,
  projection: Projection,
): Check & Pick<Foundation, 'makePlan'> {
  if (!plan.hasResults) return { status: 'na', text: 'Make your plan to check this', makePlan: true }
  const goals = plan.goals.filter((goal) => goal.kind !== 'legacy')
  if (!goals.length) return { status: 'na', text: 'Add goals to check this' }
  const onTrack = goals.filter((goal) => isCovered(projection, goal.id)).length
  const low = goals.filter((goal) => projection.percent[goal.id] < 50).length
  const retirement = plan.goals.find((goal) => goal.kind === 'retire')
  const pensionUnderWay =
    figures.monthlyPension > 0 || (!!retirement && isCovered(projection, retirement.id))
  const allOnTrack = onTrack === goals.length && pensionUnderWay
  const status = low > goals.length / 2 ? 'bad' : allOnTrack ? 'ok' : 'mid'
  const pension = pensionUnderWay ? 'pension saving under way' : 'no pension saving yet'
  return { status, text: `${onTrack} of ${goals.length} goals on track · ${pension}` }
}

/** Never "needs attention": growing wealth is a choice, not a problem. */
function wealth(plan: FoundationInputs, figures: HouseholdFigures, projection: Projection): Check {
  const goals = plan.goals.filter((goal) => goal.key === 'wealth' || goal.kind === 'legacy')
  const onTrack = plan.hasResults ? goals.find((goal) => isCovered(projection, goal.id)) : undefined
  if (hasFigure(plan, 'invest') && figures.invest > 0) {
    const goal = onTrack ? ` · ${onTrack.name.toLowerCase()} on track` : ''
    return { status: 'ok', text: `Investing ${euro(figures.invest)}${goal}` }
  }
  if (onTrack) return { status: 'ok', text: `${onTrack.name} on track` }
  if (goals.length) return { status: 'mid', text: `${goals[0].name} not on track yet` }
  return { status: 'na', text: 'Not started yet' }
}

export function foundations(plan: FoundationInputs, projection: Projection): Foundation[] {
  const figures = householdFigures(plan, rulesFor(assumption(plan, 'startYear')))
  const levels: Foundation[] = [
    { level: 1, emoji: '💶', name: 'Spend less than you earn', ...spending(plan, projection) },
    { level: 2, emoji: '🪂', name: 'Emergency fund', ...emergencyFund(plan, figures, projection) },
    {
      level: 3,
      emoji: '🛡️',
      name: 'Clear costly debt & protect your family',
      ...debtAndProtection(plan, figures),
    },
    {
      level: 4,
      emoji: '🎯',
      name: 'Goals & retirement',
      ...goalsAndRetirement(plan, figures, projection),
    },
    { level: 5, emoji: '🌳', name: 'Grow wealth & legacy', ...wealth(plan, figures, projection) },
  ]

  // no "Solid" above a weaker level
  return levels.map((level, index) =>
    level.status === 'ok' && levels.slice(0, index).some(isWeak)
      ? { ...level, status: 'held', text: `${level.text} · strengthen your foundations first` }
      : level,
  )
}
