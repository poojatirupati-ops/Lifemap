import { Fragment, useState, type CSSProperties } from 'react'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import { standardChipText, type FieldInfo, type StandardTag } from '../../domain/calc/guide.ts'
import { CHOICES } from '../../domain/calc/inputs.data.ts'
import type { CalcInput } from '../../domain/calc/types.ts'
import ValueBox from './ValueBox.tsx'

const SPOKEN: Partial<Record<CalcInput['unit'], (value: number) => string>> = {
  '€': euro,
  '%': (value) => `${value}%`,
  y: (value) => `${value} yrs`,
  m: (value) => `${value} mo`,
  age: (value) => `age ${value}`,
}

const small = { display: 'block', marginTop: 2 }
const chipGap = { marginTop: 6 }

interface Tags {
  fromStatement?: boolean
  workedOut?: boolean
  missing?: 'chosen' | 'added' | null
  standard?: StandardTag
}

/** The tags after an input's label: From your statement, Worked out, Not chosen yet, Set by LifeMap. */
function InputTags({ fromStatement, workedOut, missing, standard }: Tags) {
  const tags: [className: string, text: string][] = []
  if (fromStatement) tags.push(['tag doc', 'From your statement'])
  if (workedOut) tags.push(['tag pre', 'Worked out from your figures'])
  if (missing) tags.push(['tag look', missing === 'chosen' ? 'Not chosen yet' : 'Not added yet'])
  if (standard)
    tags.push(standard === 'mine' ? ['tag doc', 'Your choice'] : ['tag pre', 'Set by LifeMap'])
  return tags.map(([className, text]) => (
    <Fragment key={text}>
      {' '}
      <span className={className}>{text}</span>
    </Fragment>
  ))
}

/** Why a typed figure was changed (Max €2,500,000), read out politely. */
function FigureHint({ inputKey, hint }: { inputKey: string; hint: string }) {
  return (
    <span className="nbhint" id={`nh-ck-${inputKey}`} role="status" aria-live="polite">
      {hint}
    </span>
  )
}

/** A blank figure's one-tap standard (when there is one) and the line on how to choose it. */
function StandardChip({ info, style }: { info: FieldInfo; style?: CSSProperties }) {
  const chooseStandard = useStore((store) => store.chooseStandard)
  const { toolId, input, standard } = info
  return (
    <>
      {standard ? (
        <button
          className="chip sm"
          style={style}
          data-a="ckstd"
          data-p={input.key}
          onClick={() => chooseStandard(toolId, input.key)}
        >
          {standardChipText(standard)}
        </button>
      ) : null}
      <span className="small" style={{ display: 'block', marginTop: 4 }}>
        {info.guide}
      </span>
    </>
  )
}

/** Yes or no, a tax rate or an investment style, as chips. */
function ChoiceField({ info }: { info: FieldInfo }) {
  const setFigure = useStore((store) => store.setFigure)
  const { toolId, input, value } = info
  const blank = value == null
  return (
    <div className="field">
      <span className="flabel" id={`cl-${input.key}`}>
        {input.label}
        <InputTags
          fromStatement={info.fromStatement}
          missing={blank ? (info.isAssumption ? 'chosen' : 'added') : null}
          standard={info.standardTag}
        />
      </span>
      <div className="chips" role="group" aria-labelledby={`cl-${input.key}`}>
        {CHOICES[input.unit]?.map((choice) => (
          <button
            key={choice.value}
            className={value === choice.value ? 'chip sm sel' : 'chip sm'}
            aria-pressed={value === choice.value}
            data-a="ckset"
            data-p={`${input.key}|${choice.value}`}
            onClick={() => setFigure(toolId, input.key, choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {blank ? <StandardChip info={info} style={chipGap} /> : null}
    </div>
  )
}

/** A figure with its slider and editable box, or (not known yet) an empty box and how to choose it. */
function NumberField({ info }: { info: FieldInfo }) {
  const setFigure = useStore((store) => store.setFigure)
  const { toolId, input, value, workedOut } = info
  const [hint, setHint] = useState('')
  const set = (figure: number) => setFigure(toolId, input.key, figure)
  const labelId = `cl-${input.key}`
  if (value == null)
    return (
      <div className="field">
        <div className="flabel">
          <label id={labelId} htmlFor={`co-${input.key}`}>
            {input.label}
            <InputTags missing={info.isAssumption ? 'chosen' : 'added'} />
          </label>
          <ValueBox input={input} value={null} onCommit={set} onHint={setHint} />
        </div>
        <StandardChip info={info} />
        <FigureHint inputKey={input.key} hint={hint} />
      </div>
    )
  return (
    <div className="field">
      <div className="flabel">
        <label id={labelId} htmlFor={`c-${input.key}`}>
          {input.label}
          <InputTags
            fromStatement={info.fromStatement}
            workedOut={!!workedOut}
            standard={info.standardTag}
          />
        </label>
        <ValueBox input={input} value={value} onCommit={set} onHint={setHint} />
      </div>
      <input
        type="range"
        id={`c-${input.key}`}
        data-ck={input.key}
        min={input.min}
        max={Math.max(input.max, value)}
        step={input.step}
        value={value}
        aria-labelledby={labelId}
        aria-valuetext={(SPOKEN[input.unit] ?? String)(value)}
        onChange={(event) => set(+event.currentTarget.value)}
      />
      <FigureHint inputKey={input.key} hint={hint} />
      {workedOut ? (
        <span className="small" style={small}>
          {workedOut.replace(/ Type yours to replace it\.$/, '')}
        </span>
      ) : null}
      {info.rangeGuide ? (
        <span className="small" style={small}>
          {info.guide}
        </span>
      ) : null}
    </div>
  )
}

/** One calculator input: chips for choices, a slider once there is a figure, else a blank box. */
export default function CalcField({ info }: { info: FieldInfo }) {
  if (CHOICES[info.input.unit]) return <ChoiceField info={info} />
  // a blank box and a slider are separate fields: filling one in starts the other afresh
  return <NumberField key={info.value == null ? 'blank' : 'figure'} info={info} />
}
