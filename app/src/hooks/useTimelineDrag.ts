import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { useStore } from '../state/store.ts'
import { ageLimits } from '../domain/goals/goals.ts'
import { LAST_AGE } from '../domain/goals/timelineLayout.ts'
import { prefersReducedMotion } from './reducedMotion.ts'
import type { Goal } from '../state/types.ts'

/** A press that moves less than this many pixels is a tap. */
const TAP_SLOP = 5

interface Press {
  startX: number
  startAge: number
  moved: boolean
}

const ageOf = (id: number) => useStore.getState().plan.goals.find((goal) => goal.id === id)?.age

/** Tap or Enter: highlight the goal and bring its row into view. */
function showRow(id: number, smooth: boolean) {
  useStore.getState().highlightGoal(id)
  document.getElementById(`row-${id}`)?.scrollIntoView({
    block: 'nearest',
    behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
  })
}

/**
 * Drag a timeline chip by pointer (mouse, touch, pen) or the arrow keys. The age snaps to whole years
 * as the pointer moves; the chip captures the pointer, and its CSS (touch-action: none) keeps the
 * page from scrolling under a touch drag.
 */
export function useTimelineDrag(trackRef: RefObject<HTMLDivElement | null>, ageNow: number) {
  // transient pointer values; the state below is only what the board renders
  const press = useRef<Press | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [moved, setMoved] = useState(false)
  const moveGoal = useStore((store) => store.moveGoal)
  const finishMove = useStore((store) => store.finishMove)

  const end = (id: number) => {
    const done = press.current
    if (!done) return
    press.current = null
    setDraggingId(null)
    setMoved(false)
    if (done.moved) finishMove(id)
    else showRow(id, true)
  }

  const chipHandlers = (goal: Goal) => ({
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.button > 0) return
      // no text selection or focus ring from the press itself
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      press.current = { startX: event.clientX, startAge: goal.age, moved: false }
      setDraggingId(goal.id)
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const current = press.current
      const track = trackRef.current
      if (!current || !track) return
      const dx = event.clientX - current.startX
      if (!current.moved) {
        if (Math.abs(dx) < TAP_SLOP) return
        current.moved = true
        setMoved(true)
      }
      // the rect, not clientWidth: the phone frame may be scaled on a desktop screen
      const width = track.getBoundingClientRect().width
      const age = Math.round(current.startAge + (dx / width) * (LAST_AGE - ageNow))
      const before = ageOf(goal.id)
      moveGoal(goal.id, age)
      if (ageOf(goal.id) !== before) navigator.vibrate?.(4)
    },
    onPointerUp: () => end(goal.id),
    onPointerCancel: () => end(goal.id),
    onLostPointerCapture: () => end(goal.id),
    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        showRow(goal.id, false)
        return
      }
      const step = event.shiftKey ? 5 : 1
      const { earliest, latest } = ageLimits(useStore.getState().plan, goal)
      const target = {
        ArrowRight: goal.age + step,
        ArrowUp: goal.age + step,
        ArrowLeft: goal.age - step,
        ArrowDown: goal.age - step,
        Home: earliest,
        End: latest,
      }[event.key]
      if (target == null) return
      event.preventDefault()
      moveGoal(goal.id, target)
    },
  })

  return { draggingId, moved, chipHandlers }
}
