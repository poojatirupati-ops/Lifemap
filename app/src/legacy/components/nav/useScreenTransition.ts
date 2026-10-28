import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { direction, type Dir } from '../../shell/nav.ts'

const pathOf = (h: string) => h.split('?')[0]
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** A new screen starts at the top: the window on phones, the .app-scroll frame at 768+. */
const toTop = () => { scrollTo(0, 0); document.querySelector('.app-scroll')?.scrollTo?.(0, 0) }

/**
 * The hash the screen shows. A new path swaps inside a View Transition where supported (direction on <html data-nav>),
 * otherwise `enter` drives a CSS enter animation. `ok(hash)` says whether a hash renders a screen: a redirect or a
 * wait never animates (the swap happens once the guard has settled, and at once when the current screen is blank).
 * Step changes inside one screen (?q=2) swap at once. Focus moves to the new screen's heading, scrolled to the top.
 */
export function useScreenTransition(live: string, ok: (hash: string) => boolean) {
  const [shown, setShown] = useState({ hash: live, enter: null as Dir | null })
  const box = useRef<HTMLDivElement>(null)
  const prev = useRef(pathOf(shown.hash))

  useEffect(() => {
    if (live === shown.hash || !ok(live)) return
    const dir = direction()
    const from = pathOf(shown.hash)
    const instant = from === pathOf(live) || from === '' || from === '/' || !ok(shown.hash) || reduced()
    // The swap must follow the hashchange and may need a View Transition around it, so it cannot be derived in render.
    // oxlint-disable-next-line react/set-state-in-effect
    if (instant) return setShown({ hash: live, enter: null })
    if ('startViewTransition' in document) {
      document.documentElement.dataset.nav = dir
      const t = document.startViewTransition(() => flushSync(() => setShown({ hash: live, enter: null })))
      for (const p of [t.ready, t.finished]) p.catch(() => {}) // a skipped transition (fast taps) still swaps the screen
    } else setShown({ hash: live, enter: dir })
  }, [live, shown.hash, ok])

  const path = pathOf(shown.hash)
  useEffect(() => {
    if (prev.current === path) return // first mount, and StrictMode's second effect run
    prev.current = path
    if (direction() === 'forward') toTop()
    const el = box.current?.querySelector<HTMLElement>('h1,h2') ?? box.current
    if (el) { el.tabIndex = -1; el.focus({ preventScroll: true }) }
  }, [path])

  return { ...shown, box }
}
