import type { HTMLAttributes, Ref } from 'react'
import clsx from 'clsx'
import { ageLimits } from '../../domain/goals/goals.ts'
import { calendarYear, inYears, isPassed, yearsAway } from '../../domain/goals/goalTiming.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import type { Goal } from '../../state/types.ts'

type Props = {
  goal: Goal
  highlighted: boolean
  dragging: boolean
  position?: { left: number; top: number }
  ref: Ref<HTMLDivElement>
} & HTMLAttributes<HTMLDivElement>

/** One goal on the timeline: a slider for its age. */
export default function TimelineChip({ goal, highlighted, dragging, position, ...props }: Props) {
  const plan = useTiming()
  const retire = goal.kind === 'retire'
  const { earliest, latest } = ageLimits(plan, goal)

  return (
    <div
      className={clsx('tl-chip', { ret: retire, hl: highlighted, drag: dragging })}
      data-g={goal.id}
      title={goal.name}
      tabIndex={0}
      role="slider"
      aria-label={goal.name}
      aria-valuemin={earliest}
      aria-valuemax={latest}
      aria-valuenow={goal.age}
      aria-valuetext={`${goal.name}, age ${goal.age}, ${calendarYear(plan, goal.age)}`}
      style={position}
      {...props}
    >
      {retire ? (
        <>
          <span aria-hidden="true">🏁</span>Retire{' '}
          <span className="yr">{plan.retireSet ? goal.age : '?'}</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">{goal.emoji}</span>
          <span className="nm">{goal.name}</span>
          <span className="yr">
            {isPassed(plan, goal) ? 'date passed' : inYears(yearsAway(plan, goal))}
          </span>
        </>
      )}
    </div>
  )
}
