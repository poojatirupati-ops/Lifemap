import { useLayoutEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store.ts'
import { useShell } from '../../state/shell.ts'
import { useViewport } from '../../hooks/useViewport.ts'
import { useTimelineDrag } from '../../hooks/useTimelineDrag.ts'
import { layoutTimeline } from './layout.ts'
import TimelineAxis from './TimelineAxis.tsx'
import TimelineChip from './TimelineChip.tsx'
import DragTip from './DragTip.tsx'
import RotateIcon from './RotateIcon.tsx'

type Layout = ReturnType<typeof layoutTimeline> & { width: number }

/** Height a landscape phone has for the board: the scroll area less the footer and margins. */
function visibleHeight() {
  const main = document.getElementById('main')
  const foot = document.querySelector<HTMLElement>('.foot')
  return (main ? main.clientHeight : innerHeight) - (foot?.offsetHeight ?? 0) - 16 - 14
}

/** "Your life by age": goals as chips above an age axis, dragged to change when they happen. */
export default function TimelineBoard() {
  const goals = useStore((store) => store.plan.goals)
  const highlighted = useStore((store) => store.plan.tlHl)
  const ageNow = useStore((store) => store.plan.about.age ?? 0)
  const { landscape } = useViewport(useShell((shell) => shell.desk))
  const track = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const { drag, chipHandlers } = useTimelineDrag(track, ageNow)

  // Chips are measured once they are in the page, so this runs after every render and keeps the
  // result only when something moved (a new age, a resize, a goal added or removed).
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const width = track.current!.clientWidth
    const chips = [...track.current!.querySelectorAll<HTMLElement>('.tl-chip')].map((el) => ({
      id: Number(el.dataset.g),
      age: goals.find((goal) => goal.id === Number(el.dataset.g))!.age,
      width: el.offsetWidth,
      height: el.offsetHeight,
    }))
    const next = {
      ...layoutTimeline({ chips, ageNow, width, landscape, visibleHeight: visibleHeight() }),
      width,
    }
    setLayout((last) => (JSON.stringify(last) === JSON.stringify(next) ? last : next))
  })

  const placed = (id: number) => layout?.chips.find((chip) => chip.id === id)
  const dragged = drag?.moved ? goals.find((goal) => goal.id === drag.id) : undefined
  const draggedAt = dragged && placed(dragged.id)

  return (
    <div className="tl-board">
      <div className="tl-head">
        <b>Your life by age</b>
        <span className="rotchip" title="Turn your phone sideways for a bigger timeline">
          <RotateIcon />
          Turn sideways
        </span>
      </div>
      <div
        className={drag ? 'tl-track live' : 'tl-track'}
        id="tl"
        data-a0={ageNow}
        ref={track}
        style={layout ? { height: layout.height } : undefined}
      >
        {layout && <TimelineAxis ageNow={ageNow} {...layout} />}
        {goals.map((goal) => {
          const at = placed(goal.id)
          return (
            <TimelineChip
              key={goal.id}
              goal={goal}
              highlighted={highlighted === goal.id}
              dragging={drag?.id === goal.id}
              position={at && { left: at.left, top: at.top }}
              {...chipHandlers(goal)}
            />
          )
        })}
        {dragged && draggedAt && <DragTip goal={dragged} chip={draggedAt} width={layout!.width} />}
      </div>
      <div className="tl-hint">↔ Drag a goal (or use the arrow keys) to change when it happens</div>
    </div>
  )
}
