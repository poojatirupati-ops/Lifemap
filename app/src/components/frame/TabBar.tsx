import { clsx } from 'clsx'
import { useStore } from '../../state/store.ts'
import { TAB_ICONS } from '../ui/icons.tsx'
import Brand from './Brand.tsx'

const TABS = [
  { tab: 'home', label: 'Home' },
  { tab: 'explore', label: 'Explore' },
  { tab: 'plan', label: 'My Plan' },
  { tab: 'me', label: 'Me' },
  { tab: 'exp', label: 'Experts' },
] as const

/** The main tab bar; the brand shows on desktop only (CSS) and My Plan is the raised centre button. */
export default function TabBar() {
  const currentTab = useStore((store) => store.plan.tab)
  const switchTab = useStore((store) => store.switchTab)

  return (
    <nav className="tabs" aria-label="Main">
      <div className="nav-brand">
        <Brand />
      </div>
      {TABS.map(({ tab, label }) => {
        const on = tab === currentTab
        const isPlan = tab === 'plan'
        return (
          <button
            key={tab}
            className={clsx(isPlan && 'center', on && 'on')}
            aria-current={on ? 'page' : 'false'}
            onClick={() => switchTab(tab)}
          >
            {isPlan ? <span className="fab">{TAB_ICONS.plan}</span> : TAB_ICONS[tab]}
            {label}
            {isPlan ? null : <span className="dot"></span>}
          </button>
        )
      })}
    </nav>
  )
}
