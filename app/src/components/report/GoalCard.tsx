// One goal on the goals pages: how covered it is, what it needs against what goes in, and for
// retirement each year as funded, from savings or a gap.
import BandChip from './BandChip.tsx'
import CircleIcon from './CircleIcon.tsx'
import GoalBar from './GoalBar.tsx'
import { goalIconName } from './Icon.tsx'
import Photo from './Photo.tsx'
import type { ReportGoal } from './goalPages.ts'
import { COLOURS, bandTone, clampPercent, fillOf, textOf } from './tones.ts'

const CELL_COLOURS: Record<string, string> = {
  pension: COLOURS.tealMid,
  savings: COLOURS.gold,
  gap: COLOURS.coral,
}

export default function GoalCard({ goal, weight }: { goal: ReportGoal; weight: number }) {
  const tone = bandTone(goal.band)
  const rail = tone === 'good' ? COLOURS.tealMid : fillOf(tone)
  const covered = tone === 'good' ? COLOURS.teal : rail
  const { bars } = goal
  return (
    <div className="lmr-gcard" style={{ flex: `${weight} 1 0` }}>
      <div className="lmx-rl" style={{ background: rail }}></div>
      <div className="lmx-l">
        <CircleIcon name={goalIconName(goal)} tone={tone} size={46} iconSize={24} />
        <div className="lmx-pc" style={{ color: textOf(tone) }}>
          {clampPercent(goal.pct)}%
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
