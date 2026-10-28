import type { YearRow } from '../../domain/planning/project'
import { euro } from '../../lib/format'
import { useStore } from '../../state/store'
import type { Goal } from '../../state/types'
import Emo from '../ui/Emo'
import { band, isShortYear, yearBand } from './journey'

interface Props {
  rows: YearRow[]
  goals: Goal[]
  percent: Record<number, number>
  hasRetireGoal: boolean
}

interface Chapter {
  decade: number
  from: number
  to: number
  rows: YearRow[]
}

/** The plan years by decade; a lone year at 90 joins the 80s. */
function byDecade(rows: YearRow[]) {
  const chapters: Chapter[] = []
  for (const row of rows) {
    let decade = Math.floor(row.age / 10) * 10
    if (decade === 90 && chapters.length) decade = 80
    const last = chapters.at(-1)
    if (last?.decade === decade) {
      last.to = row.age
      last.rows.push(row)
    } else chapters.push({ decade, from: row.age, to: row.age, rows: [row] })
  }
  return chapters
}

type Kind = 'bad' | 'warn' | 'some' | 'ok'
const WEATHER: Record<Kind, string> = { bad: '⛈️', warn: '🌦️', some: '🌤️', ok: '☀️' }
const TONE: Record<Kind, string> = { bad: 'bad', warn: 'warn', some: 'ok', ok: 'ok' }
const YEAR_COLOUR = { alert: 'var(--alert)', nudge: 'var(--nudge)', good: 'var(--good)' }

function weather({ rows }: Chapter) {
  const short = rows.filter(isShortYear)
  const dips = rows.filter((row) => yearBand(row) === 'nudge').length
  const retired = rows.every((row) => row.retired)
  const kind: Kind = short.length ? 'bad' : dips > rows.length / 3 ? 'warn' : dips ? 'some' : 'ok'
  const story = short.length ? (
    <>
      Short by about{' '}
      <b>{`${euro(short.reduce((sum, row) => sum + row.shortfall, 0) / short.length)} a year`}</b>
      {` in ${short.length} of these years.`}
    </>
  ) : retired ? (
    'Living on your pensions and savings, and they hold up.'
  ) : dips ? (
    "Some years dip into savings. That's what they're for."
  ) : (
    'Income comfortably covers life.'
  )
  return { kind, story, retired }
}

/** Your future as decades: the weather of each, its goals, and its years on demand. */
export default function Chapters({ rows, goals, percent, hasRetireGoal }: Props) {
  // TODO(R-20): Plan types chapOpen as string; the original stores the chapter's index
  const open = useStore((store) => store.plan.chapOpen) as number | null
  const update = useStore((store) => store.update)
  const toggle = (index: number) =>
    update((plan) => {
      plan.chapOpen = (open === index ? null : index) as never
    })

  return (
    <div className="chapgrid">
      {byDecade(rows).map((chapter, index) => {
        const { kind, story, retired } = weather(chapter)
        const isOpen = open === index
        const due = goals.filter(
          (g) => g.kind !== 'retire' && g.age >= chapter.from && g.age <= chapter.to,
        )
        const retires = hasRetireGoal && chapter.rows.some((row) => row.retiresThisYear)
        const hasEvents = retires || due.length > 0
        const after = retired ? (hasRetireGoal ? ' · retired' : ' · after work') : ''
        return (
          <button
            key={chapter.decade}
            className={`chap ${TONE[kind]}${isOpen ? ' open' : ''}`}
            aria-expanded={isOpen}
            onClick={() => toggle(index)}
          >
            <div className="w" aria-hidden="true">
              {WEATHER[kind]}
            </div>
            <div className="cb">
              <div className="tt">{`Your ${chapter.decade}s`}</div>
              <div className="ag">{`age ${chapter.from}–${chapter.to}${after}`}</div>
              <div className="st">{story}</div>
              {hasEvents && (
                <div className="ev">
                  {retires && (
                    <div>
                      <span aria-hidden="true">🏁</span> <b>You retire</b>
                    </div>
                  )}
                  {due.map((goal) => (
                    <div key={goal.id}>
                      <Emo>{`${goal.e} ${goal.name} `}</Emo>
                      <b
                        style={{ color: `var(--${band(percent[goal.id])}-t)` }}
                      >{`${percent[goal.id]}%`}</b>
                    </div>
                  ))}
                </div>
              )}
              <div className="mo">{isOpen ? '▲ Hide the years' : '▼ See it year by year'}</div>
              {isOpen && (
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
                        ) : year === 'nudge' ? (
                          'Using savings'
                        ) : (
                          'Comfortable'
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
