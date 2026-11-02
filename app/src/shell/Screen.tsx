import { createContext, use, useLayoutEffect, useRef, type ReactNode } from 'react'
import { showCurrentScreen, useShell } from '../state/shell.ts'
import { useViewport } from '../hooks/useViewport.ts'
import { useCountUp } from '../hooks/useCountUp.ts'
import { useFndWatch } from '../hooks/useFndWatch.ts'
import { useOrbit } from '../hooks/useOrbit.ts'
import { useScrollKeep } from '../hooks/useScrollKeep.ts'
import { useFocusReturn } from '../hooks/useFocusReturn.ts'
import TabBar from '../components/frame/TabBar.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'

/** Which layout a screen is in: the app's tabs (routes/_auth/_app.tsx), the plan builder (routes/_auth/build.tsx), or neither. */
export const Area = createContext<'app' | 'build' | null>(null)

interface Props {
  /** The reviewer panel's screen id and note; a new id counts as a new screen (enter animation, focus, scroll). */
  id: string
  note: string
  /** Onboarding's full-bleed layout: no header, foot or tab bar. */
  quiz?: boolean
  /** The logo bar (.topbar.hdr or .pbrow) pinned in the header; `head` then scrolls with the page. */
  bar?: ReactNode
  head?: ReactNode
  foot?: ReactNode
  children: ReactNode
}

/** One screen: header, scroll area, foot and (in the app) the tab bar, as the original lays them out. */
export default function Screen({ id, note, quiz, bar, head, foot, children }: Props) {
  const renderCount = useShell((shell) => shell.renderCount)
  const desk = useShell((shell) => shell.desk)
  const { landscape } = useViewport(desk)
  const tabs = use(Area) === 'app'
  const ref = useRef<HTMLDivElement>(null)
  const renderKey = `${id}:${renderCount}`

  useCountUp(ref, renderKey)
  useFndWatch(ref, renderKey)
  useOrbit(ref, renderKey)
  useScrollKeep(ref, renderKey)
  useFocusReturn(ref, renderKey)
  useLayoutEffect(() => showCurrentScreen(id, note), [id, note])

  const body = <ErrorBoundary>{children}</ErrorBoundary>
  // keyed: a new screen remounts, which replays #screen.enter's rise animation
  if (quiz)
    return (
      <div className="quiz" key={renderKey} ref={ref}>
        {body}
      </div>
    )

  // Page titles scroll with the page; only the logo bar stays pinned (in landscape the whole header scrolls).
  const sky = (
    <header className="sky">
      {bar}
      {bar && !landscape ? null : head}
    </header>
  )
  return (
    <div className="app" key={renderKey} ref={ref}>
      {!landscape && sky}
      <div className="scroll" id="main">
        {landscape ? sky : bar && head ? <div className="pghead">{head}</div> : null}
        {body}
      </div>
      {foot && <div className="foot">{foot}</div>}
      {tabs && <TabBar />}
    </div>
  )
}
