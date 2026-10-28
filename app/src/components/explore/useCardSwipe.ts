// The focus-area card: drag or swipe it away, or step with arrows, chips and arrow keys.
import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'

const SWIPE_AWAY_PX = 70
const DRAG_START_PX = 8
const SCROLL_CANCEL_PX = 12
const OUT_EASE = 'cubic-bezier(.55,0,.75,.3)'
const IN_EASE = 'cubic-bezier(.22,1,.36,1)'

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const wrap = (index: number, count: number) => (index + count) % count

interface Drag {
  x: number
  y: number
  dx: number
  dragging: boolean
}

/** Swiping through `count` cards; returns refs for the card and the card behind it, and handlers. */
export function useCardSwipe(count: number, index: number, setIndex: (index: number) => void) {
  const card = useRef<HTMLButtonElement>(null)
  const back = useRef<HTMLSpanElement>(null)
  const drag = useRef<Drag | null>(null)
  const enterFrom = useRef(0)
  const swallowClick = useRef(false)

  // The new card slides in from the side it was swiped towards.
  useLayoutEffect(() => {
    const el = card.current
    const from = enterFrom.current
    if (!el || !from) return
    enterFrom.current = 0
    el.style.transition = 'none'
    el.style.transform = `translateX(${from > 0 ? 34 : -34}%) scale(.94)`
    el.style.opacity = '0'
    if (back.current)
      Object.assign(back.current.style, { transition: '', transform: '', opacity: '' })
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = `transform .42s ${IN_EASE}, opacity .3s ease`
        el.style.transform = ''
        el.style.opacity = '1'
      }),
    )
  }, [index])

  function swipe(step: number, fromDrag = false) {
    const next = wrap(index + step, count)
    const el = card.current
    if (!el || reducedMotion()) return setIndex(next)
    el.style.transition = `transform ${fromDrag ? '.24s' : '.3s'} ${OUT_EASE}, opacity .24s ease`
    el.style.transform = `translateX(${step > 0 ? -125 : 125}%) rotate(${step > 0 ? -12 : 12}deg)`
    el.style.opacity = '0'
    if (back.current) {
      Object.assign(back.current.style, {
        transition: 'transform .3s ease, opacity .3s ease',
        transform: 'rotate(0deg) scale(1)',
        opacity: '1',
      })
    }
    setTimeout(
      () => {
        enterFrom.current = step
        setIndex(next)
      },
      fromDrag ? 200 : 260,
    )
  }

  function paint(dx: number) {
    card.current!.style.transform = `translate3d(${dx}px,0,0) rotate(${dx / 24}deg)`
    const pull = Math.min(1, Math.abs(dx) / 160)
    if (back.current) {
      back.current.style.transform = `rotate(${4 - 4 * pull}deg) scale(${0.96 + 0.04 * pull})`
      back.current.style.opacity = String(0.75 + 0.25 * pull)
    }
  }

  const cardHandlers = {
    onPointerDown(event: PointerEvent) {
      if (event.button <= 0)
        drag.current = { x: event.clientX, y: event.clientY, dx: 0, dragging: false }
    },
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      const state = drag.current
      if (!state) return
      const dx = event.clientX - state.x
      const dy = event.clientY - state.y
      if (!state.dragging) {
        if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) < Math.abs(dy)) {
          if (Math.abs(dy) > SCROLL_CANCEL_PX) drag.current = null
          return
        }
        state.dragging = true
        event.currentTarget.style.transition = 'none'
        if (back.current) back.current.style.transition = 'none'
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      state.dx = dx
      requestAnimationFrame(() => drag.current?.dragging && paint(drag.current.dx))
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture(event: MouseEvent) {
      if (!swallowClick.current) return
      swallowClick.current = false
      event.preventDefault()
      event.stopPropagation()
    },
  }

  function endDrag() {
    const state = drag.current
    drag.current = null
    if (!state?.dragging) return
    swallowClick.current = true // a drag is not a tap
    if (Math.abs(state.dx) > SWIPE_AWAY_PX) return swipe(state.dx < 0 ? 1 : -1, true)
    card.current!.style.transition = 'transform .45s cubic-bezier(.22,1.3,.36,1)'
    card.current!.style.transform = ''
    if (back.current) {
      Object.assign(back.current.style, {
        transition: 'transform .35s ease, opacity .35s ease',
        transform: '',
        opacity: '',
      })
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    swipe(event.key === 'ArrowRight' ? 1 : -1)
    setTimeout(() => card.current?.focus(), 300)
  }

  return { swipe, card, back, cardHandlers, onKeyDown }
}
