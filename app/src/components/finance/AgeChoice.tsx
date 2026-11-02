import { useState } from 'react'
import ChoiceNumberBox from './ChoiceNumberBox.tsx'
import ChoiceTag from './ChoiceTag.tsx'

interface Props {
  /** data-k: retireAge, pRetireAge or planEnd. */
  choice: string
  /** data-nb of the box, e.g. "ret|a". */
  box: string
  label: string
  age: number | null
  range: { min: number; max: number }
  help: string
  /** A calm line under a chosen age, e.g. what retiring before 60 means. */
  note?: { id: string; text: string }
  /** planEnd also carries data-kind. */
  kind?: string
  onChoose: (age: number) => void
}

/** A required age the customer chooses (retirement, partner's retirement, plan-until). */
export default function AgeChoice({
  choice,
  box,
  label,
  age,
  range,
  help,
  note,
  kind,
  onChoose,
}: Props) {
  const labelId = `asm-${choice}`
  const [hint, setHint] = useState('')
  return (
    <div className="field asmf" data-k={choice} data-kind={kind} style={{ margin: '0 0 14px' }}>
      <span className="flabel" id={labelId}>
        {label} <ChoiceTag chosen={age != null} />
      </span>
      <ChoiceNumberBox
        name={box}
        value={age}
        unit="age"
        labelledBy={labelId}
        min={range.min}
        max={range.max}
        whole
        onCommit={onChoose}
        onHint={setHint}
      />
      <span className="nbhint" id={`nh-${box.replace('|', '-')}`} role="status" aria-live="polite">
        {hint}
      </span>
      <span className="small" style={{ display: 'block', marginTop: 4 }}>
        {help}
      </span>
      {note?.text ? (
        <span
          className="small"
          id={note.id}
          role="status"
          style={{ display: 'block', marginTop: 4, color: 'var(--nudge-t)' }}
        >
          {note.text}
        </span>
      ) : null}
    </div>
  )
}
