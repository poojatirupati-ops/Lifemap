/** Two columns of "Prices rise · 2% a year"; a long value takes its own line. */
export default function AssumedRows({ rows }: { rows: string[][] }) {
  return rows.map(([name, value]) => (
    <div className={value.length > 31 ? 'lmr-ar lg' : 'lmr-ar'} key={name}>
      <b className="lmx-k">{name}</b>
      <b className="lmx-v">{value}</b>
    </div>
  ))
}
