import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { openReport } from '../../report/openReport.ts'

const SHORTCUTS: {
  emoji: string
  title: string
  text: string
  a: string
  p?: string
  open: () => void
}[] = [
  {
    emoji: '🗓️',
    title: 'My timeline',
    text: 'See your goals by age',
    a: 'seg',
    p: 'timeline',
    open: () => useStore.getState().showSection('timeline'),
  },
  {
    emoji: '🔮',
    title: 'Try a what-if',
    text: 'Test a change to your plan',
    a: 'gowi',
    open: () => useStore.getState().tryWhatIf(),
  },
  {
    emoji: '📥',
    title: 'Add a document',
    text: 'Fill figures from a statement',
    a: 'upl',
    p: 'smart',
    open: () => useStore.getState().startUpload('smart', ['Sample document.pdf']),
  },
  {
    emoji: '⬇️',
    title: 'Download my plan',
    text: 'Your plan as a report',
    a: 'report',
    open: openReport,
  },
]

export default function Shortcuts() {
  return (
    <div className="svc2 sc3">
      {SHORTCUTS.map(({ emoji, title, text, a, p, open }) => (
        <button key={title} className="sv2" data-a={a} data-p={p} onClick={open}>
          <GIcon className="sv2-i" emoji={emoji} aria-hidden="true" />
          <span className="sv2-t">
            <b>{title}</b>
            <small>{text}</small>
          </span>
          <span className="sv2-go" aria-hidden="true">
            →
          </span>
        </button>
      ))}
    </div>
  )
}
