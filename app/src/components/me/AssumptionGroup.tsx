import { useStore } from '../../state/store.ts'
import { useShallow } from 'zustand/react/shallow'
import AgeChoices from '../finance/AgeChoices.tsx'
import InflationChoice from '../finance/InflationChoice.tsx'
import AssumptionField from './AssumptionField.tsx'
import {
  ASSUMPTIONS,
  type AssumptionGroup as Group,
} from '../../domain/planning/assumptionFields.data.ts'
import { isMine, valueInUse } from '../../domain/planning/assumptionText.ts'
import GrowthSetToggle from './GrowthSetToggle.tsx'
import { rememberOpenGroup } from '../../state/assumptions.ts'
import { useFigures } from '../../hooks/useFigures.ts'

const BUDGET = ['budgetNeeds', 'budgetWants', 'budgetSave']

/** The budget split adds up to this many percent when all three are the customer's and not 100. */
function budgetOff(plan: Parameters<typeof valueInUse>[0]) {
  if (!BUDGET.every((key) => isMine(plan, key))) return null
  const total = BUDGET.reduce((sum, key) => sum + Number(valueInUse(plan, key)), 0)
  return Math.abs(total - 1) > 1e-6 ? Math.round(total * 100) : null
}

/** One folding group of Your assumptions. */
export default function AssumptionGroup({ group, title }: { group: Group; title: string }) {
  useFigures()
  const { open, budgetTotal } = useStore(
    useShallow(({ plan, openAssumption }) => ({
      open: (openAssumption === undefined ? 'prices' : openAssumption) === group,
      budgetTotal: group === 'safety' ? budgetOff(plan) : null,
    })),
  )
  const keys = Object.keys(ASSUMPTIONS).filter((key) => ASSUMPTIONS[key].group === group)

  return (
    <details
      className="card asmg"
      data-g={group}
      open={open}
      onToggle={(event) => rememberOpenGroup(group, event.currentTarget.open)}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>{title}</summary>
      <div style={{ marginTop: 10 }}>
        {group === 'prices' && (
          <>
            <div className="field" style={{ margin: '0 0 14px' }}>
              <InflationChoice place="asm" />
            </div>
            <div className="field" style={{ margin: '0 0 14px' }}>
              <span className="flabel">Growth assumptions set</span>
              <GrowthSetToggle />
            </div>
          </>
        )}
        {group === 'length' && <AgeChoices partnerFirst />}
        {keys.map((key) => (
          <AssumptionField key={key} name={key} />
        ))}
        {budgetTotal != null && (
          <p className="note">Your budget split adds up to {budgetTotal}%. It should total 100%.</p>
        )}
      </div>
    </details>
  )
}
