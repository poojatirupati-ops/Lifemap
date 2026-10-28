import { useState } from 'react'
import { setFigure, chooseStandard } from './calcActions.ts'
import FigureHint from './FigureHint.tsx'
import { standardChipText, type FieldInfo } from './FieldInfo.ts'
import InputTags from './InputTags.tsx'
import ValueBox from './ValueBox.tsx'

/** A figure not known yet: an empty box, the one-tap standard and how to choose. */
export default function BlankField({ info }: { info: FieldInfo }) {
  const { toolId, input, standard } = info
  const [hint, setHint] = useState('')
  return (
    <div className="field">
      <div className="flabel">
        <label id={`cl-${input.key}`} htmlFor={`co-${input.key}`}>
          {input.label}
          <InputTags missing={info.isAssumption ? 'chosen' : 'added'} />
        </label>
        <ValueBox
          input={input}
          value={null}
          onCommit={(figure) => setFigure(toolId, input.key, figure)}
          onHint={setHint}
        />
      </div>
      {standard && (
        <button
          className="chip sm"
          data-a="ckstd"
          data-p={input.key}
          onClick={() => chooseStandard(toolId, input.key)}
        >
          {standardChipText(standard)}
        </button>
      )}
      <span className="small" style={{ display: 'block', marginTop: 4 }}>
        {info.guide}
      </span>
      <FigureHint inputKey={input.key} hint={hint} />
    </div>
  )
}
