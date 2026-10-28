import { useLayoutEffect, type RefObject } from 'react'

/** Content rises in on a new screen: replay the .enter animation when the screen key changes. */
export function useScreenEnter(ref: RefObject<HTMLElement | null>, screenKey: string) {
  useLayoutEffect(() => {
    const screen = ref.current
    if (!screen) return
    screen.classList.remove('enter')
    void screen.offsetWidth // force a reflow so the animation restarts
    screen.classList.add('enter')
  }, [ref, screenKey])
}
