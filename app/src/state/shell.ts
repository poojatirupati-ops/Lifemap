import { create } from 'zustand'
import { useStore } from './store.ts'
import type { Snapshot } from './types.ts'

/** Phone or desktop view: ?view=desktop wins, then the last choice saved in this browser. */
function startsOnDesktop() {
  try {
    const view = new URLSearchParams(location.search).get('view') || localStorage.getItem('lm-view')
    return view === 'desktop'
  } catch {
    return false
  }
}

interface Shell {
  /** The shown screen's id and note, for the reviewer panel's "Current screen". */
  screenId: string
  screenNote: string
  toastMessage: string | null
  desk: boolean
  /** Signed in (session, or in dev a reviewer jump / the localhost test flag): passes the wall. */
  authed: boolean
  /** Bumped to make the next render count as a new screen (enter animation, focus). */
  renderCount: number
}

export const useShell = create<Shell>(() => ({
  screenId: '',
  screenNote: '',
  toastMessage: null,
  desk: startsOnDesktop(),
  authed: false,
  renderCount: 0,
}))

export const rerender = () =>
  useShell.setState(({ renderCount }) => ({ renderCount: renderCount + 1 }))

export const showCurrentScreen = (screenId: string, screenNote: string) =>
  useShell.setState({ screenId, screenNote })

export function setDesk(desk: boolean) {
  try {
    localStorage.setItem('lm-view', desk ? 'desktop' : 'phone')
  } catch {
    // private mode: the choice just is not remembered
  }
  useShell.setState({ desk })
  rerender()
}

/** Start over from a whole saved plan (a fresh start, the sample customer or a jump). */
export function startFrom(snapshot: Snapshot) {
  useStore.getState().load(snapshot)
  rerender()
}

/** The reviewer's pass through the wall (sample customer, jumps, test hook); only in dev. */
export function signInForReview() {
  if (import.meta.env.DEV) useShell.setState({ authed: true })
}

const PROBLEM = /couldn't|can't|blocked|nothing opened|first\b/i
let hideToast: ReturnType<typeof setTimeout>

/** Show a short message; problems stay longer so they can be read. */
export function toast(message: string) {
  useShell.setState({ toastMessage: message })
  clearTimeout(hideToast)
  hideToast = setTimeout(
    () => useShell.setState({ toastMessage: null }),
    PROBLEM.test(message) ? 8000 : 2800,
  )
}
