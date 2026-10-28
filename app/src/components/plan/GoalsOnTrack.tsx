import { missingChoices } from '../finance/requiredChoices.ts'
import { fixChoice, showSection } from './planActions.ts'
import { useProjection } from './useProjection.ts'

/** Under the timeline: how many goals are on track, or what is needed before results show. */
export default function GoalsOnTrack() {
  const { plan, base } = useProjection()
  const missing = missingChoices(plan)
  if (missing.length) {
    const one = missing.length === 1
    return (
      <div className="card row" id="tl-strip" style={{ background: 'var(--sea-l)' }}>
        <div style={{ flex: 1 }}>
          <b>
            To see your results we need {missing.length}
            {one ? ' thing' : ' things'}
          </b>
          <div className="small" style={{ color: 'var(--ink)' }}>
            Your goals' progress shows once {one ? 'it is' : 'they are'} chosen.
          </div>
        </div>
        <button className="btn sm" data-a="gofix" data-p={missing[0].key} onClick={fixChoice}>
          Choose
        </button>
      </div>
    )
  }

  const total = plan.goals.length
  const onTrack = plan.goals.filter((goal) => base.percent[goal.id] >= 95).length
  return (
    <div className="card tls" id="tl-strip">
      <div className="tls-m">
        <b>
          {onTrack} of {total} goals on track
        </b>
        <span className="tls-bar">
          <i style={{ width: `${Math.round((onTrack / Math.max(1, total)) * 100)}%` }}></i>
        </span>
        <small>Updates as you move your goals</small>
      </div>
      <button
        className="tls-go"
        data-a="seg"
        data-p="results"
        onClick={() => showSection('results')}
      >
        Results ↓
      </button>
    </div>
  )
}
