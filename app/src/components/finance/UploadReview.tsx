import type { ReadDocument } from '../../domain/finances/upload.ts'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'

/** Shown when the figures are the sample ones (a sample document, or the example reader in dev). */
export const EXAMPLE_FIGURES = 'Example figures'

function sureTag(confidence: number) {
  if (confidence >= 80) return <span className="tag doc">✓ {confidence}% sure</span>
  return (
    <span className="tag look">
      <Emo>{`⚠️ Check this · ${confidence}% sure`}</Emo>
    </span>
  )
}

/** One document's figures as read, each with how sure the reader is; numbers can be corrected. */
export default function UploadReview({
  title,
  documents,
  figures,
  texts = [],
  example,
  edit,
}: ReadDocument & { edit: Record<string, number> }) {
  const { correctReadValue } = useStore.getState()
  return (
    <div className="card">
      <b>
        <Emo>{title}</Emo>
      </b>{' '}
      {example ? <span className="tag est">{EXAMPLE_FIGURES}</span> : null}
      {documents ? <div className="small">{documents}</div> : null}
      {figures.map(({ field, label, value, confidence, stale }) => (
        <div key={field} className="mini" style={{ alignItems: 'center' }}>
          <span style={{ flex: 1 }}>
            <b style={{ fontSize: 14 }}>{label}</b>
            <br />
            {sureTag(confidence)}
            {stale ? (
              <>
                {' '}
                <span className="tag est">{stale}</span>
              </>
            ) : null}
          </span>
          {typeof value === 'number' ? (
            <input
              className="in"
              style={{ width: 120, minHeight: 42 }}
              inputMode="numeric"
              data-uv={field}
              defaultValue={edit[field] ?? value}
              aria-label={label}
              onInput={(event) => correctReadValue(field, event.currentTarget.value)}
            />
          ) : (
            <b>{value}</b>
          )}
        </div>
      ))}
      {texts.map(([label, text]) => (
        <div key={label} className="mini">
          <span>
            <b style={{ fontSize: 14 }}>{label}</b>
          </span>
          <b>{text}</b>
        </div>
      ))}
    </div>
  )
}
