import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import Emo from '../ui/Emo.tsx'
import { useStore } from '../../state/store.ts'
import { useDocumentUpload } from '../../documents/documents.ts'

/** What the reader can take for this section: choose files or use a sample document. */
export default function UploadPick({ section }: { section: FinanceSection }) {
  const { startUpload, chooseSectionMode } = useStore.getState()
  const { on, pending, upload } = useDocumentUpload()
  return (
    <div className="card">
      <b>What we can read</b>
      <div className="upl" style={{ marginTop: 10 }}>
        {section.documents.map(([emoji, label]) => (
          <div key={label} className="tile">
            <span className="e" aria-hidden="true">
              {emoji}
            </span>
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {on ? (
          <label className="btn ghost" style={{ cursor: 'pointer' }} aria-disabled={pending}>
            <Emo>{pending ? '📄 Uploading…' : '📄 Choose files'}</Emo>
            <input
              type="file"
              multiple
              className="sr"
              data-file={section.id}
              accept=".pdf,.jpg,.jpeg,.png,.heic"
              disabled={pending}
              onChange={(event) =>
                upload(event.currentTarget, (files) => startUpload(section.id, files))
              }
            />
          </label>
        ) : null}
        <button
          className="btn"
          data-a="upl"
          data-p={section.id}
          onClick={() => startUpload(section.id, ['Sample document.pdf'])}
        >
          Use a sample document
        </button>
      </div>
      <p className="small" style={{ marginTop: 10 }}>
        {on
          ? 'Documents are stored privately in your account.'
          : 'Documents stay on your device; we only keep the file name.'}{' '}
        You see every figure before it's used.
      </p>
      <button
        className="link"
        data-a="fmode"
        data-p="type"
        onClick={() => chooseSectionMode('type')}
      >
        Upload not working? Type it instead
      </button>
    </div>
  )
}
