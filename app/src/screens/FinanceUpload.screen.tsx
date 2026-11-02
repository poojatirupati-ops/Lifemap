import FlowHead from '../components/frame/FlowHead.tsx'
import UploadReview from '../components/finance/UploadReview.tsx'
import { LISTS } from '../domain/finances/lists.data.ts'
import { readValuesToConfirm } from '../domain/finances/upload.ts'
import { useStore } from '../state/store.ts'
import type { Plan, Ui } from '../state/types.ts'

export const key = 'PU'
export const id = (_: Plan, ui: Ui) => `PU-${ui.upload?.stage ?? 'scan'}`
export const note = (_plan: Plan, { upload }: Ui) => {
  if (upload?.stage === 'fail')
    return 'Upload failed → Type it; missing doc stays on the checklist (CJ D10).'
  if (upload?.stage !== 'confirm') return 'Reading documents (mock IDP).'
  if (upload.item) {
    return `"We read these values, please confirm" for ONE ${LISTS[upload.item.list].singular} (journey-spec §19). Under 80% confidence = Check this.`
  }
  return '"We read these values — please confirm". Under 80% confidence = Check this.'
}

const HEADS = {
  fail: {
    title: "We couldn't read that one",
    sub: "No problem. You can type the figures instead. We'll keep the document on your checklist.",
  },
  confirm: {
    title: 'We read these values',
    sub: 'Please confirm. Change anything that looks wrong.',
  },
}

// ScreenHost calls Head as a plain function (no hooks), so it reads the store directly.
export function Head() {
  const { upload, cancelUpload } = useStore.getState()
  if (upload && upload.stage !== 'scan') {
    return FlowHead({ eye: 'Your finances', ...HEADS[upload.stage], back: cancelUpload })
  }
  return FlowHead({
    eye: 'Your finances',
    title: 'Reading your documents…',
    sub: upload?.files.join(', '),
  })
}

export function Body() {
  const upload = useStore(({ upload }) => upload)
  if (!upload) return null
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
        <p className="small">{upload.files.join(', ')}</p>
      </div>
    )
  }
  return readValuesToConfirm(upload).map((document) => (
    <UploadReview key={document.title} {...document} edit={upload.edit} />
  ))
}

export function Foot() {
  const stage = useStore(({ upload }) => upload?.stage)
  const { typeInstead, addReadValues, cancelUpload } = useStore.getState()
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
