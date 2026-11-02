import { band, yearBand } from '../../domain/planning/bands'
import { weather, type Chapter, type Weather } from '../../domain/planning/chapters'
import { euro } from '../../lib/format'
import type { Goal } from '../../state/types'
import Emo from '../ui/Emo'

interface Props {
  chapter: Chapter
  goals: Goal[]
  percent: Record<number, number>
  hasRetireGoal: boolean
  open: boolean
  onToggle: () => void
}

const WEATHER_ICON: Record<Weather, string> = { bad: '⛈️', warn: '🌦️', some: '🌤️', ok: '☀️' }
const TONE: Record<Weather, string> = { bad: 'bad', warn: 'warn', some: 'ok', ok: 'ok' }
const YEAR_COLOUR = { alert: 'var(--alert)', nudge: 'var(--nudge)', good: 'var(--good)' }
const YEAR_WORDS = { nudge: 'Using savings', good: 'Comfortable' }

function story({ kind, retired, shortYears, averageShort }: ReturnType<typeof weather>) {
  if (kind === 'bad')
    return (
      <>
        Short by about <b>{`${euro(averageShort)} a year`}</b>
        {` in ${shortYears} of these years.`}
      </>
    )
  if (retired) return 'Living on your pensions and savings, and they hold up.'
  if (kind === 'ok') return 'Income comfortably covers life.'
  return "Some years dip into savings. That's what they're for."
}

/** One decade of your future: its weather, its goals and, opened, its years. */
export default function ChapterCard({
  chapter,
  goals,
  percent,
  hasRetireGoal,
  open,
  onToggle,
}: Props) {
  const forecast = weather(chapter.rows)
  const { kind, retired } = forecast
  const due = goals.filter(
    (goal) => goal.kind !== 'retire' && goal.age >= chapter.from && goal.age <= chapter.to,
  )
  const retires = hasRetireGoal && chapter.rows.some((row) => row.retiresThisYear)
  const after = retired ? (hasRetireGoal ? ' · retired' : ' · after work') : ''
  return (
    <button
      className={`chap ${TONE[kind]}${open ? ' open' : ''}`}
      aria-expanded={open}
      onClick={onToggle}
    >
      <div className="w" aria-hidden="true">
        {WEATHER_ICON[kind]}
      </div>
      <div className="cb">
        <div className="tt">{`Your ${chapter.decade}s`}</div>
        <div className="ag">{`age ${chapter.from}–${chapter.to}${after}`}</div>
        <div className="st">{story(forecast)}</div>
        {retires || due.length > 0 ? (
          <div className="ev">
            {retires ? (
              <div>
                <span aria-hidden="true">🏁</span> <b>You retire</b>
              </div>
            ) : null}
            {due.map((goal) => (
              <div key={goal.id}>
                <Emo>{`${goal.emoji} ${goal.name} `}</Emo>
                <b
                  style={{ color: `var(--${band(percent[goal.id])}-t)` }}
                >{`${percent[goal.id]}%`}</b>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mo">{open ? '▲ Hide the years' : '▼ See it year by year'}</div>
        {open ? (
          <div className="ev">
            {chapter.rows.map((row) => {
              const year = yearBand(row)
              return (
                <div className="cy" key={row.age}>
                  <b style={{ width: 26 }}>{row.age}</b>
                  <span className="d" style={{ background: YEAR_COLOUR[year] }} />
                  {year === 'alert' ? (
                    <>
                      <b>Gap to plan for</b>
                      {`: short ${euro(row.shortfall)}`}
                    </>
                  ) : (
                    YEAR_WORDS[year]
                  )}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </button>
  )
}
