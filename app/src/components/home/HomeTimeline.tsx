import SeeLink from './SeeLink.tsx'
import { assumption } from '../../domain/planning/assumptions.ts'
import { euroShort } from '../../lib/format.ts'
import type { Goal } from '../../state/types.ts'
import { calendarYear, isPassed } from '../../domain/goals/goalTiming.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import { useFigures } from '../../hooks/useFigures.ts'

type Props = { byAge: Goal[]; profileAnswers: number }

/** Your Timeline card: total planned, the next four goals as stems by age, and three stats. */
export default function HomeTimeline({ byAge, profileAnswers }: Props) {
  useFigures()
  const timing = useTiming()
  const planEnd = assumption(timing, 'planEnd')
  // retirement income counts for every year to the end of the plan
  const total = (goal: Goal) =>
    (goal.amount || 0) * (goal.kind === 'retire' ? Math.max(1, planEnd - goal.age) : 1)
  const upcoming = byAge.filter((goal) => !isPassed(timing, goal)).slice(0, 4)
  const tallest = Math.max(1, ...upcoming.map(total))
  const next = upcoming[0]
  const profile = Math.round((profileAnswers / 13) * 100)

  return (
    <div className="card tlv">
      <div className="tlv-head">
        <div>
          <h3 className="h">Your Timeline</h3>
          <div className="small">Your goals by age</div>
        </div>
        <SeeLink section="timeline">Open ›</SeeLink>
      </div>
      <div className="tlv-body">
        <div className="tlv-sum">
          <b className="tlv-big">{euroShort(byAge.reduce((sum, goal) => sum + total(goal), 0))}</b>
          <span className="small">planned in total</span>
        </div>
        <div
          className="tlv-stems"
          role="img"
          aria-label={upcoming.map((goal) => `${goal.name} at age ${goal.age}`).join(', ')}
        >
          {upcoming.map((goal, index) => (
            <div key={goal.id} className={index === 0 ? 'tlv-col on' : 'tlv-col'}>
              {index === 0 && <span className="tlv-tag">{euroShort(total(goal))}</span>}
              <span
                className="tlv-stem"
                style={{ height: Math.round(30 + Math.sqrt(total(goal) / tallest) * 110) }}
              ></span>
              <span className="tlv-em" aria-hidden="true">
                {goal.emoji}
              </span>
              <span className="tlv-age">{goal.age}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="tlv-stats">
        <div>
          <span className="k">Profile</span>
          <b>
            {profile}
            <small>%</small>
          </b>
          <i className="tlv-bar">
            <i style={{ width: `${profile}%` }}></i>
          </i>
        </div>
        <div>
          <span className="k">Goals</span>
          <b>{byAge.length}</b>
          <span className="small">planned</span>
        </div>
        <div>
          <span className="k">Next goal</span>
          <b>{next ? calendarYear(timing, next.age) : '–'}</b>
          <span className="small">{next ? `at age ${next.age}` : 'none yet'}</span>
        </div>
      </div>
    </div>
  )
}
