import { clamp } from '../../lib/clamp.ts'
import { ageToX, type PlacedChip } from '../../domain/goals/timelineLayout.ts'
import { calendarYear } from '../../domain/goals/goalTiming.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import type { Goal } from '../../state/types.ts'

/** The bubble stays this far from the track's edges, so it is never cut off. */
const TIP_EDGE = 70

interface Props {
  goal: Goal
  chip: PlacedChip
  /** The track's width. */
  width: number
  ageNow: number
}

/** While a chip is dragged: a year bubble above it and a guide line down to its age on the axis. */
export default function DragTip({ goal, chip, width, ageNow }: Props) {
  const timing = useTiming()
  const year = calendarYear(timing, goal.age)
  const ageX = clamp(ageToX(goal.age, ageNow, width), 0, width)

  return (
    <>
      <div
        className="tl-tip tip2"
        style={{
          left: clamp(chip.left + chip.width / 2, TIP_EDGE, width - TIP_EDGE),
          top: chip.top - 8,
        }}
      >
        <b>{year}</b>
        <span>{`Age ${goal.age} · ${goal.name}`}</span>
      </div>
      <div className="tl-guide" data-y={year} style={{ left: ageX, top: chip.stemTop }} />
    </>
  )
}
