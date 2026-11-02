import { useRef } from 'react'

/**
 * Focus handlers for a Radix Dialog.Content. Radix only refocuses its own Trigger and our dialogs
 * open from plain buttons, so remember the opener: on close focus goes back to it, or to the
 * screen's title when it is gone. On open, `pickFirst` chooses what takes focus.
 */
export function useDialogFocus(pickFirst: (dialog: HTMLElement) => HTMLElement | null) {
  const opener = useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus(event: Event) {
      const active = document.activeElement
      opener.current = active instanceof HTMLElement ? active : null
      event.preventDefault()
      pickFirst(event.currentTarget as HTMLElement)?.focus()
    },
    onCloseAutoFocus(event: Event) {
      event.preventDefault()
      const title = document.querySelector<HTMLElement>('#screen h2[tabindex]')
      const target = opener.current?.isConnected ? opener.current : title
      target?.focus({ preventScroll: true })
    },
  }
}
