import { useStore } from '../../state/store.ts'
import { rerender } from '../../state/shell.ts'
import { TAB_ICONS } from '../ui/icons.data.ts'
import Svg from '../ui/Svg.tsx'
import Brand from './Brand.tsx'

const TABS = [
  { tab: 'home', label: 'Home' },
  { tab: 'explore', label: 'Explore' },
  { tab: 'plan', label: 'My Plan' },
  { tab: 'me', label: 'Me' },
  { tab: 'exp', label: 'Experts' },
]

function openTab(tab: string) {
  useStore.getState().switchTab(tab)
  rerender()
}

/** The main tab bar; the brand shows on desktop only (CSS) and My Plan is the raised centre button. */
export default function TabBar() {
  const currentTab = useStore((store) => store.plan.tab)

  return (
    <nav className="tabs" aria-label="Main">
      <div className="nav-brand">
        <Brand />
      </div>
      {TABS.map(({ tab, label }) => {
        const on = tab === currentTab
        const ariaCurrent = on ? 'page' : 'false'

        if (tab === 'plan') {
          return (
            <button
              key={tab}
              className={on ? 'center on' : 'center'}
              aria-current={ariaCurrent}
              onClick={() => openTab(tab)}
            >
              <span className="fab">
                <Svg src={TAB_ICONS.plan} />
              </span>
              {label}
            </button>
          )
        }
        return (
          <button
            key={tab}
            className={on ? 'on' : ''}
            aria-current={ariaCurrent}
            onClick={() => openTab(tab)}
          >
            <Svg src={TAB_ICONS[tab]} />
            {label}
            <span className="dot"></span>
          </button>
        )
      })}
    </nav>
  )
}
