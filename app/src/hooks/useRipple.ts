import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'

const RIPPLE_MS = 700

/** Tapping a quiz answer sends a ripple out from the finger. */
export function useRipple(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const onPointerDown = (event: PointerEvent) => {
      const answer = (event.target as Element).closest<HTMLElement>('.qcenter .opt')
      if (!answer || prefersReducedMotion()) return
      const box = answer.getBoundingClientRect()
      const size = Math.max(box.width, box.height) * 2.2
      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      Object.assign(ripple.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${event.clientX - box.left - size / 2}px`,
        top: `${event.clientY - box.top - size / 2}px`,
      })
      answer.appendChild(ripple)
      setTimeout(() => ripple.remove(), RIPPLE_MS)
    }

    root.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => root.removeEventListener('pointerdown', onPointerDown)
  }, [ref])
}
