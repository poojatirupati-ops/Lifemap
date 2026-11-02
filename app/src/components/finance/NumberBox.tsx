import type { InputHTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { parseWholeEuros } from '../../lib/format.ts'

type Kind = 'eur' | 'pct' | 'num' | 'text'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type' | 'name'> {
  id: string
  kind: Kind
  value: unknown
  /** The highest percentage accepted. */
  maxPercent?: number
  onValue: (value: number | string | null) => void
}

// What was typed: text (blank is none), a count up to 120, or whole euros.
const TYPED = {
  text: z.string().transform((text) => (text.trim() ? text : null)),
  num: z.string().transform((text) => {
    const count = parseWholeEuros(text)
    return count == null ? null : Math.min(120, count)
  }),
  eur: z.string().transform(parseWholeEuros),
}

const percentUpTo = (max: number) =>
  z.string().transform((text) => {
    const percent = parseFloat(text.replace(/[^\d.]/g, ''))
    return isNaN(percent) ? null : Math.min(max, percent)
  })

function shown(kind: Kind, value: unknown) {
  if (value == null) return ''
  if (kind === 'pct' || kind === 'text') return String(value)
  return String(Math.round(Number(value)))
}

/**
 * A typed figure in the original's .in box (with € or % for amounts). Uncontrolled: what is typed
 * stays while typing, as in the original; the box shows the figure in use again on leaving it, or
 * when something else changes it (a statement read or removed) while nothing is being typed.
 */
export default function NumberBox({ id, kind, value, maxPercent = 100, onValue, ...input }: Props) {
  const inUse = { typed: shown(kind, value) }
  const { register, setValue, reset } = useForm({
    values: inUse,
    resetOptions: { keepDirtyValues: true },
  })
  // the DOM keeps the original's markup: no name attribute, React's own onInput
  const { ref } = register('typed')

  const field = (
    <input
      {...input}
      ref={ref}
      className={{ eur: 'in eur', pct: 'in pct', num: 'in', text: 'in' }[kind]}
      id={id}
      inputMode={kind === 'text' ? undefined : kind === 'pct' ? 'decimal' : 'numeric'}
      onInput={(event) => {
        const text = event.currentTarget.value
        setValue('typed', text, { shouldDirty: true })
        onValue((kind === 'pct' ? percentUpTo(maxPercent) : TYPED[kind]).parse(text))
      }}
      onBlur={() => reset(inUse, { keepDirtyValues: false, keepFieldsRef: true })}
    />
  )
  if (kind === 'text') return field
  return (
    <div className="inw">
      {kind === 'eur' ? (
        <span className="cur" aria-hidden="true">
          €
        </span>
      ) : null}
      {field}
      {kind === 'pct' ? (
        <span className="cur suf" aria-hidden="true">
          %
        </span>
      ) : null}
    </div>
  )
}
