import { Fragment } from 'react'
import { setGoalDetail } from './goalActions.ts'
import type { Goal } from '../../state/types.ts'

const DETAILS = [
  { field: 'who', label: 'For whom', options: ['Me', 'Partner', 'Child', 'Family'] },
  { field: 'flex', label: 'Flexible on timing?', options: ['Can move', 'Fixed date'] },
] as const

/** "More details": who the goal is for and whether its timing can move. */
export default function GoalDetails({ goal }: { goal: Goal }) {
  return (
    <div className="more">
      {DETAILS.map(({ field, label, options }) => (
        <Fragment key={field}>
          <div className="fl" style={{ marginTop: 6 }}>
            {label}
          </div>
          <div className="chips">
            {options.map((option) => {
              const selected = goal[field] === option
              return (
                <button
                  key={option}
                  className={selected ? 'chip sm sel' : 'chip sm'}
                  aria-pressed={selected}
                  onClick={() => setGoalDetail(goal.id, field, option)}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
