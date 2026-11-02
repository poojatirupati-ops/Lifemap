// How a goal is funded, in one line: fully, or what it needs a month against what it gets.
import { euro } from '../../lib/format'
import type { Goal } from '../../state/types'
import type { ProjectionInputs } from './planSettings'
import { project } from './project'
import type { WhatIf } from './wi'

const MOST_EXTRA = 5000

/** The smallest extra a month (to €5) that fully funds the goal, on top of its what-if; null past €5,000. */
export function extraToFullyFund(plan: ProjectionInputs, goal: Goal, whatIf: WhatIf) {
  const own = whatIf.goalId === goal.id ? whatIf : { monthly: 0, lumpSum: 0 }
  const funded = (extra: number) => {
    const tried = { goalId: goal.id, monthly: own.monthly + extra, lumpSum: own.lumpSum }
    return project(plan, tried).percent[goal.id] >= 100
  }
  if (!funded(MOST_EXTRA)) return null
  let low = 0
  let high = MOST_EXTRA
  for (let step = 0; step < 13; step++) {
    const middle = (low + high) / 2
    if (funded(middle)) high = middle
    else low = middle
  }
  return Math.ceil(high / 5) * 5
}

interface LineInputs {
  goal: Goal
  home: string | undefined
  covered: number
  averageMonthly: number
  neededMonthly: number
  spareMonthly: number
  /** from extraToFullyFund */
  extra: number | null
}

export function goalLineText(line: LineInputs) {
  const { goal, home, covered, averageMonthly, extra } = line
  if (goal.kind === 'mfree' && home && home !== 'Own with mortgage')
    return 'No mortgage in Your finances: remove this goal, or add your mortgage'
  const onAverage = `on average you'll put ${euro(averageMonthly)} a month`
  if (covered >= 100) return averageMonthly > 0 ? `Fully funded · ${onAverage}` : 'Fully funded'
  const need =
    extra != null ? averageMonthly + extra : Math.max(line.neededMonthly || 0, averageMonthly + 5)
  const tooMuch = extra == null || need > line.spareMonthly
  const more = tooMuch ? ', more than your spare money' : ''
  return `Needs about ${euro(need)} a month${more} · ${onAverage}`
}

/** The goal line's words for a goal in a projection; '' when the goal has no funding line. */
export function goalLineFor(
  plan: ProjectionInputs,
  projection: ReturnType<typeof project>,
  goal: Goal,
  whatIf: WhatIf,
) {
  const funding = projection.goals[goal.id]
  if (!funding) return ''
  const covered = projection.percent[goal.id]
  return goalLineText({
    goal,
    home: plan.figures.home,
    covered,
    averageMonthly: funding.averageMonthly,
    neededMonthly: funding.neededMonthly,
    spareMonthly: projection.saving.spareMonthly,
    extra: covered < 100 ? extraToFullyFund(plan, goal, whatIf) : null,
  })
}
