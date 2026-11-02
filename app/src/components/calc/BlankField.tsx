import { useState } from 'react'
import { useStore } from '../../state/store.ts'
import FigureHint from './FigureHint.tsx'
import type { FieldInfo } from '../../domain/calc/fieldInfo.ts'
import InputTags from './InputTags.tsx'
import StandardChip from './StandardChip.tsx'
import ValueBox from './ValueBox.tsx'

/** A figure not known yet: an empty box, the one-tap standard and how to choose. */
export default function BlankField({ info }: { info: FieldInfo }) {
  const setFigure = useStore((store) => store.setFigure)
  const { toolId, input } = info
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
      <StandardChip info={info} />
      <FigureHint inputKey={input.key} hint={hint} />
    </div>
  )
}
