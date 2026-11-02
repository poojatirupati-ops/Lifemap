import { createFileRoute } from '@tanstack/react-router'
import CalcAssumptions from '../../../../components/calc/CalcAssumptions.tsx'
import CalcField from '../../../../components/calc/CalcField.tsx'
import CalcGate from '../../../../components/calc/CalcGate.tsx'
import CalcResultCard from '../../../../components/calc/CalcResultCard.tsx'
import InflationNote from '../../../../components/calc/InflationNote.tsx'
import InflationSwitch from '../../../../components/calc/InflationSwitch.tsx'
import { useCalculator } from '../../../../components/calc/useCalculator.ts'
import { calculatorFor } from '../../../../domain/calc/calculators.ts'
import { calcContext, toolPlan } from '../../../../domain/calc/context.ts'
import { EXAMPLE_LABEL } from '../../../../domain/calc/words.ts'
import { toolById } from '../../../../components/explore/tools.data.ts'
import { exploreBack, talkToExpert } from '../../../../state/explore.ts'
import InflationChoice from '../../../../components/finance/InflationChoice.tsx'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import Emo from '../../../../components/ui/Emo.tsx'
import { useStore } from '../../../../state/store.ts'

export const Route = createFileRoute('/_auth/_app/explore/calculator/$id')({
  component: Calculator,
})

function Calculator() {
  const { id: param } = Route.useParams()
  const { id, tip } = calculatorFor(param)
  const tool = toolById(id)
  const tipText = useStore((store) => tip?.(calcContext(toolPlan(store.plan, store, id), id)))
  const view = useCalculator(param)
  const { addToPlan } = useStore.getState()
  return (
    <AppScreen
      id={'CALC-' + param}
      note='Calculator (Lifecast): pre-filled from what you told us, live result, what-if sliders. "Add to my plan" adds a goal after a confirm step.'
      title={<Emo>{`${tool.emoji} ${tool.name}`}</Emo>}
      sub={
        <>
          {tool.question}
          {tipText ? (
            <span className="note" style={{ display: 'block', marginTop: 8 }}>
              <Emo>{`💡 ${tipText}`}</Emo>
            </span>
          ) : null}
        </>
      }
      back={exploreBack}
      bell
    >
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
      {view.adjustable ? <InflationSwitch toolId={view.id} on={view.adjusted} /> : null}
      {view.choosingInflation ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <InflationChoice place="calc" />
        </div>
      ) : null}
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
      {view.inflationChosen != null ? <InflationNote inflation={view.inflationChosen} /> : null}
      {view.whatIfs ? (
        <div
          className="card"
          style={{ marginTop: 12, border: '1.5px dashed #B9C9D6', boxShadow: 'none' }}
        >
          <b>What if…</b>
          {view.whatIfs.map((info) => (
            <CalcField key={info.input.key} info={info} />
          ))}
        </div>
      ) : null}
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
    </AppScreen>
  )
}
