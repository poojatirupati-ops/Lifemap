import { useLayoutEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store.ts'
import { useShell } from '../../state/shell.ts'
import { useViewport } from '../../hooks/useViewport.ts'
import { useTimelineDrag } from '../../hooks/useTimelineDrag.ts'
import { layoutTimeline } from '../../domain/goals/timelineLayout.ts'
import TimelineAxis from './TimelineAxis.tsx'
import TimelineChip from './TimelineChip.tsx'
import DragTip from './DragTip.tsx'
import RotateIcon from './RotateIcon.tsx'

type Layout = ReturnType<typeof layoutTimeline>

/** The board's margin and padding inside the scroll area. */
const BOARD_CHROME = 16 + 14

/** Height a landscape phone has for the board: the scroll area less the footer and margins. */
function visibleHeight() {
  const main = document.getElementById('main')
  const foot = document.querySelector<HTMLElement>('.foot')
  return (main ? main.clientHeight : innerHeight) - (foot?.offsetHeight ?? 0) - BOARD_CHROME
}

/** "Your life by age": goals as chips above an age axis, dragged to change when they happen. */
export default function TimelineBoard() {
  const goals = useStore((store) => store.plan.goals)
  const highlighted = useStore((store) => store.plan.highlightedGoal)
  const ageNow = useStore((store) => store.plan.about.age ?? 0)
  const { landscape } = useViewport(useShell((shell) => shell.desk))
  const track = useRef<HTMLDivElement>(null)
  const chipEls = useRef(new Map<number, HTMLElement>())
  const [width, setWidth] = useState(0)
  const [layout, setLayout] = useState<Layout | null>(null)
  const { draggingId, moved, chipHandlers } = useTimelineDrag(track, ageNow)

  useLayoutEffect(() => {
    const el = track.current!
    setWidth(el.clientWidth)
    // optional only for jsdom, which has none
    const observer = globalThis.ResizeObserver && new ResizeObserver(() => setWidth(el.clientWidth))
    observer?.observe(el)
    return () => observer?.disconnect()
  }, [])

  // chips are laid out from their rendered sizes, so this runs after they are in the page
  useLayoutEffect(() => {
    const chips = goals.flatMap((goal) => {
      const el = chipEls.current.get(goal.id)
      return el
        ? [{ id: goal.id, age: goal.age, width: el.offsetWidth, height: el.offsetHeight }]
        : []
    })
    setLayout(layoutTimeline({ chips, ageNow, width, landscape, visibleHeight: visibleHeight() }))
  }, [goals, ageNow, landscape, width])

  const byId = new Map(layout?.chips.map((chip) => [chip.id, chip]))
  const dragged = moved ? goals.find((goal) => goal.id === draggingId) : undefined
  const draggedAt = dragged && byId.get(dragged.id)

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
        className={draggingId == null ? 'tl-track' : 'tl-track live'}
        id="tl"
        data-a0={ageNow}
        ref={track}
        style={layout ? { height: layout.height } : undefined}
      >
        {layout ? <TimelineAxis ageNow={ageNow} width={width} {...layout} /> : null}
        {goals.map((goal) => {
          const at = byId.get(goal.id)
          return (
            <TimelineChip
              key={goal.id}
              ref={(el) => {
                if (el) chipEls.current.set(goal.id, el)
                else chipEls.current.delete(goal.id)
              }}
              goal={goal}
              highlighted={highlighted === goal.id}
              dragging={draggingId === goal.id}
              position={at && { left: at.left, top: at.top }}
              {...chipHandlers(goal)}
            />
          )
        })}
        {dragged && draggedAt ? (
          <DragTip goal={dragged} chip={draggedAt} width={width} ageNow={ageNow} />
        ) : null}
      </div>
      <div className="tl-hint">↔ Drag a goal (or use the arrow keys) to change when it happens</div>
    </div>
  )
}
