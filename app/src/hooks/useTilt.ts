import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'

const PHOTO_CARDS = '.hcard,.ecard,.card.upnext'
const MAX_TURN_DEG = 10
const MAX_TIP_DEG = 8

/** Photo cards lean towards the pointer while it is over them. */
export function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const onPointerMove = (event: PointerEvent) => {
      if (prefersReducedMotion()) return
      const card = (event.target as Element).closest<HTMLElement>(PHOTO_CARDS)
      if (!card) return
      const box = card.getBoundingClientRect()
      const x = (event.clientX - box.left) / box.width - 0.5
      const y = (event.clientY - box.top) / box.height - 0.5
      card.style.setProperty('--ry', `${(x * MAX_TURN_DEG).toFixed(2)}deg`)
      card.style.setProperty('--rx', `${(-y * MAX_TIP_DEG).toFixed(2)}deg`)
      card.classList.add('tilting')
    }

    const onPointerOut = (event: PointerEvent) => {
      const card = (event.target as Element).closest<HTMLElement>(PHOTO_CARDS)
      if (!card || card.contains(event.relatedTarget as Node | null)) return
      card.classList.remove('tilting')
      card.style.removeProperty('--rx')
      card.style.removeProperty('--ry')
    }

    root.addEventListener('pointermove', onPointerMove, { passive: true })
    root.addEventListener('pointerout', onPointerOut)
    return () => {
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerout', onPointerOut)
    }
  }, [ref])
}
