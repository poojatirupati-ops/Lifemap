import type { KeyboardEvent } from 'react'
import { euro } from '../../lib/format.ts'

type Unit = 'age' | '%' | '€' | 'yrs' | ''

// what shows before and after the number
const AROUND: Record<Unit, [before: string, after: string]> = {
  age: ['age ', ''],
  '%': ['', '%'],
  '€': ['€', ''],
  yrs: ['', 'yrs'],
  '': ['', ''],
}

interface Props {
  /** data-nb, e.g. "ret|a": also names the hint (nh-ret-a). */
  name: string
  value: number | null
  unit: Unit
  labelledBy: string
  id?: string
  min: number
  max: number
  whole?: boolean
  onCommit: (value: number) => void
  /** Why a typed value was changed (Max 89, Whole numbers only), or '' when it was not. */
  onHint: (hint: string) => void
  /** An optional figure left blank (on Enter) goes back to not set. */
  onClear?: () => void
}

const format = (value: number) => (+value.toFixed(4)).toLocaleString('en-IE')
const width = (text: string) => `${Math.max(2, text.length) + 0.6}ch`

function parse(text: string) {
  const digits = text.replace(/[^\d.,-]/g, '').replace(/,/g, '')
  const value = parseFloat(digits)
  return Number.isFinite(value) ? value : null
}

/** The original's .nbox: a typed number kept between min and max; onHint says when it was changed. */
export default function ChoiceNumberBox(props: Props) {
  const { name, value, unit, labelledBy, id, min, max, whole, onCommit, onHint, onClear } = props
  const shown = value == null ? '' : format(value)
  const [before, after] = AROUND[unit]
  const limit = (figure: number) => (unit === '€' ? euro(figure) : format(figure))

  function commit(text: string) {
    const typed = parse(text)
    if (typed == null) return
    const limited = Math.min(max, Math.max(min, typed))
    const rounded = whole ? Math.round(limited) : limited
    if (typed > max) onHint(`Max ${limit(max)}${unit === '%' ? '%' : unit === 'yrs' ? ' yrs' : ''}`)
    else if (typed < min) onHint(`Min ${limit(min)}`)
    else onHint(rounded !== typed ? 'Whole numbers only' : '')
    onCommit(rounded)
  }

  function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const text = event.currentTarget.value
    if (onClear && !text.trim()) onClear()
    else commit(text)
  }

  return (
    <span className="nbox">
      {before && (
        <span className="nbu" aria-hidden="true">
          {before}
        </span>
      )}
      <input
        className="nb"
        id={id}
        type="text"
        inputMode={whole ? 'numeric' : 'decimal'}
        style={{ width: width(shown) }}
        data-nb={name}
        defaultValue={shown}
        aria-labelledby={labelledBy}
        autoComplete="off"
        enterKeyHint="done"
        onInput={(event) => {
          event.currentTarget.style.width = width(event.currentTarget.value)
          commit(event.currentTarget.value)
        }}
        onKeyDown={commitOnEnter}
      />
      {after && (
        <span className="nbu" aria-hidden="true">
          {after}
        </span>
      )}
    </span>
  )
}
