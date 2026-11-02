// Report page 5 (as many pages as the goals need): your goals in detail. Each goal card shows how
// covered it is, what it needs against what goes in, and for retirement each year as funded, from
// savings or a gap.
import type { ReportData } from '../../report/model/reportData.ts'
import { clamp } from '../../lib/clamp.ts'
import { goalIconName } from './Icon.tsx'
import { BandChip, CircleIcon, PageFrame, Photo, TitleBlock, type PageProps } from './PageFrame.tsx'
import { COLOURS, fillOf, textOf } from './tones.ts'

export type ReportGoal = ReportData['goalsDetail']['goals'][number]
export interface PlacedGoal {
  goal: ReportGoal
  weight: number
}

interface GoalBarProps {
  label: string
  value: string
  percent: number
  colour: string
}

/** "Retirement costs  about €1.2m" over a filled track. */
function GoalBar({ label, value, percent, colour }: GoalBarProps) {
  return (
    <div className="lmr-bar">
      <div className="lmx-t">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="lmr-track">
        <div
          className="lmr-fill"
          style={{ width: `${clamp(percent, 0, 100)}%`, background: colour }}
        ></div>
      </div>
    </div>
  )
}

const CELL_COLOURS: Record<string, string> = {
  pension: COLOURS.tealMid,
  savings: COLOURS.gold,
  gap: COLOURS.coral,
}

function GoalCard({ goal, weight }: { goal: ReportGoal; weight: number }) {
  const tone = goal.band
  const rail = fillOf(tone)
  const covered = tone === 'good' ? COLOURS.teal : rail
  const { bars } = goal
  return (
    <div className="lmr-gcard" style={{ flex: `${weight} 1 0` }}>
      <div className="lmx-rl" style={{ background: rail }}></div>
      <div className="lmx-l">
        <CircleIcon name={goalIconName(goal)} tone={tone} size={46} iconSize={24} />
        <div className="lmx-pc" style={{ color: textOf(tone) }}>
          {clamp(goal.pct, 0, 100)}%
        </div>
        <BandChip tone={tone} text={goal.bandText} />
      </div>
      <div className="lmx-rr2">
        <div className="lmx-top">
          <div>
            <div className="lmx-gn lmr-clamp2">{goal.name}</div>
            <div className="lmx-gm">{goal.meta}</div>
            <div className="lmx-gs">{goal.sentence}</div>
          </div>
          {'photo' in goal ? (
            <div className="lmx-ph">
              <Photo name={goal.photo} />
            </div>
          ) : null}
        </div>
        {bars.type === 'retire' && 'costValue' in bars ? (
          <>
            <GoalBar
              label="Retirement costs"
              value={bars.costValue}
              percent={100}
              colour={COLOURS.navy}
            />
            <GoalBar
              label="Your plan covers"
              value={bars.coverValue}
              percent={bars.coverPct}
              colour={covered}
            />
            <div className="lmr-note">{bars.note}</div>
          </>
        ) : null}
        {bars.type === 'saving' && 'needValue' in bars ? (
          <>
            <GoalBar
              label="Needs a month"
              value={bars.needValue}
              percent={100}
              colour={COLOURS.navy}
            />
            <GoalBar
              label="You’re putting in"
              value={bars.putValue}
              percent={bars.putPct}
              colour={covered}
            />
          </>
        ) : null}
        {'years' in goal && goal.years.cells.length ? (
          <div className="lmr-yrs">
            <div className="lmx-t">
              <span>Your retirement years</span>
              <span>{goal.years.summary}</span>
            </div>
            <div
              className="lmr-cells"
              role="img"
              aria-label={`Your retirement years: ${goal.years.summary}`}
            >
              {goal.years.cells.map((cell) => (
                <i key={cell.age} style={{ background: CELL_COLOURS[cell.state] ?? '#e3e8ed' }}></i>
              ))}
            </div>
            <div className="lmx-lb">
              <span style={{ color: COLOURS.goldText }}>{goal.years.leftLabel}</span>
              <span style={{ color: COLOURS.coralText }}>{goal.years.rightLabel}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export interface GoalsPageProps extends PageProps {
  goals: PlacedGoal[]
  /** this goals page's index and how many goals pages there are */
  index: number
  count: number
}

export default function GoalsPage({ goals, index, count, ...frame }: GoalsPageProps) {
  const detail = frame.data.goalsDetail
  const part = count > 1 ? ` (${index + 1} of ${count})` : ''
  return (
    <PageFrame {...frame} label={`Your goals in detail${part}`}>
      <div className="lmr-body">
        <TitleBlock {...detail} eyebrow="YOUR GOALS IN DETAIL" />
        {goals.length ? null : (
          <p className="lmr-lead" style={{ marginTop: 24 }}>
            No goals yet. Add a goal in the app and it appears here.
          </p>
        )}
        <div className="lmr-gcards">
          {goals.map(({ goal, weight }) => (
            <GoalCard key={goal.name} goal={goal} weight={goals.length === 1 ? 1 : weight} />
          ))}
        </div>
        {index === count - 1 ? (
          <div className="lmr-how">
            <b>How to read this page.</b> <b>Today’s money</b> shows what things cost now;{' '}
            <b>future euros</b> add price rises. <b>Covered</b> is how much of a goal’s cost your
            income and savings meet: 100% is fully covered, 5% leaves about 95% to plan for.
          </div>
        ) : null}
      </div>
    </PageFrame>
  )
}
