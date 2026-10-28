import type { ComponentProps } from 'react'
import FlowHead from '../components/frame/FlowHead.tsx'
import UploadReview from '../components/finance/UploadReview.tsx'
import { FINANCE_FIELDS } from '../components/finance/fields.data.ts'
import {
  addReadValues,
  cancelUpload,
  typeInstead,
  uploadOf,
} from '../components/finance/uploadActions.ts'
import { ITEM_DOCUMENTS, LIST_FIELDS, LISTS } from '../domain/finances/lists.data.ts'
import { FINANCE_SECTIONS, SECTION_UPLOADS } from '../domain/finances/sections.data.ts'
import { uploadSections, type Upload } from '../domain/finances/upload.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'PU'
export const id = (plan: Plan) => `PU-${uploadOf(plan)?.stage ?? 'scan'}`
export const note = (plan: Plan) => {
  const upload = uploadOf(plan)
  if (upload?.stage === 'fail')
    return 'Upload failed → Type it; missing doc stays on the checklist (CJ D10).'
  if (upload?.stage !== 'confirm') return 'Reading documents (mock IDP).'
  if (upload.item) {
    return `"We read these values, please confirm" for ONE ${LISTS[upload.item.lk].singular} (journey-spec §19). Under 80% confidence = Check this.`
  }
  return '"We read these values — please confirm". Under 80% confidence = Check this.'
}

const useUpload = () => useStore(({ plan }) => uploadOf(plan))

export const Head = () => {
  const upload = uploadOf(useStore.getState().plan)
  if (upload?.stage === 'fail') {
    return FlowHead({
      eye: 'Your finances',
      title: "We couldn't read that one",
      sub: "No problem. You can type the figures instead. We'll keep the document on your checklist.",
      back: cancelUpload,
    })
  }
  if (upload?.stage === 'confirm') {
    return FlowHead({
      eye: 'Your finances',
      title: 'We read these values',
      sub: 'Please confirm. Change anything that looks wrong.',
      back: cancelUpload,
    })
  }
  return FlowHead({
    eye: 'Your finances',
    title: 'Reading your documents…',
    sub: upload?.files.join(', '),
  })
}

type ItemDocument = {
  title: string
  figures: [string, number, number][]
  texts?: [string, string][]
}

// what "We read these values" shows: one card for a list item's statement, else one per section
function reviews(upload: Upload): ComponentProps<typeof UploadReview>[] {
  if (upload.item) {
    const list = upload.item.lk
    const document: ItemDocument = ITEM_DOCUMENTS[list]
    const label = (field: string) => LIST_FIELDS[`${list}.${field}`].label
    return [
      {
        title: document.title,
        edit: upload.edit,
        figures: document.figures.map(([field, value, confidence]) => ({
          field,
          label: label(field),
          value,
          confidence,
        })),
        texts: (document.texts ?? []).map(([field, text]) => [
          label(field).replace(' (optional)', ''),
          text,
        ]),
      },
    ]
  }
  return uploadSections(upload.sec).map((sectionId) => {
    const read = SECTION_UPLOADS[sectionId]
    const section = FINANCE_SECTIONS.find(({ id }) => id === sectionId)!
    return {
      title: `${section.emoji} ${section.title}`,
      documents: read.documents.join(' · '),
      edit: upload.edit,
      figures: Object.entries(read.values).map(([field, [value, confidence]]) => ({
        field,
        label: FINANCE_FIELDS[field].label,
        value,
        confidence,
        stale: read.staleNotes?.[field],
      })),
    }
  })
}

export function Body() {
  const upload = useUpload()
  if (!upload) return null
  const files = upload.files.join(', ')
  if (upload.stage === 'scan') {
    return (
      <>
        <div className="scan" aria-hidden="true">
          📄
        </div>
        <p className="sub" style={{ textAlign: 'center', marginTop: 14 }} role="status">
          Finding the figures we need
        </p>
      </>
    )
  }
  if (upload.stage === 'fail') {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44 }} aria-hidden="true">
          📄❓
        </div>
        <p className="small">{files}</p>
      </div>
    )
  }
  return reviews(upload).map((review) => <UploadReview key={review.title} {...review} />)
}

export function Foot() {
  const stage = useUpload()?.stage
  if (stage === 'fail') {
    return (
      <button className="btn" data-a="uplfail" onClick={typeInstead}>
        Type it instead
      </button>
    )
  }
  if (stage !== 'confirm') return null
  return (
    <>
      <button className="btn" data-a="uplok" onClick={addReadValues}>
        Looks right, add them
      </button>
      <button className="btn ghost" data-a="uplx" onClick={cancelUpload}>
        Cancel
      </button>
    </>
  )
}
