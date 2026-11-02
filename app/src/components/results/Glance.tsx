import { isShortYear } from '../../domain/planning/bands'
import type { project } from '../../domain/planning/project'
import { useViewport } from '../../hooks/useViewport'
import { clamp } from '../../lib/clamp'
import { useStore } from '../../state/store'
import type { Ui } from '../../state/types'
import Emo from '../ui/Emo'
import CashflowView from './chart/CashflowView'
import Chapters from './Chapters'
import JourneySvg from './JourneySvg'
import MilestoneList from './MilestoneList'

interface Props {
  /** the plan with the what-if applied */
  projection: ReturnType<typeof project>
}

const VIEWS = [
  { key: 'journey', label: '🛤️ Journey' },
  { key: 'chapters', label: '📖 Life chapters' },
  { key: 'detail', label: '📊 Detail' },
] as const

const KEY = [
  ['good', 'Income covers it'],
  ['nudge', 'Using savings'],
  ['alert', 'Shortfall'],
] as const

/** Your future at a glance: the journey road, life chapters or the year-by-year detail. */
export default function Glance({ projection }: Props) {
  const view = useStore((store) => store.resultsView)
  const goals = useStore((store) => store.plan.goals)
  const update = useStore((store) => store.update)
  // TODO(R-20): a named store action (setView) once the results slice exists
  const setView = (key: Ui['resultsView']) =>
    update((_, ui) => {
      ui.resultsView = key
    })
  const viewport = useViewport(false)
  const { landscape } = viewport
  const width = landscape ? clamp(viewport.width - 72, 322, 780) : 322
  const hasRetireGoal = goals.some((goal) => goal.kind === 'retire')
  const milestones = goals
    .filter((goal) => goal.kind !== 'retire')
    .toSorted((a, b) => a.age - b.age || a.id - b.id)
  const { rows, percent } = projection
  const shortYear = rows.find(isShortYear)
  const dueNames = shortYear?.goalsDue
    .map((goal) => goal.name)
    .join(' and ')
    .toLowerCase()

  return (
    <>
      <div className="vt" role="tablist" aria-label="Your future views">
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={view === key}
            className={view === key ? 'on' : ''}
            onClick={() => setView(key)}
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
            <JourneySvg
              rows={rows}
              milestones={milestones}
              percent={percent}
              width={width}
              landscape={landscape}
              hasRetireGoal={hasRetireGoal}
              hasShortYear={shortYear !== undefined}
            />
            {width > 500 ? null : <MilestoneList goals={milestones} percent={percent} />}
            <div className="jkey">
              {KEY.map(([tone, words]) => (
                <span key={tone}>
                  <i style={{ background: `var(--${tone})` }} />
                  {words}
                </span>
              ))}
            </div>
            {shortYear ? (
              <p className="pnote">
                ⛈️ Around <b>{`age ${shortYear.age}`}</b>
                {dueNames ? `, money for ${dueNames} falls short.` : ', your money falls short.'}
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
            <Chapters rows={rows} goals={goals} percent={percent} hasRetireGoal={hasRetireGoal} />
          </>
        ) : (
          <CashflowView rows={rows} />
        )}
      </div>
    </>
  )
}
