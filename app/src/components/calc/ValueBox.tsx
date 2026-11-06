import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { euro, readPoints } from '../../lib/format.ts'
import type { CalcInput } from '../../domain/calc/types.ts'

interface Props {
  input: CalcInput
  value: number | null
  onCommit: (value: number) => void
  /** Why a typed figure was changed, or '' (shown in the field's .nbhint). */
  onHint: (hint: string) => void
}

const UNIT_TEXT: Partial<Record<CalcInput['unit'], [before: string, after: string]>> = {
  '€': ['€', ''],
  '%': ['', '%'],
  y: ['', 'yrs'],
  m: ['', 'mo'],
  age: ['age ', ''],
}

/** 12,500 or 3.75 */
const formatFigure = (value: number) =>
  Math.abs(value % 1) > 1e-9
    ? (+value.toFixed(4)).toLocaleString('en-IE', { maximumFractionDigits: 4 })
    : Math.round(value).toLocaleString('en-IE')

const width = (text: string) => `${Math.max(2, text.length) + 0.6}ch`

/** A typed figure kept within the tool's limits, and why it was changed (Max €2,500,000). */
function limit(input: CalcInput, typed: number) {
  const [, after] = UNIT_TEXT[input.unit] ?? ['', '']
  // € figures may go above the slider's top
  const max = input.unit === '€' ? input.max * 10 : input.max
  const whole = ['y', 'm', 'age'].includes(input.unit) && input.step % 1 === 0
  let value = typed
  let hint = ''
  if (value > max) {
    value = max
    const unit = input.unit === '%' ? '%' : after ? ' ' + after : ''
    hint = 'Max ' + (input.unit === '€' ? euro(max) : formatFigure(max) + unit)
  } else if (value < input.min) {
    value = input.min
    hint = 'Min ' + (input.unit === '€' ? euro(input.min) : formatFigure(input.min))
  }
  if (whole && value !== Math.round(value)) {
    value = Math.round(value)
    hint ||= 'Whole numbers only'
  }
  return { value, hint }
}

/** The editable figure (the original's .nbox) beside a calculator slider: commits while typing and on Enter or leaving it. */
export default function ValueBox({ input, value, onCommit, onHint }: Props) {
  const box = useRef<HTMLInputElement>(null)
  const shown = value == null ? '' : formatFigure(value)
  const [before, after] = UNIT_TEXT[input.unit] ?? ['', '']
  // after the first render the width follows what is typed (or shown), never a re-render
  const [firstWidth] = useState(() => width(shown))

  // a slider move or a standard chip changes the figure: show it unless the customer is typing here
  useLayoutEffect(() => {
    const element = box.current
    if (!element || document.activeElement === element) return
    element.value = shown
    element.style.width = width(shown)
  }, [shown])

  function commit(final: boolean) {
    const element = box.current!
    const typed = readPoints(element.value)
    if (typed == null) {
      if (final) element.value = shown
      return
    }
    const limited = limit(input, typed)
    onHint(limited.hint)
    onCommit(limited.value)
    if (!final) return
    element.value = formatFigure(limited.value)
    element.style.width = width(element.value)
  }

  function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    commit(true)
  }

  return (
    <span className="nbox">
      {before ? (
        <span className="nbu" aria-hidden="true">
          {before}
        </span>
      ) : null}
      <input
        ref={box}
        className="nb"
        id={`co-${input.key}`}
        type="text"
        inputMode={input.step % 1 !== 0 || input.unit === '%' ? 'decimal' : 'numeric'}
        style={{ width: firstWidth }}
        data-nb={`ck|${input.key}`}
        defaultValue={shown}
        aria-labelledby={`cl-${input.key}`}
        autoComplete="off"
        enterKeyHint="done"
        onInput={(event) => {
          event.currentTarget.style.width = width(event.currentTarget.value)
          commit(false)
        }}
        onBlur={() => commit(true)}
        onKeyDown={commitOnEnter}
        onFocus={(event) => event.currentTarget.select()}
      />
      {after ? (
        <span className="nbu" aria-hidden="true">
          {after}
        </span>
      ) : null}
    </span>
  )
}
