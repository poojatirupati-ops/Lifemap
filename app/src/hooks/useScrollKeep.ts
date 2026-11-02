import { useLayoutEffect, useRef, type RefObject } from 'react'

const SCROLLER = '.scroll,.qbody'

/**
 * Keep the reader's place when the same screen re-renders, even if the scroller is re-created:
 * restore scrollTop instantly, without a glide. A new screen starts at the top.
 */
export function useScrollKeep(ref: RefObject<HTMLElement | null>, screenKey: string) {
  const savedTop = useRef(0)

  useLayoutEffect(() => {
    savedTop.current = 0
  }, [screenKey])

  useLayoutEffect(() => {
    const scroller = ref.current?.querySelector<HTMLElement>(SCROLLER)
    if (!scroller || scroller.scrollTop === savedTop.current) return
    scroller.style.scrollBehavior = 'auto'
    scroller.scrollTop = savedTop.current
    requestAnimationFrame(() => {
      scroller.style.scrollBehavior = ''
    })
  })

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const remember = (event: Event) => {
      const target = event.target as Element
      if (target.matches(SCROLLER)) savedTop.current = target.scrollTop
    }
    root.addEventListener('scroll', remember, true)
    return () => root.removeEventListener('scroll', remember, true)
  }, [ref])
}
