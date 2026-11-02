// One goal on the plan page: icon, name, when and how much, a covered bar and the band.
import type { ReportData } from '../../report/model/reportData.ts'
import BandChip from './BandChip.tsx'
import CircleIcon from './CircleIcon.tsx'
import { goalIconName } from './Icon.tsx'
import { COLOURS, bandTone, clampPercent, fillOf, textOf } from './tones.ts'

type PlanGoal = ReportData['plan']['goals'][number]

export default function PlanGoalRow({ goal, compact }: { goal: PlanGoal; compact: boolean }) {
  const tone = bandTone(goal.band)
  const percent = clampPercent(goal.pct)
  return (
    <div className={compact ? 'lmr-goal cp' : 'lmr-goal'}>
      <CircleIcon name={goalIconName(goal)} tone={tone} size={56} iconSize={26} />
      <div className="lmx-gc">
        <div className="lmx-gn lmr-clamp2">{goal.name}</div>
        <div className="lmx-gm">{goal.meta}</div>
        <div className="lmr-track">
          <div
            className="lmr-fill"
            style={{
              width: `${percent}%`,
              background: tone === 'good' ? COLOURS.teal : fillOf(tone),
            }}
          ></div>
        </div>
        <div className="lmx-gs">{goal.sentence}</div>
      </div>
      <div className="lmx-gp">
        <div className="lmx-pc" style={{ color: textOf(tone) }}>
          {percent}%
        </div>
        <BandChip tone={tone} text={goal.bandText} />
      </div>
    </div>
  )
}
