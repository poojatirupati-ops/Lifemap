import { useId } from 'react'
import './ui.css'

type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  unit?: string // shown after the box, never inside the typing area (sec 27.2)
}

// Digits and at most one dot, so '1.2.3' can never reach a parser.
const oneDot = (v: string) => {
  const [a, ...rest] = v.replace(/[^\d.]/g, '').split('.')
  return rest.length ? `${a}.${rest.join('')}` : a
}

export default function NumberField({ label, value, onChange, unit }: Props) {
  const id = useId()
  return (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      <div className="ui-field-row">
        <input
          id={id}
          className="ui-field-input"
          inputMode="decimal"
          value={value}
          aria-describedby={unit ? `${id}-unit` : undefined}
          onChange={(e) => onChange(oneDot(e.target.value))}
        />
        {unit && <span id={`${id}-unit`} className="ui-field-unit">{unit}</span>}
      </div>
    </div>
  )
}
