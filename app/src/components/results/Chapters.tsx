import { band, yearBand } from '../../domain/planning/bands'
import { byDecade, weather, type Weather } from '../../domain/planning/chapters'
import type { YearRow } from '../../domain/planning/project'
import { euro } from '../../lib/format'
import { useStore } from '../../state/store'
import type { Goal } from '../../state/types'
import Emo from '../ui/Emo'

interface Props {
  rows: YearRow[]
  goals: Goal[]
  percent: Record<number, number>
  hasRetireGoal: boolean
}

const WEATHER_ICON: Record<Weather, string> = { bad: '⛈️', warn: '🌦️', some: '🌤️', ok: '☀️' }
const TONE: Record<Weather, string> = { bad: 'bad', warn: 'warn', some: 'ok', ok: 'ok' }
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

/** Your future as decades: the weather of each, its goals, and its years on demand. */
export default function Chapters({ rows, goals, percent, hasRetireGoal }: Props) {
  const open = useStore((store) => store.openChapter)
  const toggle = useStore((store) => store.toggleChapter)

  return (
    <div className="chapgrid">
      {byDecade(rows).map((chapter, index) => {
        const forecast = weather(chapter.rows)
        const { kind, retired } = forecast
        const isOpen = open === index
        const due = goals.filter(
          (goal) => goal.kind !== 'retire' && goal.age >= chapter.from && goal.age <= chapter.to,
        )
        const retires = hasRetireGoal && chapter.rows.some((row) => row.retiresThisYear)
        const after = retired ? (hasRetireGoal ? ' · retired' : ' · after work') : ''
        return (
          <button
            key={chapter.decade}
            className={`chap ${TONE[kind]}${isOpen ? ' open' : ''}`}
            aria-expanded={isOpen}
            onClick={() => toggle(index)}
          >
            <div className="w" aria-hidden="true">
              {WEATHER_ICON[kind]}
            </div>
            <div className="cbd">
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
              <div className="mo">{isOpen ? '▲ Hide the years' : '▼ See it year by year'}</div>
              {isOpen ? (
                <div className="ev">
                  {chapter.rows.map((row) => {
                    const year = yearBand(row)
                    return (
                      <div className="cy" key={row.age}>
                        <b style={{ width: 26 }}>{row.age}</b>
                        <span className="d" style={{ background: `var(--${year})` }} />
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
      })}
    </div>
  )
}
