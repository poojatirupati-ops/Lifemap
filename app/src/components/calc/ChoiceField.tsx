import { useStore } from '../../state/store.ts'
import { CHOICES } from '../../domain/calc/choices.ts'
import type { FieldInfo } from '../../domain/calc/fieldInfo.ts'
import InputTags from './InputTags.tsx'
import StandardChip from './StandardChip.tsx'

const chipGap = { marginTop: 6 }

/** Yes or no, a tax rate or an investment style, as chips. */
export default function ChoiceField({ info }: { info: FieldInfo }) {
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
