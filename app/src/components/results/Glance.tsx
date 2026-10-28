import type { project } from '../../domain/planning/project'
import { useViewport } from '../../hooks/useViewport'
import { useStore } from '../../state/store'
import Emo from '../ui/Emo'
import CashflowView from './chart/CashflowView'
import Chapters from './Chapters'
import JourneySvg from './JourneySvg'
import { isShortYear } from './journey'

interface Props {
  /** the plan with the what-if applied */
  projection: ReturnType<typeof project>
}

const VIEWS = [
  { key: 'journey', label: '🛤️ Journey' },
  { key: 'chapters', label: '📖 Life chapters' },
  { key: 'detail', label: '📊 Detail' },
]

/** Your future at a glance: the journey road, life chapters or the year-by-year detail. */
export default function Glance({ projection }: Props) {
  const view = useStore((store) => store.plan.view)
  const goals = useStore((store) => store.plan.goals)
  const update = useStore((store) => store.update)
  const { landscape } = useViewport(false)
  const width = landscape ? Math.max(322, Math.min(780, innerWidth - 72)) : 322
  const hasRetireGoal = goals.some((goal) => goal.kind === 'retire')
  const { rows, percent } = projection
  const shortYear = rows.find(isShortYear)

  return (
    <>
      <div className="vt" role="tablist" aria-label="Your future views">
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={view === key}
            className={view === key ? 'on' : ''}
            onClick={() => update((plan) => void (plan.view = key))}
          >
            <Emo>{label}</Emo>
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {view === 'journey' ? (
          <>
            <p className="small">
              Your life as one road, from today to age 90. The milestones are the goals you chose.
            </p>
            <JourneySvg {...{ rows, goals, percent, width, landscape, hasRetireGoal }} />
            <div className="jkey">
              <span>
                <i style={{ background: 'var(--good)' }} />
                Income covers it
              </span>
              <span>
                <i style={{ background: 'var(--nudge)' }} />
                Using savings
              </span>
              <span>
                <i style={{ background: 'var(--alert)' }} />
                Shortfall
              </span>
            </div>
            {shortYear ? (
              <p className="pnote">
                ⛈️ Around <b>{`age ${shortYear.age}`}</b>
                {shortYear.dueNames.length
                  ? `, money for ${shortYear.dueNames.join(' and ').toLowerCase()} falls short.`
                  : ', your money falls short.'}
              </p>
            ) : (
              <p className="pnote">☀️ Every year of your road is covered.</p>
            )}
          </>
        ) : view === 'chapters' ? (
          <>
            <p className="small">
              Your future as chapters of your life. ☀️ comfortable · 🌤️ some years use savings · 🌦️
              often using savings · ⛈️ a gap to plan for. Tap a chapter to see its years.
            </p>
            <Chapters {...{ rows, goals, percent, hasRetireGoal }} />
          </>
        ) : (
          <CashflowView rows={rows} />
        )}
      </div>
    </>
  )
}
