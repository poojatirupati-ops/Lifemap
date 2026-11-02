import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react'
import clsx from 'clsx'
import { useStore } from '../../state/store.ts'
import { useShell } from '../../state/shell.ts'
import { useViewport } from '../../hooks/useViewport.ts'
import { prefersReducedMotion } from '../../hooks/reducedMotion.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import { ageLimits } from '../../domain/goals/goals.ts'
import { calendarYear, inYears, isPassed, yearsAway } from '../../domain/goals/goalTiming.ts'
import { LAST_AGE, ageToX, axisMarks, layoutTimeline } from '../../domain/goals/timelineLayout.ts'
import type { Goal } from '../../state/types.ts'
import { clamp } from '../../lib/clamp.ts'

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
function useTimelineDrag(trackRef: RefObject<HTMLDivElement | null>, ageNow: number) {
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

type Layout = ReturnType<typeof layoutTimeline>

/** The board's margin and padding inside the scroll area. */
const BOARD_CHROME = 16 + 14
/** The drag bubble stays this far from the track's edges, so it is never cut off. */
const TIP_EDGE = 70

/** Height a landscape phone has for the board: the scroll area less the footer and margins. */
function visibleHeight() {
  const main = document.getElementById('main')
  const foot = document.querySelector<HTMLElement>('.foot')
  return (main ? main.clientHeight : innerHeight) - (foot?.offsetHeight ?? 0) - BOARD_CHROME
}

/** A phone turning sideways, for the "Turn sideways" hint. */
const rotateIcon = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="10" y="3" width="12" height="20" rx="2.5" />
    <path d="M15 19.5h2" />
    <path d="M5 22a11 11 0 0 0 17 7" />
    <path d="M22 25.5v3.8h-3.8" />
  </svg>
)

/** "Your life by age": goals as chips above an age axis, dragged to change when they happen. */
export default function TimelineBoard() {
  const goals = useStore((store) => store.plan.goals)
  const highlighted = useStore((store) => store.highlightedGoal)
  const ageNow = useStore((store) => store.plan.about.age ?? 0)
  const timing = useTiming()
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
  const draggedYear = dragged && calendarYear(timing, dragged.age)

  return (
    <div className="tl-board">
      <div className="tl-head">
        <b>Your life by age</b>
        <span className="rotchip" title="Turn your phone sideways for a bigger timeline">
          {rotateIcon}
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
        {layout ? (
          <>
            {/* the age axis with its marks, and a dashed stem from each chip down to its age */}
            <div className="tl-axis" style={{ top: layout.axisY }} />
            <div className="tl-now" style={{ left: 0, top: layout.axisY + 2 }} aria-hidden="true" />
            {axisMarks(ageNow, width).map(({ age, x, labelled }) => (
              <Fragment key={age}>
                <div className="tl-tm" style={{ left: x, top: layout.axisY + 6 }} />
                {labelled && (
                  <div className="tl-tick" style={{ left: x, top: layout.axisY + 16 }}>
                    {`age ${age}`}
                  </div>
                )}
              </Fragment>
            ))}
            <div className="tl-tick" style={{ left: 14, top: layout.axisY + 16 }}>
              Now
            </div>
            {layout.chips.map(({ id, stemX, stemTop, stemHeight, ageX }) => (
              <Fragment key={id}>
                <div
                  className="tl-stem"
                  style={{ left: stemX, top: stemTop, height: stemHeight }}
                />
                {ageX != null && (
                  <>
                    <div
                      className="tl-link"
                      style={{
                        left: Math.min(stemX, ageX),
                        width: Math.abs(stemX - ageX),
                        top: layout.axisY - 6,
                      }}
                    />
                    <div className="tl-pin" style={{ left: ageX, top: layout.axisY + 2 }} />
                  </>
                )}
              </Fragment>
            ))}
          </>
        ) : null}
        {goals.map((goal) => {
          const at = byId.get(goal.id)
          const retire = goal.kind === 'retire'
          const { earliest, latest } = ageLimits(timing, goal)
          // one goal on the timeline: a slider for its age
          return (
            <div
              key={goal.id}
              ref={(el) => {
                if (el) chipEls.current.set(goal.id, el)
                else chipEls.current.delete(goal.id)
              }}
              className={clsx('tl-chip', {
                ret: retire,
                hl: highlighted === goal.id,
                drag: draggingId === goal.id,
              })}
              data-g={goal.id}
              title={goal.name}
              tabIndex={0}
              role="slider"
              aria-label={goal.name}
              aria-valuemin={earliest}
              aria-valuemax={latest}
              aria-valuenow={goal.age}
              aria-valuetext={`${goal.name}, age ${goal.age}, ${calendarYear(timing, goal.age)}`}
              style={at && { left: at.left, top: at.top }}
              {...chipHandlers(goal)}
            >
              {retire ? (
                <>
                  <span aria-hidden="true">🏁</span>Retire{' '}
                  <span className="yr">{timing.retireSet ? goal.age : '?'}</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">{goal.emoji}</span>
                  <span className="nm">{goal.name}</span>
                  <span className="yr">
                    {isPassed(timing, goal) ? 'date passed' : inYears(yearsAway(timing, goal))}
                  </span>
                </>
              )}
            </div>
          )
        })}
        {dragged && draggedAt ? (
          <>
            {/* while a chip is dragged: a year bubble above it and a guide down to its age */}
            <div
              className="tl-tip tip2"
              style={{
                left: clamp(draggedAt.left + draggedAt.width / 2, TIP_EDGE, width - TIP_EDGE),
                top: draggedAt.top - 8,
              }}
            >
              <b>{draggedYear}</b>
              <span>{`Age ${dragged.age} · ${dragged.name}`}</span>
            </div>
            <div
              className="tl-guide"
              data-y={draggedYear}
              style={{
                left: clamp(ageToX(dragged.age, ageNow, width), 0, width),
                top: draggedAt.stemTop,
              }}
            />
          </>
        ) : null}
      </div>
      <div className="tl-hint">↔ Drag a goal (or use the arrow keys) to change when it happens</div>
    </div>
  )
}
