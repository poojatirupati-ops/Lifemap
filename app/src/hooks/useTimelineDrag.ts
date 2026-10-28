import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { useStore } from '../state/store.ts'
import { LAST_AGE } from '../components/timeline/layout.ts'
import { finishMove, highlightGoal, moveGoal } from '../components/timeline/goalActions.ts'
import type { Goal } from '../state/types.ts'

// a press that moves less than this is a tap
const TAP_SLOP = 5

interface Press {
  id: number
  startX: number
  startAge: number
  moved: boolean
}

const ageOf = (id: number) => useStore.getState().plan.goals.find((goal) => goal.id === id)?.age

/** Tap or Enter: highlight the goal and bring its row into view. */
function showRow(id: number, smooth: boolean) {
  highlightGoal(id)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  document
    .getElementById(`row-${id}`)
    ?.scrollIntoView({ block: 'nearest', behavior: smooth && !reduced ? 'smooth' : 'auto' })
}

/**
 * Drag a timeline chip by pointer (mouse, touch, pen) or the arrow keys. The age snaps to whole years
 * as the pointer moves; the chip captures the pointer, and its CSS (touch-action: none) keeps the
 * page from scrolling under a touch drag.
 */
export function useTimelineDrag(trackRef: RefObject<HTMLDivElement | null>, ageNow: number) {
  const press = useRef<Press | null>(null)
  const [drag, setDrag] = useState<{ id: number; moved: boolean } | null>(null)

  const end = () => {
    const done = press.current
    if (!done) return
    press.current = null
    setDrag(null)
    if (done.moved) finishMove(done.id)
    else showRow(done.id, true)
  }

  const chipHandlers = (goal: Goal) => ({
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.button > 0) return
      // no text selection or focus ring from the press itself
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      press.current = { id: goal.id, startX: event.clientX, startAge: goal.age, moved: false }
      setDrag({ id: goal.id, moved: false })
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const current = press.current
      const track = trackRef.current
      if (!current || !track) return
      const dx = event.clientX - current.startX
      if (!current.moved) {
        if (Math.abs(dx) < TAP_SLOP) return
        current.moved = true
        setDrag({ id: current.id, moved: true })
      }
      // the rect, not clientWidth: the phone frame may be scaled on a desktop screen
      const width = track.getBoundingClientRect().width
      const age = Math.round(current.startAge + (dx / width) * (LAST_AGE - ageNow))
      const before = ageOf(current.id)
      moveGoal(current.id, age)
      if (ageOf(current.id) !== before) navigator.vibrate?.(4)
    },
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      const step = event.shiftKey ? 5 : 1
      const target = {
        ArrowRight: goal.age + step,
        ArrowUp: goal.age + step,
        ArrowLeft: goal.age - step,
        ArrowDown: goal.age - step,
        Home: 0,
        End: 99,
      }[event.key]
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        showRow(goal.id, false)
      } else if (target != null) {
        event.preventDefault()
        moveGoal(goal.id, target)
      }
    },
  })

  return { drag, chipHandlers }
}
