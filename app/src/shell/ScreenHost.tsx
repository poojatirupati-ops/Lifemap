import { useEffect, useLayoutEffect, useRef } from 'react'
import { useStore } from '../state/store.ts'
import { showCurrentScreen, useShell } from '../state/shell.ts'
import { useViewport } from '../hooks/useViewport.ts'
import { useCountUp } from '../hooks/useCountUp.ts'
import { useFndWatch } from '../hooks/useFndWatch.ts'
import { useOrbit } from '../hooks/useOrbit.ts'
import { useRipple } from '../hooks/useRipple.ts'
import { useTilt } from '../hooks/useTilt.ts'
import { useScrollKeep } from '../hooks/useScrollKeep.ts'
import { useFocusReturn } from '../hooks/useFocusReturn.ts'
import TabBar from '../components/frame/TabBar.tsx'
import { pickScreen, showsTabBar } from './pickScreen.ts'
import { resolve, screenFor } from './screens.tsx'
import { splitHead } from './splitHead.tsx'
import { isWalled, sendToSignIn } from './wall.ts'
import SheetHost from './SheetHost.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import UpdatePrompt from './UpdatePrompt.tsx'

export default function ScreenHost() {
  // TODO(R-06): whole-store subscription goes when screens become TanStack Router routes (REACT-PLAN.md).
  const store = useStore()
  const { plan } = store
  const authed = useShell((shell) => shell.authed)
  const renderCount = useShell((shell) => shell.renderCount)
  const desk = useShell((shell) => shell.desk)
  const { landscape } = useViewport(desk)
  const ref = useRef<HTMLDivElement>(null)

  const picked = pickScreen(plan, store)
  const walled = isWalled(picked.key, authed)
  const { key, param } = walled ? { key: 'P1' } : picked
  const screen = screenFor(key, plan, store)
  const id = resolve(screen.id, plan, store, param)
  const note = resolve(screen.note, plan, store, param)
  const renderKey = `${id}:${renderCount}`

  useEffect(() => {
    if (walled) sendToSignIn(picked.key)
  }, [walled, picked.key])

  useCountUp(ref, renderKey)
  useFndWatch(ref, renderKey)
  useOrbit(ref, renderKey)
  useRipple(ref)
  useTilt(ref)
  useScrollKeep(ref, renderKey)
  useFocusReturn(ref, renderKey)

  useLayoutEffect(() => showCurrentScreen(id, note), [id, note])

  // Called, not rendered: splitHead must see Head's own children to pin the logo bar.
  // TODO(R-06): goes with the TanStack Router layouts, where each route renders its pinned bar itself.
  const head = screen.Head?.({ param }) ?? null
  const [pinnedHead, pageHead] = landscape ? [head, null] : splitHead(head)
  const Foot = screen.footFor ? screen.footFor(plan, store) : screen.Foot
  const body = (
    <ErrorBoundary>
      <screen.Body param={param} />
    </ErrorBoundary>
  )
  const sky = <header className="sky">{pinnedHead}</header>

  // .enter stays on: a new screen remounts the keyed child below, which replays the rise animation.
  return (
    <div id="screen" className="enter" ref={ref}>
      {screen.kind === 'quiz' ? (
        <div className="quiz" key={renderKey}>
          {body}
        </div>
      ) : (
        <div className="app" key={renderKey}>
          {!landscape && sky}
          <div className="scroll" id="main">
            {landscape ? sky : pageHead}
            {body}
          </div>
          {Foot && (
            <div className="foot">
              <Foot param={param} />
            </div>
          )}
          {showsTabBar(plan, store) && !walled && <TabBar />}
        </div>
      )}
      <SheetHost />
      <UpdatePrompt />
    </div>
  )
}
