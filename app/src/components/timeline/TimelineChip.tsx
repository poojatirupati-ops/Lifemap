import type { HTMLAttributes } from 'react'
import { latestRetirement } from './goalActions.ts'
import { calendarYear, inYears, isPassed, useTiming, yearsAway } from './goalText.ts'
import type { Goal } from '../../state/types.ts'

type Props = {
  goal: Goal
  highlighted: boolean
  dragging: boolean
  position?: { left: number; top: number }
} & HTMLAttributes<HTMLDivElement>

/** One goal on the timeline: a slider for its age. */
export default function TimelineChip({
  goal,
  highlighted,
  dragging,
  position,
  ...handlers
}: Props) {
  const plan = useTiming()
  const retire = goal.kind === 'retire'
  const ageNow = plan.about.age ?? 0
  const className = ['tl-chip', retire && 'ret', highlighted && 'hl', dragging && 'drag']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      data-g={goal.id}
      title={goal.name}
      tabIndex={0}
      role="slider"
      aria-label={goal.name}
      aria-valuemin={ageNow + 1}
      aria-valuemax={retire ? latestRetirement(plan) : 90}
      aria-valuenow={goal.age}
      aria-valuetext={`${goal.name}, age ${goal.age}, ${calendarYear(plan, goal.age)}`}
      style={position}
      {...handlers}
    >
      {retire ? (
        <>
          <span aria-hidden="true">🏁</span>Retire{' '}
          <span className="yr">{plan.retireSet ? goal.age : '?'}</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">{goal.e}</span>
          <span className="nm">{goal.name}</span>
          <span className="yr">
            {isPassed(plan, goal) ? 'date passed' : inYears(yearsAway(plan, goal))}
          </span>
        </>
      )}
    </div>
  )
}
