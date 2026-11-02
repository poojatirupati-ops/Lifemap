import FlowHead from '../components/frame/FlowHead.tsx'
import SectionFields from '../components/finance/SectionFields.tsx'
import UploadPick from '../components/finance/UploadPick.tsx'
import Emo from '../components/ui/Emo.tsx'
import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'
import { currentSection, sectionMode } from '../state/finances.ts'
import { useStore } from '../state/store.ts'
import type { Plan, Ui } from '../state/types.ts'

export const key = 'P3'
export const id = (_: Plan, ui: Ui) => `P3-${ui.financeSection! + 1}`
export const note = (_: Plan, ui: Ui) =>
  `Section ${ui.financeSection! + 1} of 6 · ${currentSection(ui)!.title}. Upload vs Type it; every field has "Not sure? See an example" (§15), which never fills the field.`

const SUBTITLE: Record<string, string> = {
  about: 'Mostly filled in from your answers. Just check it.',
  prot: 'Say Yes or No for each type. Add the details if you like.',
}
const MODES = [
  ['upload', '📄 Upload'],
  ['type', '⌨️ Type it'],
] as const

// ScreenHost calls Head as a plain function (no hooks), so it reads the store directly.
export function Head() {
  const { financeSection, leaveSection } = useStore.getState()
  const { id, emoji, title } = currentSection({ financeSection })!
  return FlowHead({
    eye: `Your finances · ${financeSection! + 1} of 6`,
    title: <Emo>{`${emoji} ${title}`}</Emo>,
    sub: SUBTITLE[id] ?? 'Upload a document or type it in. Round figures are fine.',
    back: leaveSection,
  })
}

export function Body() {
  const section = useStore(currentSection)
  const mode = useStore((store) => sectionMode(store.plan, store))
  const chooseSectionMode = useStore((store) => store.chooseSectionMode)
  if (!section) return null

  return (
    <>
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
        <SectionFields
          key={section.id}
          section={section}
          index={FINANCE_SECTIONS.indexOf(section)}
        />
      )}
    </>
  )
}

export function Foot() {
  const saveSection = useStore((store) => store.saveSection)
  return (
    <button className="btn" data-a="fsave" onClick={saveSection}>
      Save this section
    </button>
  )
}
