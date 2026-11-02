import type { ButtonHTMLAttributes } from 'react'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { openReport, preloadReport } from '../../report/openReport.ts'

type TileProps = {
  emoji: string
  title: string
  text: string
  /** the original's data-a / data-p */
  a: string
  p?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

/** A service tile: icon, title, one line and an arrow. */
export function ServiceTile({ emoji, title, text, a, p, ...button }: TileProps) {
  return (
    <button className="sv2" data-a={a} data-p={p} {...button}>
      <GIcon className="sv2-i" emoji={emoji} aria-hidden="true" />
      <span className="sv2-t">
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <span className="sv2-go" aria-hidden="true">
        →
      </span>
    </button>
  )
}

const SHORTCUTS: TileProps[] = [
  {
    emoji: '🗓️',
    title: 'My timeline',
    text: 'See your goals by age',
    a: 'seg',
    p: 'timeline',
    onClick: () => useStore.getState().showSection('timeline'),
  },
  {
    emoji: '🔮',
    title: 'Try a what-if',
    text: 'Test a change to your plan',
    a: 'gowi',
    onClick: () => useStore.getState().tryWhatIf(),
  },
  {
    emoji: '📥',
    title: 'Add a document',
    text: 'Fill figures from a statement',
    a: 'upl',
    p: 'smart',
    onClick: () => useStore.getState().startUpload('smart', ['Sample document.pdf']),
  },
  {
    emoji: '⬇️',
    title: 'Download my plan',
    text: 'Your plan as a report',
    a: 'report',
    onClick: openReport,
    onPointerEnter: preloadReport,
    onFocus: preloadReport,
  },
]

export default function Shortcuts() {
  return (
    <div className="svc2 sc3">
      {SHORTCUTS.map((tile) => (
        <ServiceTile key={tile.title} {...tile} />
      ))}
    </div>
  )
}
