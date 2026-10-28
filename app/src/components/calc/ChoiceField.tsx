import { setFigure, chooseStandard } from './calcActions.ts'
import { CHOICES, standardChipText, type FieldInfo } from './FieldInfo.ts'
import InputTags from './InputTags.tsx'

/** Yes or no, a tax rate or an investment style, as chips. */
export default function ChoiceField({ info }: { info: FieldInfo }) {
  const { toolId, input, value, standard } = info
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
        {CHOICES[input.unit].map(([choice, label]) => (
          <button
            key={choice}
            className={value === choice ? 'chip sm sel' : 'chip sm'}
            aria-pressed={value === choice}
            data-a="ckset"
            data-p={`${input.key}|${choice}`}
            onClick={() => setFigure(toolId, input.key, choice)}
          >
            {label}
          </button>
        ))}
      </div>
      {blank && standard && (
        <button
          className="chip sm"
          style={{ marginTop: 6 }}
          data-a="ckstd"
          data-p={input.key}
          onClick={() => chooseStandard(toolId, input.key)}
        >
          {standardChipText(standard)}
        </button>
      )}
      {blank && (
        <span className="small" style={{ display: 'block', marginTop: 4 }}>
          {info.guide}
        </span>
      )}
    </div>
  )
}
