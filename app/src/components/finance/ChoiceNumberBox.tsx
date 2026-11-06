import type { KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { euro, readPoints } from '../../lib/format.ts'

type Unit = 'age' | '%' | '€' | 'yrs' | ''

// what shows before and after the number
const AROUND: Record<Unit, [before: string, after: string]> = {
  age: ['age ', ''],
  '%': ['', '%'],
  '€': ['€', ''],
  yrs: ['', 'yrs'],
  '': ['', ''],
}

// what follows the number in "Max 10%" or "Max 40 yrs"
const MAX_SUFFIX: Partial<Record<Unit, string>> = { '%': '%', yrs: ' yrs' }

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

/** The original's .nbox: a typed number kept between min and max; onHint says when it was changed. */
export default function ChoiceNumberBox(props: Props) {
  const { name, value, unit, labelledBy, id, min, max, whole, onCommit, onHint, onClear } = props
  const shown = value == null ? '' : format(value)
  const [before, after] = AROUND[unit]
  const limit = (figure: number) => (unit === '€' ? euro(figure) : format(figure))

  // shows a figure changed elsewhere (plan-until moving retirement back) unless something was typed
  const { register, setValue } = useForm({
    values: { typed: shown },
    resetOptions: { keepDirtyValues: true },
  })
  // the DOM keeps the original's markup: no name attribute, React's own onInput
  const { ref } = register('typed')

  function commit(text: string) {
    const typed = readPoints(text)
    if (typed == null) return
    // the first limit a typed value breaks is the hint
    const limits = z
      .number()
      .max(max, `Max ${limit(max)}${MAX_SUFFIX[unit] ?? ''}`)
      .min(min, `Min ${limit(min)}`)
      .refine((figure) => !whole || Number.isInteger(figure), 'Whole numbers only')
    const limited = Math.min(max, Math.max(min, typed))
    onHint(limits.safeParse(typed).error?.issues[0].message ?? '')
    onCommit(whole ? Math.round(limited) : limited)
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
      {before ? (
        <span className="nbu" aria-hidden="true">
          {before}
        </span>
      ) : null}
      <input
        className="nb"
        id={id}
        type="text"
        inputMode={whole ? 'numeric' : 'decimal'}
        style={{ width: width(shown) }}
        data-nb={name}
        ref={ref}
        aria-labelledby={labelledBy}
        autoComplete="off"
        enterKeyHint="done"
        onInput={(event) => {
          const text = event.currentTarget.value
          event.currentTarget.style.width = width(text)
          setValue('typed', text, { shouldDirty: true })
          commit(text)
        }}
        onKeyDown={commitOnEnter}
      />
      {after ? (
        <span className="nbu" aria-hidden="true">
          {after}
        </span>
      ) : null}
    </span>
  )
}
