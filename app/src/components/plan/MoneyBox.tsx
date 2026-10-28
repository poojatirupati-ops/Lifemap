import { useEffect, useRef, type KeyboardEvent } from 'react'
import { euro } from '../../lib/format.ts'

interface Props {
  /** data-nb, e.g. "wi|m": the hint beside it is nh-wi-m. */
  name: string
  id?: string
  labelledBy: string
  value: number
  min: number
  max: number
  /** What the hint says when the typed amount is over max (default "Max €…"). */
  maxMessage?: string
  /** Show + before amounts above zero. */
  signed?: boolean
  onValue: (amount: number) => void
  onHint: (hint: string) => void
}

const shown = (amount: number, signed?: boolean) =>
  (signed && amount > 0 ? '+' : '') + Math.round(amount).toLocaleString('en-IE')
const width = (text: string) => `${Math.max(2, text.length) + 0.6}ch`

function parse(text: string) {
  const amount = parseFloat(text.replace(/[^\d.,-]/g, '').replace(/,/g, ''))
  return Number.isFinite(amount) ? amount : null
}

/** The original's € .nbox: typed amounts apply as you type, kept between min and max. */
export default function MoneyBox(props: Props) {
  const { name, id, labelledBy, value, min, max, maxMessage, signed, onValue, onHint } = props
  const input = useRef<HTMLInputElement>(null)

  // the −/+ buttons and sliders change the amount: show it unless the customer is typing here
  useEffect(() => {
    const box = input.current
    if (!box || document.activeElement === box) return
    box.value = shown(value, signed)
    box.style.width = width(box.value)
  }, [value, signed])

  function commit(box: HTMLInputElement, final: boolean) {
    const typed = parse(box.value)
    if (typed == null) {
      if (final) box.value = shown(value, signed)
      return
    }
    const amount = Math.min(max, Math.max(min, typed))
    if (typed > max) onHint(maxMessage ?? `Max ${euro(max)}`)
    else if (typed < min) onHint(`Min ${euro(min)}`)
    else onHint('')
    onValue(amount)
    if (final) {
      box.value = shown(amount, signed)
      box.style.width = width(box.value)
    }
  }

  function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    commit(event.currentTarget, true)
  }

  return (
    <span className="nbox">
      <span className="nbu" aria-hidden="true">
        €
      </span>
      <input
        ref={input}
        className="nb"
        id={id}
        type="text"
        inputMode="numeric"
        style={{ width: width(shown(value, signed)) }}
        data-nb={name}
        defaultValue={shown(value, signed)}
        aria-labelledby={labelledBy}
        autoComplete="off"
        enterKeyHint="done"
        onInput={(event) => {
          event.currentTarget.style.width = width(event.currentTarget.value)
          commit(event.currentTarget, false)
        }}
        onBlur={(event) => commit(event.currentTarget, true)}
        onKeyDown={commitOnEnter}
      />
    </span>
  )
}
