import { useLayoutEffect, type RefObject } from 'react'

/** A new screen focuses its title, unless the reader is typing in one of its fields. */
export function useFocusReturn(ref: RefObject<HTMLElement | null>, screenKey: string) {
  useLayoutEffect(() => {
    if (document.activeElement?.matches('#screen input')) return
    ref.current?.querySelector<HTMLElement>('h2[tabindex]')?.focus({ preventScroll: true })
  }, [ref, screenKey])
}
