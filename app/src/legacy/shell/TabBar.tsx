import Emoji from '../components/ui/Emoji.tsx'
import { tabs } from './flow.data.ts'
import type { Tab } from './route.ts'

export default function TabBar({ active }: { active: Tab }) {
  return (
    <nav aria-label="Main" className="tabbar">
      {tabs.map(t => (
        <a key={t.tab} href={`#${t.path}`} aria-current={t.tab === active ? 'page' : undefined} className={t.tab === 'plan' ? 'centre' : undefined}>
          <Emoji>{t.icon}</Emoji>
          <span>{t.label}</span>
        </a>
      ))}
    </nav>
  )
}
