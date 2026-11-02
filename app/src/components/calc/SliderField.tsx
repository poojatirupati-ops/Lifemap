import { useState } from 'react'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import FigureHint from './FigureHint.tsx'
import type { FieldInfo } from '../../domain/calc/fieldInfo.ts'
import InputTags from './InputTags.tsx'
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

/** A figure with its slider and editable box. */
export default function SliderField({ info }: { info: FieldInfo }) {
  const setFigure = useStore((store) => store.setFigure)
  const { toolId, input, workedOut } = info
  const value = info.value!
  const [hint, setHint] = useState('')
  const set = (figure: number) => setFigure(toolId, input.key, figure)
  return (
    <div className="field">
      <div className="flabel">
        <label id={`cl-${input.key}`} htmlFor={`c-${input.key}`}>
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
        aria-labelledby={`cl-${input.key}`}
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
