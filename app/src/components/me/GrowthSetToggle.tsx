import { useStore } from '../../state/store.ts'
import { chooseAssumptions } from '../plan/planActions.ts'

const SETS = [
  ['standard', 'Standard'],
  ['cautious', 'Cautious'],
] as const

// ponytail: same block as GrowthSettings (R-23) inlines; share it if a third place needs it
/** Standard or Cautious growth: fills pay rises, cash, investment and pension growth. */
export default function GrowthSetToggle() {
  const chosen = useStore((store) => store.plan.assume || 'standard')

  return (
    <div className="asm">
      <div className="seg" role="group" aria-label="Growth assumptions" style={{ margin: 0 }}>
        {SETS.map(([set, name]) => (
          <button
            key={set}
            className={chosen === set ? 'on' : ''}
            aria-pressed={chosen === set}
            data-a="assume"
            data-p={set}
            onClick={() => chooseAssumptions(set)}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="small" style={{ margin: '6px 0 0' }}>
        {chosen === 'cautious'
          ? 'Cautious assumes slower growth, so results are lower but safer.'
          : 'Standard uses typical long-run growth. Cautious assumes slower growth, so results are lower but safer.'}{' '}
        Choosing a set fills pay rises, cash, investment and pension growth with its rates. Growth
        is never guaranteed.
      </p>
    </div>
  )
}
