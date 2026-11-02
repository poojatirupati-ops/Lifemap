import { useState, type CSSProperties } from 'react'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useShallow } from 'zustand/react/shallow'
import { rankWhen } from '../../domain/goals/goalTiming.ts'
import { fundingOrder } from '../../domain/planning/fund.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import { useStore } from '../../state/store.ts'
import { rankGoal, resetRank } from '../../state/goals.ts'
import type { Goal } from '../../state/types.ts'
import GIcon from '../ui/GIcon.tsx'

const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
}

/** A tap on the ▲▼ buttons is not a drag. */
const DRAG_AFTER = { activationConstraint: { distance: 5 } }

/**
 * "Which goal first?": savings go to the top goal first. `place` is 'f4' or 'plan' (no card,
 * hidden heading). Rows drag to reorder; the arrow buttons do the same from the keyboard.
 */
export default function RankList({ place }: { place: 'f4' | 'plan' }) {
  const goals = useStore(useShallow(({ plan }) => fundingOrder(plan.goals, plan.rank)))
  const reordered = useStore((store) => store.plan.rank != null)
  const [status, setStatus] = useState('')
  const [dragging, setDragging] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, DRAG_AFTER))
  if (goals.length < 2) return null

  const ids = goals.map((goal) => goal.id)
  const move = (from: number, to: number) => {
    if (to >= 0 && to < goals.length && to !== from) setStatus(rankGoal(from, to))
  }
  const drop = ({ active, over }: DragEndEvent) => {
    setDragging(false)
    if (over) move(ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id)))
  }
  const inPlan = place === 'plan'
  const headingStyle = { margin: '0 0 2px', ...(inPlan ? VISUALLY_HIDDEN : null) }

  return (
    <div className={inPlan ? undefined : 'card'} id={`rank-${place}`}>
      <h3 className="h" style={headingStyle} id={`rank-h-${place}`}>
        Which goal first?
      </h3>
      <p className="small" style={{ margin: '0 0 8px' }}>
        Savings go to the top goal first. Drag a goal to reorder.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={() => setDragging(true)}
        onDragEnd={drop}
        onDragCancel={() => setDragging(false)}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol
            className={dragging ? 'rank dragging' : 'rank'}
            aria-labelledby={`rank-h-${place}`}
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {goals.map((goal, index) => (
              <RankRow key={goal.id} goal={goal} index={index} count={goals.length} onMove={move} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p className="small" role="status" id={`rank-msg-${place}`} style={{ margin: '6px 0 0' }}>
        {status}
      </p>
      {reordered ? (
        <button className="link" data-a="grankreset" onClick={() => setStatus(resetRank())}>
          Back to our suggested order
        </button>
      ) : null}
    </div>
  )
}

const GRIP = Array.from({ length: 6 }, (_, i) => <i key={i} />)

const MOVES = [
  { dir: 'up', step: -1, glyph: '▲' },
  { dir: 'down', step: 1, glyph: '▼' },
] as const

interface Props {
  goal: Goal
  index: number
  count: number
  onMove: (from: number, to: number) => void
}

/** One goal in "Which goal first?": drag it to reorder, or use the up/down buttons. */
function RankRow({ goal, index, count, onMove }: Props) {
  const when = rankWhen(useTiming(), goal)
  const position = `now ${index + 1} of ${count}`
  const { setNodeRef, listeners, transform, isDragging } = useSortable({ id: goal.id })
  const moved = CSS.Translate.toString(transform)

  return (
    <li
      ref={setNodeRef}
      className={isDragging ? 'mini rk-r drag' : 'mini rk-r'}
      data-gid={goal.id}
      style={{ alignItems: 'center', transform: isDragging ? `${moved} scale(1.03)` : moved }}
      {...listeners}
    >
      <span className="rk-grip" aria-hidden="true" title="Drag to reorder">
        {GRIP}
      </span>
      <span className="rk-n">{index + 1}</span>
      <GIcon emoji={goal.emoji} className="rk-e" aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <b className="rk-t">{goal.name}</b>
        <span className="small">{when}</span>
      </span>
      <span className="rk-arr">
        {MOVES.map(({ dir, step, glyph }) => (
          <button
            key={dir}
            className="chip sm"
            data-a="grank"
            data-p={`${goal.id}|${dir}`}
            aria-label={`Move ${goal.name} ${dir}, ${position}`}
            aria-disabled={index + step < 0 || index + step >= count || undefined}
            onClick={() => onMove(index, index + step)}
          >
            {glyph}
          </button>
        ))}
      </span>
    </li>
  )
}
