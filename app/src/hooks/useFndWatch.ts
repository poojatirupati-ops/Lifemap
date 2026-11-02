import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'

/** Foundation tiles (.fnd2) on a new screen fade in once when scrolled into view. */
export function useFndWatch(ref: RefObject<HTMLElement | null>, screenKey: string) {
  useEffect(() => {
    const tiles = [...(ref.current?.querySelectorAll('.fnd2:not(.seen)') ?? [])]
    if (!tiles.length) return
    if (prefersReducedMotion()) {
      tiles.forEach((tile) => tile.classList.add('seen'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) continue
          target.classList.replace('pre', 'seen')
          observer.unobserve(target)
        }
      },
      { threshold: 0.25 },
    )
    for (const tile of tiles) {
      tile.classList.add('pre')
      observer.observe(tile)
    }
    return () => observer.disconnect()
  }, [ref, screenKey])
}
