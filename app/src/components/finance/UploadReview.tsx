import type { ReactNode } from 'react'
import Emo from '../ui/Emo.tsx'
import { correctReadValue } from './uploadActions.ts'

export type ReadFigure = {
  field: string
  label: string
  value: number | string
  confidence: number
  stale?: string
}

interface Props {
  title: string
  documents?: string
  figures: ReadFigure[]
  /** Text read as it is (a lender's name), not editable. */
  texts?: [label: string, text: string][]
  edit: Record<string, number>
}

/** One document's figures as read, each with how sure the reader is; numbers can be corrected. */
export default function UploadReview({ title, documents, figures, texts = [], edit }: Props) {
  const sureTag = (confidence: number): ReactNode =>
    confidence < 80 ? (
      <span className="tag look">
        <Emo>{`⚠️ Check this · ${confidence}% sure`}</Emo>
      </span>
    ) : (
      <span className="tag doc">✓ {confidence}% sure</span>
    )

  return (
    <div className="card">
      <b>
        <Emo>{title}</Emo>
      </b>
      {documents && <div className="small">{documents}</div>}
      {figures.map(({ field, label, value, confidence, stale }) => (
        <div key={field} className="mini" style={{ alignItems: 'center' }}>
          <span style={{ flex: 1 }}>
            <b style={{ fontSize: 14 }}>{label}</b>
            <br />
            {sureTag(confidence)}
            {stale && (
              <>
                {' '}
                <span className="tag est">{stale}</span>
              </>
            )}
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
