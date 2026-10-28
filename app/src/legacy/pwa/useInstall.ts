import { useEffect, useState } from 'react'
import { isIosSafari } from './isIosSafari.ts'

type InstallEvent = Event & { prompt(): Promise<unknown> }

/** Captures beforeinstallprompt; `install` is set when the browser can prompt, `iosHint` when Add to Home Screen is the only route. */
export function useInstall() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', on)
    return () => window.removeEventListener('beforeinstallprompt', on)
  }, [])
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return {
    install: event && (() => event.prompt().finally(() => setEvent(null))),
    iosHint: isIosSafari(navigator.userAgent, standalone),
  }
}
