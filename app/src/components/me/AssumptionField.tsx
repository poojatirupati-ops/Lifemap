import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import ChoiceNumberBox from '../finance/ChoiceNumberBox.tsx'
import { ASSUMPTIONS } from './assumptionFields.data.ts'
import { resetAssumption, setAssumption } from './assumptionActions.ts'
import {
  formatAssumption,
  isMine,
  marketSuggestion,
  smallPrint,
  standardFor,
  standardNote,
  tagFor,
  valueInUse,
} from './assumptionText.ts'
import { useMePlan } from './mePlan.ts'
import UnknownRateChips from './UnknownRateChips.tsx'

const UNIT = { pct: '%', eur: '€', eurw: '€', yrs: 'yrs', age: 'age', num: '' } as const

/** One assumption: label and tag, a number box or chips, a way back, and how LifeMap sets it. */
export default function AssumptionField({ name }: { name: string }) {
  const field = ASSUMPTIONS[name]
  const view = useMePlan(
    useShallow((plan) => ({
      mine: isMine(plan, name),
      value: valueInUse(plan, name),
      standard: standardFor(plan, name),
      tagClass: tagFor(plan, name).className,
      tagText: tagFor(plan, name).text,
      small: smallPrint(plan, name),
    })),
  )
  const [hint, setHint] = useState('')
  const labelId = `asm-${name}`
  const suggestion = field.market ? marketSuggestion(field) : null
  const kind = view.mine ? 'mine' : view.standard != null ? 'std' : 'assumed'
  const note = kind === 'std' ? standardNote(name) : ''
  const shownValue = view.value == null ? null : Number(view.value)
  const whole = field.kind !== 'pct' && (field.step ?? 1) % 1 === 0

  return (
    <div className="field asmf" data-k={name} data-kind={kind} style={{ margin: '0 0 14px' }}>
      <span className="flabel" id={labelId}>
        {field.label} <span className={view.tagClass}>{view.tagText}</span>
      </span>
      {field.kind === 'choice' ? (
        <div className="chips" role="group" aria-labelledby={labelId}>
          {field.options!.map(([option, label]) => {
            const on = view.value != null && String(view.value) === String(option)
            return (
              <button
                key={option}
                className={on ? 'chip sm sel' : 'chip sm'}
                aria-pressed={on}
                data-a="asmset"
                data-p={`${name}|${option}`}
                onClick={() => setAssumption(name, option)}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <ChoiceNumberBox
            name={`asm|${name}`}
            value={
              field.kind === 'pct' && shownValue != null
                ? +(shownValue * 100).toFixed(2)
                : shownValue
            }
            unit={UNIT[field.kind]}
            labelledBy={labelId}
            min={field.min!}
            max={field.max!}
            whole={whole}
            onCommit={(value) => setAssumption(name, value)}
            onHint={setHint}
            onClear={field.optional ? () => resetAssumption(name) : undefined}
          />
          <span className="nbhint" id={`nh-asm-${name}`} role="status" aria-live="polite">
            {hint}
          </span>
        </>
      )}
      {view.mine && (view.standard != null || suggestion) && (
        <button
          className="chip sm"
          style={{ marginTop: 6 }}
          data-a="asmback"
          data-p={name}
          onClick={() => resetAssumption(name)}
        >
          {view.standard != null
            ? `Back to LifeMap's figure (${formatAssumption(name, view.standard)})`
            : `Back to the assumed rate (${suggestion!.shown})`}
        </button>
      )}
      {(name === 'cardRate' || name === 'loanRate') && <UnknownRateChips rate={name} />}
      {kind === 'assumed' && (!field.optional || suggestion) && view.value != null && (
        <span className="small" style={{ display: 'block', marginTop: 4 }} id={`using-${name}`}>
          We are using {formatAssumption(name, view.value)} (
          {suggestion ? suggestion.source : 'a planning figure'}) until you add yours.
        </span>
      )}
      <span className="small" style={{ display: 'block', marginTop: 4 }}>
        {view.small}
      </span>
      {note && (
        <span className="small" style={{ display: 'block', marginTop: 2 }}>
          {note}
        </span>
      )}
    </div>
  )
}
