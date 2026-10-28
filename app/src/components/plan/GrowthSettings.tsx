import { useStore } from '../../state/store.ts'
import InflationChoice from '../finance/InflationChoice.tsx'
import { chooseAssumptions, openMe } from './planActions.ts'

const SETS = [
  ['standard', 'Standard'],
  ['cautious', 'Cautious'],
] as const

/** Growth assumptions (standard or cautious) and inflation, folded under the what-if. */
export default function GrowthSettings() {
  const chosen = useStore((store) => store.plan.assume || 'standard')
  const cautious = chosen === 'cautious'

  return (
    <details
      className="card asmg wigrow"
      data-g="wi-grow"
      style={{ margin: '12px 0 0', boxShadow: 'none', border: '1.5px solid #D5E0EA' }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
        Growth and inflation settings
      </summary>
      <div style={{ marginTop: 8 }}>
        <div className="fl" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
          Growth assumptions
        </div>
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
            {cautious
              ? 'Cautious assumes slower growth, so results are lower but safer.'
              : 'Standard uses typical long-run growth. Cautious assumes slower growth, so results are lower but safer.'}{' '}
            Choosing a set fills pay rises, cash, investment and pension growth with its rates.
            Growth is never guaranteed.
          </p>
        </div>
        <div style={{ height: 10 }}></div>
        <InflationChoice place="wi" />
        <p className="small" style={{ margin: '8px 0 0' }}>
          <button
            className="link"
            style={{ padding: 0, fontSize: 13 }}
            data-a="asmopen"
            onClick={() => openMe('asm')}
          >
            Your assumptions
          </button>{' '}
          · prices, growth, retirement and emergency fund settings
        </p>
      </div>
    </details>
  )
}
