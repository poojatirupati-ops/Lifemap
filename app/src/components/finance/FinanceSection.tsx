import FlowScreen from '../frame/FlowScreen.tsx'
import SectionFields from './SectionFields.tsx'
import UploadPick from './UploadPick.tsx'
import Emo from '../ui/Emo.tsx'
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { currentSection, sectionMode } from '../../state/finances.ts'
import { useStore } from '../../state/store.ts'

const SUBTITLE: Record<string, string> = {
  about: 'Mostly filled in from your answers. Just check it.',
  prot: 'Say Yes or No for each type. Add the details if you like.',
}
const MODES = [
  ['upload', '📄 Upload'],
  ['type', '⌨️ Type it'],
] as const

/** A section of Your finances (P3); its route sets financeSection from the URL. */
export default function FinanceSection() {
  const section = useStore(currentSection)
  const mode = useStore((store) => sectionMode(store.plan, store))
  const { leaveSection, chooseSectionMode, saveSection } = useStore.getState()
  // null only for a moment, when the next page has cleared the section before this one goes
  if (!section) return null
  const index = FINANCE_SECTIONS.indexOf(section)
  const number = index + 1
  return (
    <FlowScreen
      id={`P3-${number}`}
      note={`Section ${number} of 6 · ${section.title}. Upload vs Type it; every field has "Not sure? See an example" (§15), which never fills the field.`}
      eye={`Your finances · ${number} of 6`}
      title={<Emo>{`${section.emoji} ${section.title}`}</Emo>}
      sub={SUBTITLE[section.id] ?? 'Upload a document or type it in. Round figures are fine.'}
      back={leaveSection}
      foot={
        <button className="btn" data-a="fsave" onClick={saveSection}>
          Save this section
        </button>
      }
    >
      {section.documents.length > 0 ? (
        <div className="seg" role="group" aria-label="How to add">
          {MODES.map(([value, label]) => (
            <button
              key={value}
              className={mode === value ? 'on' : ''}
              aria-pressed={mode === value}
              data-a="fmode"
              data-p={value}
              onClick={() => chooseSectionMode(value)}
            >
              <Emo>{label}</Emo>
            </button>
          ))}
        </div>
      ) : (
        <p className="small">
          {section.id === 'prot'
            ? 'Add a policy under each type if you like. No other documents needed.'
            : 'No documents needed here. ID and proof of address are handled by your adviser later.'}
        </p>
      )}
      {section.id !== 'about' ? (
        <p className="small" style={{ margin: '0 2px 10px' }}>
          Skip anything you don't have. It counts as €0.
        </p>
      ) : null}
      {mode === 'upload' ? (
        <UploadPick section={section} />
      ) : (
        <SectionFields key={section.id} section={section} index={index} />
      )}
    </FlowScreen>
  )
}
