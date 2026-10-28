import { useEffect, useLayoutEffect, useRef } from 'react'
import { useStore } from '../state/store.ts'
import { showCurrentScreen, useShell } from '../state/shell.ts'
import { useViewport } from '../hooks/useViewport.ts'
import { useScreenEnter } from '../hooks/useScreenEnter.ts'
import { useCountUp } from '../hooks/useCountUp.ts'
import { useFndWatch } from '../hooks/useFndWatch.ts'
import { useOrbit } from '../hooks/useOrbit.ts'
import { useScrollKeep } from '../hooks/useScrollKeep.ts'
import { useFocusReturn } from '../hooks/useFocusReturn.ts'
import TabBar from '../components/frame/TabBar.tsx'
import { pickScreen, showsTabBar } from './pickScreen.ts'
import { resolve, screenFor } from './screens.tsx'
import { splitHead } from './splitHead.tsx'
import { isWalled, sendToSignIn } from './wall.ts'
import SheetHost from './SheetHost.tsx'

export default function ScreenHost() {
  // Subscribes to the whole plan on purpose: screen heads read it without subscribing themselves.
  const plan = useStore((store) => store.plan)
  const current = useStore((store) => store.screen)
  const authed = useShell((shell) => shell.authed)
  const renderCount = useShell((shell) => shell.renderCount)
  const desk = useShell((shell) => shell.desk)
  const { landscape } = useViewport(desk)
  const ref = useRef<HTMLDivElement>(null)

  const picked = pickScreen(plan, current)
  const walled = isWalled(picked.key, authed)
  const { key, param } = walled ? { key: 'P1' } : picked
  const screen = screenFor(key, plan)
  const id = resolve(screen.id, plan, param)
  const note = resolve(screen.note, plan, param)
  const renderKey = `${id}:${renderCount}`

  useEffect(() => {
    if (walled) sendToSignIn(picked.key)
  }, [walled, picked.key])

  useScreenEnter(ref, renderKey)
  useCountUp(ref, renderKey)
  useFndWatch(ref, renderKey)
  useOrbit(ref, renderKey)
  useScrollKeep(ref, renderKey)
  useFocusReturn(ref, renderKey)

  useLayoutEffect(() => showCurrentScreen(id, note), [id, note])

  const head = screen.Head?.({ param }) ?? null
  const [pinnedHead, pageHead] = landscape ? [head, null] : splitHead(head)
  const Foot = screen.footFor ? screen.footFor(plan) : screen.Foot
  const body = <screen.Body param={param} />
  const sky = <header className="sky">{pinnedHead}</header>

  return (
    <div id="screen" ref={ref}>
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
          {showsTabBar(plan) && !walled && <TabBar />}
        </div>
      )}
      <SheetHost />
    </div>
  )
}
