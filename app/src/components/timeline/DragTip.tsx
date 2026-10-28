import { ageToX, clamp, type PlacedChip } from './layout.ts'
import { calendarYear, useTiming } from './goalText.ts'
import type { Goal } from '../../state/types.ts'

interface Props {
  goal: Goal
  chip: PlacedChip
  /** The track's width. */
  width: number
}

/** While a chip is dragged: a year bubble above it and a guide line down to its age on the axis. */
export default function DragTip({ goal, chip, width }: Props) {
  const timing = useTiming()
  const year = calendarYear(timing, goal.age)
  const ageX = clamp(ageToX(goal.age, timing.about.age ?? 0, width), 0, width)

  return (
    <>
      <div
        className="tl-tip tip2"
        style={{ left: clamp(chip.left + chip.width / 2, 70, width - 70), top: chip.top - 8 }}
      >
        <b>{year}</b>
        <span>{`Age ${goal.age} · ${goal.name}`}</span>
      </div>
      <div className="tl-guide" data-y={year} style={{ left: ageX, top: chip.stemTop }} />
    </>
  )
}
