import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import GIcon from '../ui/GIcon.tsx'
import { useStore } from '../../state/store.ts'
import type { SectionStatus } from './status.ts'

const STATUS: Record<SectionStatus, { word: string; className: string; mark: string }> = {
  done: { word: 'Done', className: 'done', mark: '✓' },
  look: { word: 'Needs a look', className: 'look', mark: '!' },
  part: { word: 'In progress', className: '', mark: '…' },
  none: { word: 'Not started', className: '', mark: '' },
}

interface Props {
  section: FinanceSection
  index: number
  status: SectionStatus
  summary: string
}

/** One section of Your finances: what is in it so far and how far along it is. */
export default function SectionRow({ section, index, status, summary }: Props) {
  const { word, className, mark } = STATUS[status]
  return (
    <button
      className="goal"
      data-a="fsec"
      data-p={index}
      onClick={() => useStore.getState().openSection(index)}
    >
      <GIcon emoji={section.emoji} className="ic" aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <b>{section.title}</b>
        <br />
        <span className="small">{summary}</span>
      </span>
      <span className="sr">{word}</span>
      <span className={`stat ${className}`} aria-hidden="true">
        {mark}
      </span>
    </button>
  )
}
