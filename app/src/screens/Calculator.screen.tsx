import CalcAssumptions from '../components/calc/CalcAssumptions.tsx'
import CalcField from '../components/calc/CalcField.tsx'
import CalcGate from '../components/calc/CalcGate.tsx'
import CalcResultCard from '../components/calc/CalcResultCard.tsx'
import { addToPlan, changeInflation, toggleTodaysMoney } from '../components/calc/calcActions.ts'
import { calculatorView, useCalculator } from '../components/calc/useCalculator.ts'
import { EXAMPLE_LABEL, inflationText } from '../components/calc/words.ts'
import { exploreBack, talkToExpert } from '../components/explore/exploreActions.ts'
import InflationChoice from '../components/finance/InflationChoice.tsx'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import Emo from '../components/ui/Emo.tsx'
import { useStore } from '../state/store.ts'

export const key = 'CALC'
export const id = (_plan: unknown, param = '') => 'CALC-' + param
export const note =
  'Calculator (Lifecast): pre-filled from what you told us, live result, what-if sliders. "Add to my plan" adds a goal after a confirm step.'

export function Head({ param = '' }: { param?: string }) {
  const plan = useStore.getState().plan
  const { tool, tip } = calculatorView(plan, param)
  return AppHead({
    title: <Emo>{`${tool.emoji} ${tool.name}`}</Emo>,
    sub: (
      <>
        {tool.question}
        {tip && (
          <span className="note" style={{ display: 'block', marginTop: 8 }}>
            <Emo>{`💡 ${tip}`}</Emo>
          </span>
        )}
      </>
    ),
    back: exploreBack,
    needsLook: unseenLooks(plan),
  })
}

export function Body({ param = '' }: { param?: string }) {
  const view = useCalculator(param)
  return (
    <>
      <div
        className="note"
        id="exlab"
        role="note"
        hidden={!view.example}
        style={{ margin: '0 0 10px', fontWeight: 800 }}
      >
        {EXAMPLE_LABEL}
      </div>
      <div className="eyebrow" style={{ margin: '2px 0 8px' }}>
        {view.category.name}
      </div>
      {view.adjustable && (
        <div className="adjrow">
          <button
            className={view.adjusted ? 'chip sm sel' : 'chip sm'}
            role="switch"
            aria-checked={view.adjusted}
            data-a="adjinfl"
            data-p={view.id}
            onClick={() => toggleTodaysMoney(view.id)}
          >
            {view.adjusted ? '✓ ' : ''}Adjust for inflation
          </button>
          <span className="small">Show the result in today's money</span>
        </div>
      )}
      {view.choosingInflation && (
        <div className="card" style={{ marginBottom: 12 }}>
          <InflationChoice place="calc" />
        </div>
      )}
      <div className="card" style={{ marginBottom: 12 }}>
        {view.inputs.map((info) => (
          <CalcField key={info.input.key} info={info} />
        ))}
      </div>
      <CalcAssumptions toolId={view.id} />
      <div id="cout" aria-live="polite">
        {view.result ? (
          <CalcResultCard result={view.result} example={view.example} />
        ) : (
          <CalcGate missing={view.missing} />
        )}
      </div>
      {view.inflationChosen != null && (
        <p className="small" style={{ margin: '8px 2px 0' }}>
          Prices rising {inflationText(view.inflationChosen)} (your choice) ·{' '}
          <button
            className="link"
            style={{ padding: 0, fontSize: 13 }}
            data-a="infledit"
            onClick={changeInflation}
          >
            Change
          </button>
        </p>
      )}
      {view.whatIfs && (
        <div
          className="card"
          style={{ marginTop: 12, border: '1.5px dashed #B9C9D6', boxShadow: 'none' }}
        >
          <b>What if…</b>
          {view.whatIfs.map((info) => (
            <CalcField key={info.input.key} info={info} />
          ))}
        </div>
      )}
      <div className="grid2" style={{ marginTop: 12 }}>
        <button
          className="btn sm"
          style={{ width: '100%' }}
          data-a="calcadd"
          data-p={param}
          onClick={() => addToPlan(view.id)}
        >
          ＋ Add to my plan
        </button>
        <button
          className="btn sm ghost"
          style={{ width: '100%' }}
          data-a="expertfor"
          data-p={view.expert}
          onClick={() => talkToExpert(view.expert)}
        >
          Ask an expert
        </button>
      </div>
      <p className="disc">Illustrative figures, not a guarantee and not advice.</p>
    </>
  )
}
