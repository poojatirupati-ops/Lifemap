import { inflationText } from '../../domain/calc/words.ts'
import { useStore } from '../../state/store.ts'

/** "Prices rising 2% (your choice) · Change" under a result. */
export default function InflationNote({ inflation }: { inflation: number }) {
  const changeInflation = useStore((store) => store.changeInflation)
  return (
    <p className="small" style={{ margin: '8px 2px 0' }}>
      Prices rising {inflationText(inflation)} (your choice) ·{' '}
      <button
        className="link"
        style={{ padding: 0, fontSize: 13 }}
        data-a="infledit"
        onClick={changeInflation}
      >
        Change
      </button>
    </p>
  )
}
