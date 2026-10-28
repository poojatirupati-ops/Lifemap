import { useStore } from '../../state/store.ts'
import { startUpload } from '../finance/uploadActions.ts'
import { showSection } from '../plan/planActions.ts'
import GIcon from '../ui/GIcon.tsx'
import { tryWhatIf } from './homeActions.ts'

// TODO(R-25): import { openReport } from '../../report/openReport.tsx' once R-22 lands it
const openReport = () => useStore.getState().openSheet('report')

const SHORTCUTS = [
  {
    emoji: '🗓️',
    title: 'My timeline',
    text: 'See your goals by age',
    data: ['seg', 'timeline'],
    open: () => showSection('timeline'),
  },
  {
    emoji: '🔮',
    title: 'Try a what-if',
    text: 'Test a change to your plan',
    data: ['gowi'],
    open: () => tryWhatIf(),
  },
  {
    emoji: '📥',
    title: 'Add a document',
    text: 'Fill figures from a statement',
    data: ['upl', 'smart'],
    open: () => startUpload('smart', ['Sample document.pdf']),
  },
  {
    emoji: '⬇️',
    title: 'Download my plan',
    text: 'Your plan as a report',
    data: ['report'],
    open: openReport,
  },
]

export default function Shortcuts() {
  return (
    <div className="svc2 sc3">
      {SHORTCUTS.map(({ emoji, title, text, data: [a, p], open }) => (
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
