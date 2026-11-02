import AssumptionField from '../me/AssumptionField.tsx'
import { rememberOpenGroup } from '../me/assumptionActions.ts'
import { useStore } from '../../state/store.ts'
import type { MePlan } from '../me/mePlan.ts'
import { TOOL_ASSUMPTIONS } from '../../domain/calc/bindings.data.ts'
import { assumptionsToChoose } from '../../domain/calc/values.ts'

/** "Assumptions this tool uses": the plan-wide choices behind the result, open while some are still to choose. */
export default function CalcAssumptions({ toolId }: { toolId: string }) {
  const keys = TOOL_ASSUMPTIONS[toolId]
  const group = `c-${toolId}`
  const toChoose = useStore(({ plan }) => assumptionsToChoose(plan.assumptions, toolId).length)
  const remembered = useStore(({ plan }) => (plan as MePlan).asmOpen === group)
  if (!keys) return null
  const open = toChoose > 0 || remembered
  return (
    <details
      className="card asmg"
      data-g={group}
      open={open}
      style={{ marginBottom: 12 }}
      onToggle={(event) => {
        // only the customer's own toggles are remembered
        if (event.currentTarget.open !== open) rememberOpenGroup(group, event.currentTarget.open)
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
        Assumptions this tool uses{toChoose > 0 ? ` · ${toChoose} to choose` : null}
      </summary>
      <div style={{ marginTop: 10 }}>
        {/* TODO(R-26): planEnd has no AssumptionField yet */}
        {keys
          .filter((key) => key !== 'planEnd')
          .map((key) => (
            <AssumptionField key={key} name={key} />
          ))}
        <p className="small" style={{ margin: '6px 0 0' }}>
          Figures tagged Set by LifeMap are used from the start. These are your plan-wide choices:
          changing one here changes it everywhere.
        </p>
      </div>
    </details>
  )
}
