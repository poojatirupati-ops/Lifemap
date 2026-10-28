import { useRef, type PointerEvent } from 'react'

interface Drag {
  row: HTMLElement
  list: HTMLElement
  rows: HTMLElement[]
  pointer: number
  startY: number
  offset: number
  /** height of one row, including the gap */
  step: number
  from: number
  to: number
  frame: number
}

const SETTLE_MS = 220
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Where a row dragged by `offset` pixels lands, kept inside the list. */
export const dropIndex = (from: number, offset: number, step: number, count: number) =>
  Math.max(0, Math.min(count - 1, from + Math.round(offset / step)))

/** How far the row at `index` moves aside while another is dragged from `from` to `to`. */
export function shiftFor(index: number, from: number, to: number, step: number) {
  if (from < to && index > from && index <= to) return -step
  if (from > to && index < from && index >= to) return step
  return 0
}

/**
 * Drag a .rk-r row of a "Which goal first?" list to reorder it. Spread the returned handlers on
 * the <ol>; `onDrop(from, to)` runs once the row has settled. Rows move with transforms only, so
 * React re-renders the new order after the drop. The ▲▼ buttons stay for keyboard users.
 */
export function useRankDrag(onDrop: (from: number, to: number) => void) {
  const drag = useRef<Drag | null>(null)

  function paint() {
    const current = drag.current
    if (!current) return
    current.frame = 0
    const { row, rows, offset, step, from } = current
    row.style.transform = `translate3d(0,${offset}px,0) scale(1.03)`
    const to = dropIndex(from, offset, step, rows.length)
    if (to === current.to) return
    current.to = to
    rows.forEach((other, index) => {
      if (other === row) return
      const shift = shiftFor(index, from, to, step)
      other.style.transform = shift ? `translate3d(0,${shift}px,0)` : ''
    })
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    const row = target.closest<HTMLElement>('.rk-r')
    if (!row || target.closest('button') || event.button > 0 || drag.current) return
    const list = event.currentTarget
    const rows = [...list.children] as HTMLElement[]
    const first = rows[0].getBoundingClientRect()
    const second = rows[1]?.getBoundingClientRect() ?? first
    const from = rows.indexOf(row)
    drag.current = {
      row,
      list,
      rows,
      pointer: event.pointerId,
      startY: event.clientY,
      offset: 0,
      step: second.top - first.top || first.height,
      from,
      to: from,
      frame: 0,
    }
    row.classList.add('drag')
    list.classList.add('dragging')
    row.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const current = drag.current
    if (!current || event.pointerId !== current.pointer) return
    current.offset = event.clientY - current.startY
    current.frame ||= requestAnimationFrame(paint)
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const current = drag.current
    if (!current || event.pointerId !== current.pointer) return
    drag.current = null
    cancelAnimationFrame(current.frame)
    const { row, list, rows, from, to, step } = current
    row.classList.add('settle')
    row.style.transform = `translate3d(0,${(to - from) * step}px,0) scale(1)`
    setTimeout(
      () => {
        for (const each of rows) {
          each.style.transition = 'none'
          each.style.transform = ''
        }
        row.classList.remove('drag', 'settle')
        list.classList.remove('dragging')
        if (to !== from) onDrop(from, to)
        requestAnimationFrame(() => rows.forEach((each) => (each.style.transition = '')))
      },
      reducedMotion() ? 0 : SETTLE_MS,
    )
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
}
