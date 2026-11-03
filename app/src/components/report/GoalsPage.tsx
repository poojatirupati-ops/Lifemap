// Report page 5 (as many pages as the goals need): your goals in detail. Each goal card shows how
// covered it is, what it needs against what goes in, and for retirement each year as funded, from
// savings or a gap.
import type { ReportData } from '../../report/model/reportData.ts'
import { clamp } from '../../lib/clamp.ts'
import { goalIconName } from './Icon.tsx'
import { CircleIcon, PageFrame, Photo, TitleBlock, type PageProps } from './PageFrame.tsx'
import { COLOURS, fillOf, textOf, tintOf } from './tones.ts'

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

// the need, behind what goes in
const NEED = '#9fd9d1'

function GoalCard({ goal, weight }: { goal: ReportGoal; weight: number }) {
  const tone = goal.band
  const rail = fillOf(tone)
  const covered = tone === 'good' ? COLOURS.teal : rail
  const { bars } = goal
  const retire = bars.type === 'retire' && 'costValue' in bars ? bars : null
  const saving = bars.type === 'saving' && 'needValue' in bars ? bars : null
  return (
    <div className="lmr-gcard gc2" style={{ flex: `${weight} 1 0` }}>
      <i className="gc2-tab" style={{ background: rail }}></i>
      <div className="gc2-top">
        <CircleIcon name={goalIconName(goal)} tone={tone} size={52} iconSize={26} />
        <div className="gc2-t">
          <div className="lmx-gn lmr-clamp2">{goal.name}</div>
          <div className="lmx-gm">{goal.meta}</div>
        </div>
        <div className="gc2-p">
          <div className="lmx-pc" style={{ color: textOf(tone) }}>
            {clamp(goal.pct, 0, 100)}%
          </div>
          <span className="gc2-chip" style={{ background: tintOf(tone), color: textOf(tone) }}>
            {goal.bandText}
          </span>
        </div>
      </div>
      <div className="lmx-gs">{goal.sentence}</div>
      {retire || saving || 'photo' in goal ? (
        <div className="gc2-mid">
          <div className="gc2-bars">
            {retire ? (
              <>
                <GoalBar
                  label="Retirement costs"
                  value={retire.costValue}
                  percent={100}
                  colour={NEED}
                />
                <GoalBar
                  label="Your plan covers"
                  value={retire.coverValue}
                  percent={retire.coverPct}
                  colour={covered}
                />
                <div className="lmr-note">{retire.note}</div>
              </>
            ) : null}
            {saving ? (
              <>
                <GoalBar
                  label="Needs a month"
                  value={saving.needValue}
                  percent={100}
                  colour={NEED}
                />
                <GoalBar
                  label="You’re putting in"
                  value={saving.putValue}
                  percent={saving.putPct}
                  colour={covered}
                />
              </>
            ) : null}
          </div>
          {'photo' in goal ? (
            <div className="lmx-ph">
              <Photo name={goal.photo} />
            </div>
          ) : null}
        </div>
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
