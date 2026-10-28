import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import Emo from '../ui/Emo.tsx'
import { chooseSectionMode } from './sectionActions.ts'
import { startUpload } from './uploadActions.ts'

/** What the reader can take for this section: choose files or use a sample document. */
export default function UploadPick({ section }: { section: FinanceSection }) {
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
        <label className="btn ghost" style={{ cursor: 'pointer' }}>
          <Emo>📄 Choose files</Emo>
          <input
            type="file"
            multiple
            className="sr"
            data-file={section.id}
            accept=".pdf,.jpg,.jpeg,.png,.heic"
            onChange={(event) => {
              const files = [...(event.currentTarget.files ?? [])].map((file) => file.name)
              if (files.length) startUpload(section.id, files)
            }}
          />
        </label>
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
        Documents stay on your device; we only keep the file name. You see every figure before it's
        used.
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
