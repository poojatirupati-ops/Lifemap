import FlowScreen from '../frame/FlowScreen.tsx'
import UploadReview from './UploadReview.tsx'
import { LISTS } from '../../domain/finances/lists.data.ts'
import { readValuesToConfirm, type Upload } from '../../domain/finances/upload.ts'
import { useStore } from '../../state/store.ts'

function noteOf(upload: Upload | null) {
  if (upload?.stage === 'fail')
    return 'Upload failed → Type it; missing doc stays on the checklist (CJ D10).'
  if (upload?.stage !== 'confirm') return 'Reading documents (sample document).'
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

// what the page shows while reading, when it failed, and the figures to confirm
function body(upload: Upload) {
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

/** Reading documents for Your finances (PU); its route needs an upload under way. */
export default function FinanceUpload() {
  const upload = useStore((store) => store.upload)
  const { typeInstead, addReadValues, cancelUpload } = useStore.getState()
  const head =
    upload && upload.stage !== 'scan'
      ? { ...HEADS[upload.stage], back: cancelUpload }
      : { title: 'Reading your documents…', sub: upload?.files.join(', ') }
  const feet = {
    scan: null,
    fail: (
      <button className="btn" data-a="uplfail" onClick={typeInstead}>
        Type it instead
      </button>
    ),
    confirm: (
      <>
        <button className="btn" data-a="uplok" onClick={addReadValues}>
          Looks right, add them
        </button>
        <button className="btn ghost" data-a="uplx" onClick={cancelUpload}>
          Cancel
        </button>
      </>
    ),
  }
  return (
    <FlowScreen
      id={`PU-${upload?.stage ?? 'scan'}`}
      note={noteOf(upload)}
      eye="Your finances"
      {...head}
      // a fragment, so a foot with no buttons stays an empty .foot
      foot={<>{upload ? feet[upload.stage] : null}</>}
    >
      {upload ? body(upload) : null}
    </FlowScreen>
  )
}
