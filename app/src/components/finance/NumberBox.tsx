import { useEffect, useRef, type InputHTMLAttributes } from 'react'

type Kind = 'eur' | 'pct' | 'num' | 'text'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type'> {
  id: string
  kind: Kind
  value: unknown
  /** The highest percentage accepted. */
  maxPercent: number
  onValue: (value: number | string | null) => void
}

const shown = (kind: Kind, value: unknown) =>
  value == null
    ? ''
    : kind === 'pct' || kind === 'text'
      ? String(value)
      : String(Math.round(Number(value)))

/** What was typed: text as it is, a percentage up to maxPercent, a count of 0 to 120, or euros. */
function parse(kind: Kind, text: string, maxPercent: number) {
  if (kind === 'text') return text
  if (kind === 'pct') {
    const percent = parseFloat(text.replace(/[^\d.]/g, ''))
    return isNaN(percent) ? null : Math.min(maxPercent, percent)
  }
  const whole = parseInt(text.replace(/\D/g, ''))
  if (isNaN(whole)) return null
  return kind === 'num' ? Math.min(120, whole) : whole
}

/**
 * A typed figure in the original's .in box (with € or % for amounts). Uncontrolled: what is typed
 * stays while typing, as in the original; the box shows the figure in use again on leaving it, or
 * when something else changes it (a statement read or removed).
 */
export default function NumberBox({ id, kind, value, maxPercent, onValue, ...input }: Props) {
  const box = useRef<HTMLInputElement>(null)
  // the figure the box shows now
  const showing = useRef(value)

  const show = (figure: unknown) => {
    showing.current = figure
    if (box.current) box.current.value = shown(kind, figure)
  }
  useEffect(() => {
    if (!Object.is(value, showing.current)) show(value)
  })

  const field = (
    <input
      {...input}
      ref={box}
      className={{ eur: 'in eur', pct: 'in pct', num: 'in', text: 'in' }[kind]}
      id={id}
      inputMode={kind === 'text' ? undefined : kind === 'pct' ? 'decimal' : 'numeric'}
      defaultValue={shown(kind, value)}
      onInput={(event) => {
        const typed = parse(kind, event.currentTarget.value, maxPercent)
        showing.current = typed
        onValue(typed)
      }}
      onBlur={() => show(value)}
    />
  )
  if (kind === 'text') return field
  return (
    <div className="inw">
      {kind === 'eur' && (
        <span className="cur" aria-hidden="true">
          €
        </span>
      )}
      {field}
      {kind === 'pct' && (
        <span className="cur suf" aria-hidden="true">
          %
        </span>
      )}
    </div>
  )
}
