import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { rankWhen } from '../../domain/goals/when.ts'
import { useStore } from '../../state/store.ts'
import type { Goal } from '../../state/types.ts'
import GIcon from '../ui/GIcon.tsx'

const GRIP = Array.from({ length: 6 }, (_, i) => <i key={i} />)

const MOVES = [
  { dir: 'up', step: -1, glyph: '▲' },
  { dir: 'down', step: 1, glyph: '▼' },
] as const

interface Props {
  goal: Goal
  index: number
  count: number
  onMove: (index: number, step: -1 | 1) => void
}

/** One goal in "Which goal first?": drag it to reorder, or use the up/down buttons. */
export default function RankRow({ goal, index, count, onMove }: Props) {
  const when = useStore((store) => rankWhen(goal, store.plan))
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
            onClick={() => onMove(index, step)}
          >
            {glyph}
          </button>
        ))}
      </span>
    </li>
  )
}
