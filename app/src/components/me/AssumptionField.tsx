import { useState } from 'react'
import type { Plan } from '../../state/types.ts'
import { useStore } from '../../state/store.ts'
import { useShallow } from 'zustand/react/shallow'
import ChoiceNumberBox from '../finance/ChoiceNumberBox.tsx'
import { percent, toNumber } from '../../lib/format.ts'
import { rules2026 } from '../../domain/planning/rates.ts'
import { ASSUMPTIONS, type AdviserRateField } from '../../domain/planning/assumptionFields.data.ts'
import {
  capCardRate,
  leaveRateForAdviser,
  resetAssumption,
  setAssumption,
} from '../../state/assumptions.ts'
import {
  formatAssumption,
  isMine,
  marketSuggestion,
  smallPrint,
  standardFor,
  planRules,
  standardNote,
  TAGS,
  tagFor,
  typedFigure,
  valueInUse,
} from '../../domain/planning/assumptionText.ts'
import { useFigures } from '../../hooks/useFigures.ts'

const UNIT = {
  pct: '%',
  eur: '€',
  eurw: '€',
  yrs: 'yrs',
  age: 'age',
  months: '',
  times: '',
} as const

const CARD_CAP = rules2026.guide.cardCap

// a balance with no rate on the statement
function rateMissing({ figures }: Plan, key: string, balances: string[]) {
  const owed = balances.reduce((sum, balance) => sum + toNumber(figures[balance]), 0)
  return owed > 0 && !(toNumber(figures[key]) > 0)
}

/** M4: an unknown card or loan rate is never a dead end: the legal cap, or a planning rate left for the adviser. */
function UnknownRateChips({ rate, field }: { rate: string; field: AdviserRateField }) {
  const { leftForAdviser, mine, missing, value } = useStore(
    useShallow(({ plan }) => ({
      leftForAdviser: !!plan.ratesForAdviser?.[rate] && plan.assumptions[rate] != null,
      mine: isMine(plan, rate),
      missing: rateMissing(plan, rate, field.balances),
      value: valueInUse(plan, rate),
    })),
  )
  if (!leftForAdviser && (mine || !missing)) return null

  return (
    <>
      <div className="chips" style={{ marginTop: 6 }}>
        {rate === 'cardRate' && value !== CARD_CAP && (
          <button className="chip sm" data-a="asmcap" data-p="cardRate" onClick={capCardRate}>
            Use {percent(CARD_CAP)} (the legal limit for new cards): cautious, not typical
          </button>
        )}
        {!leftForAdviser && (
          <button
            className="chip sm"
            data-a="asmadv"
            data-p={rate}
            onClick={() => leaveRateForAdviser(rate, field)}
          >
            I don't know my rate: use a planning rate ({percent(field.fallback)}) and leave it for
            my adviser
          </button>
        )}
      </div>
      {leftForAdviser && (
        <span className="small" style={{ display: 'block', marginTop: 4 }} id={`adv-${rate}`}>
          Planning rate {percent(Number(value))}, left for your adviser to check. Type your own rate
          any time.
        </span>
      )}
    </>
  )
}

/** One assumption: label and tag, a number box or chips, a way back, and how LifeMap sets it. */
export default function AssumptionField({ name }: { name: string }) {
  useFigures()
  const field = ASSUMPTIONS[name]
  const view = useStore(
    useShallow(({ plan }) => ({
      mine: isMine(plan, name),
      value: valueInUse(plan, name),
      standard: standardFor(plan, name),
      small: smallPrint(plan, name),
      tag: tagFor(plan, name),
      note: standardNote(name, planRules(plan)),
    })),
  )
  const tag = TAGS[view.tag]
  const [hint, setHint] = useState('')
  const labelId = `asm-${name}`
  const suggestion = field.market ? marketSuggestion(field) : null
  const source = view.mine ? 'mine' : view.standard != null ? 'std' : 'assumed'
  const note = source === 'std' ? view.note : ''

  return (
    <div className="field asmf" data-k={name} data-kind={source} style={{ margin: '0 0 14px' }}>
      <span className="flabel" id={labelId}>
        {field.label} <span className={tag.className}>{tag.text}</span>
      </span>
      {field.kind === 'choice' ? (
        <div className="chips" role="group" aria-labelledby={labelId}>
          {field.options.map(([option, label]) => {
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
            value={view.value == null ? null : typedFigure(field, Number(view.value))}
            unit={UNIT[field.kind]}
            labelledBy={labelId}
            min={field.min}
            max={field.max}
            whole={field.kind !== 'pct' && field.step % 1 === 0}
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
      {field.askAdviser ? <UnknownRateChips rate={name} field={field} /> : null}
      {source === 'assumed' && (!field.optional || suggestion) && view.value != null && (
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
