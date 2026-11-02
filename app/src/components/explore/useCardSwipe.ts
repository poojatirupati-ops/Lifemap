// The focus-area card: drag or swipe it away, or step with arrows, chips and arrow keys.
import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import { useDrag } from '@use-gesture/react'
import { prefersReducedMotion } from '../../hooks/reducedMotion.ts'

const SWIPE_AWAY_PX = 70
const DRAG_START_PX = 8
const OUT_EASE = 'cubic-bezier(.55,0,.75,.3)'
const IN_EASE = 'cubic-bezier(.22,1,.36,1)'

export const wrap = (index: number, count: number) => (index + count) % count

/** Swiping through `count` cards; returns refs for the card and the card behind it, and handlers. */
export function useCardSwipe(count: number, index: number, setIndex: (index: number) => void) {
  const card = useRef<HTMLButtonElement>(null)
  const back = useRef<HTMLSpanElement>(null)
  const enterFrom = useRef(0)
  const setBack = (style: Partial<CSSStyleDeclaration>) => {
    if (back.current) Object.assign(back.current.style, style)
  }

  // The new card slides in from the side it was swiped towards.
  useLayoutEffect(() => {
    const el = card.current
    const from = enterFrom.current
    if (!el || !from) return
    enterFrom.current = 0
    el.style.transition = 'none'
    el.style.transform = `translateX(${from > 0 ? 34 : -34}%) scale(.94)`
    el.style.opacity = '0'
    setBack({ transition: '', transform: '', opacity: '' })
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
    if (!el || prefersReducedMotion()) return setIndex(next)
    el.style.transition = `transform ${fromDrag ? '.24s' : '.3s'} ${OUT_EASE}, opacity .24s ease`
    el.style.transform = `translateX(${step > 0 ? -125 : 125}%) rotate(${step > 0 ? -12 : 12}deg)`
    el.style.opacity = '0'
    setBack({
      transition: 'transform .3s ease, opacity .3s ease',
      transform: 'rotate(0deg) scale(1)',
      opacity: '1',
    })
    setTimeout(
      () => {
        enterFrom.current = step
        setIndex(next)
      },
      fromDrag ? 200 : 260,
    )
  }

  function paint(el: HTMLElement, dx: number) {
    el.style.transform = `translate3d(${dx}px,0,0) rotate(${dx / 24}deg)`
    const pull = Math.min(1, Math.abs(dx) / 160)
    setBack({
      transform: `rotate(${4 - 4 * pull}deg) scale(${0.96 + 0.04 * pull})`,
      opacity: String(0.75 + 0.25 * pull),
    })
  }

  function springBack(el: HTMLElement) {
    el.style.transition = 'transform .45s cubic-bezier(.22,1.3,.36,1)'
    el.style.transform = ''
    setBack({ transition: 'transform .35s ease, opacity .35s ease', transform: '', opacity: '' })
  }

  // filterTaps also swallows the click that ends a drag: a drag is not a tap
  const bind = useDrag(
    ({ first, last, tap, movement: [dx] }) => {
      const el = card.current
      if (!el || tap) return
      if (first) {
        el.style.transition = 'none'
        setBack({ transition: 'none' })
      }
      if (!last) return paint(el, dx)
      if (Math.abs(dx) > SWIPE_AWAY_PX) return swipe(dx < 0 ? 1 : -1, true)
      springBack(el)
    },
    { axis: 'x', filterTaps: true, threshold: DRAG_START_PX },
  )

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    swipe(event.key === 'ArrowRight' ? 1 : -1)
    setTimeout(() => card.current?.focus(), 300)
  }

  return { swipe, card, back, bind, onKeyDown }
}
