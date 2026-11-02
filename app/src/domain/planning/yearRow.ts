// One row of the projection table: what came in, what went out and what is left.
import type { Goal } from '../../state/types'
import type { GoalPot } from './fund'
import type { splitSpare, YearContext } from './fundYear'
import type { yearIncome } from './income'

interface RowParts {
  year: YearContext
  calendarYear: number
  income: ReturnType<typeof yearIncome>
  living: number
  repayments: number
  due: GoalPot[]
  split: ReturnType<typeof splitSpare>
  savings: number
  pension: number
  retireAge: number
  downsized: number
}

export function yearRow({
  year,
  calendarYear,
  income,
  living,
  repayments,
  due,
  split,
  ...rest
}: RowParts) {
  const goalGap = due.reduce((total, pot) => total + pot.cost - pot.paid, 0)
  return {
    index: year.index,
    age: year.age,
    year: calendarYear,
    ...income,
    living,
    repayments,
    needs: living + repayments,
    goalsDue: due.map(({ goal, cost, paid }) => ({ ...pick(goal), cost, paid })),
    goalCost: due.reduce((total, pot) => total + pot.cost, 0),
    goalGap,
    ...split,
    shortfall: split.livingShortfall + goalGap,
    liquid: rest.savings,
    pension: rest.pension,
    retired: !year.working,
    retiresThisYear: year.age === rest.retireAge,
    downsized: rest.downsized,
  }
}

const pick = ({ id, name, emoji, kind }: Goal) => ({ id, name, e: emoji, kind })
