import FlowHead from '../components/frame/FlowHead.tsx'
import SectionFields from '../components/finance/SectionFields.tsx'
import UploadPick from '../components/finance/UploadPick.tsx'
import {
  chooseSectionMode,
  leaveSection,
  saveSection,
} from '../components/finance/sectionActions.ts'
import Emo from '../components/ui/Emo.tsx'
import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'P3'
export const id = (plan: Plan) => `P3-${plan.fsec! + 1}`
export const note = (plan: Plan) =>
  `Section ${plan.fsec! + 1} of 6 · ${FINANCE_SECTIONS[plan.fsec!].title}. Upload vs Type it; every field has "Not sure? See an example" (§15), which never fills the field.`

const SUBTITLE: Record<string, string> = {
  about: 'Mostly filled in from your answers. Just check it.',
  prot: 'Say Yes or No for each type. Add the details if you like.',
}
const MODES = [
  ['upload', '📄 Upload'],
  ['type', '⌨️ Type it'],
] as const

export const Head = () => {
  const index = useStore.getState().plan.fsec!
  const { id, emoji, title } = FINANCE_SECTIONS[index]
  return FlowHead({
    eye: `Your finances · ${index + 1} of 6`,
    title: <Emo>{`${emoji} ${title}`}</Emo>,
    sub: SUBTITLE[id] ?? 'Upload a document or type it in. Round figures are fine.',
    back: leaveSection,
  })
}

export function Body() {
  const index = useStore(({ plan }) => plan.fsec)
  const modes = useStore(({ plan }) => plan.fmode)
  if (index == null) return null
  const section = FINANCE_SECTIONS[index]
  const canUpload = section.documents.length > 0
  const mode = (canUpload && modes[section.id]) || 'type'

  return (
    <>
      {canUpload ? (
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
      {section.id !== 'about' && (
        <p className="small" style={{ margin: '0 2px 10px' }}>
          Skip anything you don't have. It counts as €0.
        </p>
      )}
      {mode === 'upload' ? (
        <UploadPick section={section} />
      ) : (
        <SectionFields key={section.id} section={section} index={index} />
      )}
    </>
  )
}

export function Foot() {
  return (
    <button className="btn" data-a="fsave" onClick={saveSection}>
      Save this section
    </button>
  )
}
