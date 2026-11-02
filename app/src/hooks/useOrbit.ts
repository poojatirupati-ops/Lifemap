import { useLayoutEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'

const RADIUS_PX = 122
const TURN_MS = 40000

/** The cover wheel (.ro.live) turns; photos are placed per frame so they stay upright. */
export function useOrbit(ref: RefObject<HTMLElement | null>, screenKey: string) {
  useLayoutEffect(() => {
    const photos = [...(ref.current?.querySelectorAll<HTMLElement>('.ro.live .orbit .o') ?? [])]
    if (!photos.length) return

    const place = (degrees: number) =>
      photos.forEach((photo, i) => {
        const angle = ((degrees + (i * 360) / photos.length - 90) * Math.PI) / 180
        const x = (RADIUS_PX * Math.cos(angle)).toFixed(2)
        const y = (RADIUS_PX * Math.sin(angle)).toFixed(2)
        photo.style.transform = `translate3d(${x}px,${y}px,0)`
      })

    place(0)
    if (prefersReducedMotion()) return
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      place(((now - start) / TURN_MS) * 360)
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [ref, screenKey])
}
