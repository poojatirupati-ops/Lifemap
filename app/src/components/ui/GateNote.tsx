/** A choice only the customer can make before results show (e.g. "Retirement age"). */
interface MissingChoice {
  key: string
  label: string
}

interface Props {
  /** Where the note sits; it gives the card its id, gate-<where>. */
  where: string
  missing: MissingChoice[]
  onChoose: (key: string) => void
}

/** The "To see your results we need ..." card; nothing when no choice is missing. */
export default function GateNote({ where, missing, onChoose }: Props) {
  if (!missing.length) return null
  const one = missing.length === 1

  return (
    <div
      className="card"
      id={`gate-${where}`}
      style={{ border: '1.5px dashed #B9C9D6', boxShadow: 'none' }}
    >
      <b>
        To see your results we need {missing.length}
        {one ? ' thing' : ' things'}
      </b>
      <p className="small" style={{ margin: '4px 0 8px' }}>
        Only you can choose {one ? 'this' : 'these'}, so we never fill {one ? 'it' : 'them'} in for
        you. Everything else is set for you and can be changed later.
      </p>
      {missing.map(({ key, label }) => (
        <div key={key} className="mini" style={{ alignItems: 'center' }}>
          <span>
            <b>{label}</b>
          </span>
          <button
            className="btn sm"
            style={{ width: 'auto' }}
            aria-label={`Choose ${label.toLowerCase()}`}
            onClick={() => onChoose(key)}
          >
            Choose
          </button>
        </div>
      ))}
    </div>
  )
}
