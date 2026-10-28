import Emo from '../ui/Emo.tsx'
import { correctFigure } from './statementActions.ts'
import type { StatementFigure } from './statements.data.ts'

/** One figure read from a statement: how sure the reader is, and a box to correct it. */
export default function StatementFigureRow({
  figure: [key, label, read, confidence, unit, optional],
  typed,
}: {
  figure: StatementFigure
  typed?: string
}) {
  return (
    <div className="mini" style={{ alignItems: 'center' }}>
      <span style={{ flex: 1 }}>
        <b style={{ fontSize: 14 }}>
          {label}
          {unit === '%' && ' (%)'}
        </b>
        <br />
        {confidence < 80 ? (
          <span className="tag look">
            <Emo>{`⚠️ Check this · ${confidence}% sure`}</Emo>
          </span>
        ) : (
          <span className="tag doc">✓ {confidence}% sure</span>
        )}
        {optional && (
          <>
            {' '}
            <span className="small">If shown · clear it if not</span>
          </>
        )}
      </span>
      <input
        className="in"
        style={{ width: 110, minHeight: 42 }}
        inputMode="decimal"
        data-pv={key}
        defaultValue={typed ?? String(read)}
        aria-label={label}
        onInput={(event) => correctFigure(key, event.currentTarget.value)}
      />
    </div>
  )
}
