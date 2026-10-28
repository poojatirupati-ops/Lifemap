import { useEffect, type ComponentType } from 'react'
import BackButton from '../components/nav/BackButton.tsx'
import { useScreenTransition } from '../components/nav/useScreenTransition.ts'
import '../components/nav/nav.css'
import AskButton from './AskButton.tsx'
import SessionNote from './SessionNote.tsx'
import TabBar from './TabBar.tsx'
import { replace } from './nav.ts'
import { useHashPath } from './useHashPath.ts'
import { resolve, type Route, type Status } from './route.ts'
import './shell.css'

type Props = { screens: { route: Route; Screen: ComponentType }[]; status: Status }

/** Router + guard + tab chrome. Redirects replace the entry so Back never loops through the guard. */
export default function Shell({ screens, status }: Props) {
  const routes = screens.map(s => s.route)
  const live = useHashPath()
  const ok = (h: string) => 'show' in resolve(h, routes, status)
  const { hash, enter, box } = useScreenTransition(live, ok)
  const redirect = resolve(live, routes, status)
  const to = 'to' in redirect ? redirect.to : null
  useEffect(() => { if (to) replace(to) }, [to])
  const r = resolve(hash, routes, status)
  if (!('show' in r)) return null
  const Screen = screens.find(s => s.route === r.show)!.Screen
  const { tab, path } = r.show
  return (
    <div className={tab ? 'has-tabs' : undefined}>
      {path === '/sign-in' && hash.includes('expired=1') && <SessionNote />}
      <div ref={box} key={path} className={enter ? `screen enter-${enter}` : 'screen'}>
        {!tab && !r.show.root && <BackButton hash={hash} />}
        <Screen />
      </div>
      {tab && <TabBar active={tab} />}
      {tab && <AskButton />}
    </div>
  )
}
