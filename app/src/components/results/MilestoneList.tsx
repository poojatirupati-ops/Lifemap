import type { CSSProperties } from 'react'
import type { Goal } from '../../state/types'
import { BAND_WORDS, band } from '../../domain/planning/bands'

interface Props {
  /** the milestones in age order */
  goals: Goal[]
  percent: Record<number, number>
}

/** On a phone, the journey's milestones as a list under the road. */
export default function MilestoneList({ goals, percent }: Props) {
  return (
    <div className="mlist">
      {goals.map((goal) => {
        const tone = band(percent[goal.id])
        return (
          <div className="ml-r" key={goal.id}>
            <span
              className="ml-e"
              style={{ '--c': `var(--${tone})` } as CSSProperties}
              aria-hidden="true"
            >
              {goal.emoji}
            </span>
            <span className="ml-m">
              <b>{goal.name}</b>
              <small>{`Age ${goal.age}`}</small>
            </span>
            <span className={`ml-p ${tone}`}>
              {`${percent[goal.id]}%`}
              <span className="sr">{` ${BAND_WORDS[tone]}`}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
