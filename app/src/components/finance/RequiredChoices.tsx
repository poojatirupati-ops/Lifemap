import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import { isChosen } from '../../domain/planning/assumptions.ts'
import AgeChoices from './AgeChoices.tsx'
import InflationChoice from './InflationChoice.tsx'
import { missingChoices, requiredChoices } from '../../domain/planning/requiredChoices.ts'
import AssumptionField from '../me/AssumptionField.tsx'
import { rememberOpenGroup } from '../../state/assumptions.ts'
import { ASSUMPTIONS } from '../../domain/planning/assumptionFields.data.ts'
import { useFigures } from '../../hooks/useFigures.ts'

// Everything on Your assumptions except the choices above, in the original's order.
const REST = Object.keys(ASSUMPTIONS)

/** Step 7: the choices only the customer makes, then everything LifeMap set for them. */
export default function RequiredChoices() {
  useFigures()
  const plan = useStore(
    useShallow(({ plan }) => ({
      retireSet: plan.retireSet,
      assumptions: plan.assumptions,
      inflation: plan.inflation,
      about: plan.about,
      figures: plan.figures,
      partnerRetireSet: plan.partnerRetireSet,
    })),
  )
  const open = useStore(({ openAssumption }) => openAssumption === 'p4')
  const needed = requiredChoices(plan).length
  const chosen = needed - missingChoices(plan).length
  const allChosen = chosen === needed
  const changed = Object.keys(plan.assumptions).filter(
    (key) => key !== 'planEnd' && isChosen(plan.assumptions, key),
  ).length

  return (
    <div id="p4-asm">
      <div className="card" id="p4-3">
        <div className="p4-sum">
          <span className={allChosen ? 'p4-ck ok' : 'p4-ck'} aria-hidden="true">
            {allChosen ? '✓' : chosen}
          </span>
          <div>
            <b>{allChosen ? `All ${needed} chosen` : `Choose ${needed} things`}</b>
            <small>
              {allChosen ? 'You can change any of these.' : 'Only you can choose these.'}
            </small>
          </div>
        </div>
        <div className="p4-prog" role="status" id="p4-count">
          <span>
            <i style={{ width: `${Math.round((chosen / needed) * 100)}%` }}></i>
          </span>
          <b className="sr">
            {chosen} of {needed} chosen
          </b>
        </div>
        <AgeChoices
          inflation={
            <div id="p4-infl" className="field" style={{ margin: '0 0 14px' }}>
              <InflationChoice place="p4" />
            </div>
          }
        />
      </div>
      <details
        className="card"
        id="p4-rest"
        data-g="p4"
        open={open}
        onToggle={(event) => rememberOpenGroup('p4', event.currentTarget.open)}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
          What we've set for you (change any)
        </summary>
        <p className="small" style={{ margin: '6px 0 10px' }}>
          Everything else is set from the start, so nothing else blocks your results. Figures that
          are the same for everyone are tagged <b>Set by LifeMap</b>; a rate we don't know is tagged{' '}
          <b>Assumed: add yours</b>. Change any one and it reads <b>Your choice</b>.
          {changed > 0 ? ` You have changed ${changed}.` : null}
        </p>
        <div style={{ marginTop: 10 }}>
          {REST.map((key) => (
            <AssumptionField key={key} name={key} />
          ))}
        </div>
      </details>
    </div>
  )
}
