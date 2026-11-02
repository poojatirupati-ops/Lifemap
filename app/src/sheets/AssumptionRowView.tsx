import {
  ASSUMED,
  GOVERNMENT,
  HOW,
  MINE,
  type AssumptionRow,
} from '../domain/planning/assumptions/rows.ts'

const TAG_CLASS: Record<string, string> = {
  [GOVERNMENT]: 'none',
  [MINE]: 'doc',
  [HOW]: 'typed',
  [ASSUMED]: 'look',
}

/** One assumption: its label, where it comes from, and the figure. */
export default function AssumptionRowView({ row }: { row: AssumptionRow }) {
  return (
    <div className="mini">
      <span>
        {row.label}
        <br />
        <span className={`tag ${TAG_CLASS[row.tag] ?? 'pre'}`}>{row.tag}</span>
        {row.note ? (
          <>
            <br />
            <span className="small">{row.note}</span>
          </>
        ) : null}
      </span>
      <b>{row.value}</b>
    </div>
  )
}
