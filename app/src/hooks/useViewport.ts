import { useSyncExternalStore } from 'react'

const sub = (cb: () => void) => {
  addEventListener('resize', cb)
  return () => removeEventListener('resize', cb)
}
const snap = () => innerWidth + 'x' + innerHeight

/** The original's phoneLandscape(), isDesk() and fit(). */
export function useViewport(desk: boolean) {
  const [w, h] = useSyncExternalStore(sub, snap).split('x').map(Number)
  const landscape = h <= 500 && w > h,
    isDesk = desk && w > 800,
    small = w <= 800 || landscape || isDesk
  return {
    landscape,
    isDesk,
    small,
    scale: Math.max(0.4, Math.min(1, (h - 30) / 844, (w - 330) / 420)),
  }
}
