import { useStore } from '../../state/store.ts'
import InflationChoice from '../finance/InflationChoice.tsx'
import GrowthSetToggle from '../me/GrowthSetToggle.tsx'

/** Growth assumptions (standard or cautious) and inflation, folded under the what-if. */
export default function GrowthSettings() {
  const openMe = useStore((store) => store.openMe)

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
        <GrowthSetToggle />
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
