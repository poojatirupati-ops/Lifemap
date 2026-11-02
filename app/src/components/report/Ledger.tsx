import type { ReportData } from '../../report/model/reportData.ts'

type LedgerRow = ReportData['money']['own']['rows'][number]

/** "YOU OWN" or "YOU OWE": a figure per row, or Missing. */
export default function Ledger({ title, rows }: { title: string; rows: LedgerRow[] }) {
  return (
    <>
      <div className="lmr-led-t">{title}</div>
      {rows.map((row) => (
        <div className="lmr-row" key={row.label}>
          <span>{row.label}</span>
          {row.status === 'missing' ? (
            <span className="lmr-miss">Missing</span>
          ) : (
            <b>{row.value}</b>
          )}
        </div>
      ))}
    </>
  )
}
