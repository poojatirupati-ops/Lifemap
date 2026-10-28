import { useStore } from '../../state/store.ts'
import { assumption, chosenAssumption } from '../../domain/planning/assumptions.ts'
import SafetyNote from './SafetyNote.tsx'
import { setSafetyMonths } from './goalActions.ts'
import type { Goal } from '../../state/types.ts'

/** The emergency fund's months of essential spending: blank follows the standard. */
export default function SafetyMonths({ goal }: { goal: Goal }) {
  const chosen = useStore((store) => chosenAssumption(store.plan.asm, 'safetyMonths'))
  const suggested = useStore((store) => assumption({ ...store.plan, asm: {} }, 'safetyMonths'))

  return (
    <label className="full">
      <span className="fl">Months of essential spending to keep</span>
      <input
        key={chosen ?? ''}
        className="in"
        inputMode="numeric"
        defaultValue={chosen ?? ''}
        placeholder={`e.g. ${suggested}`}
        onBlur={(event) => {
          const input = event.currentTarget
          if (input.value !== input.defaultValue) setSafetyMonths(input.value)
        }}
      />
      <SafetyNote goal={goal} />
    </label>
  )
}
