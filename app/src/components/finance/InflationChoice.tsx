import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { rules2026 } from '../../domain/planning/rates.ts'
import { standardSource, standardValue } from '../../domain/planning/settings.ts'
import { percent } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import { chooseInflation, chooseOwnInflation, typeInflation } from './choiceActions.ts'
import ChoiceNumberBox from './ChoiceNumberBox.tsx'
import ChoiceTag from './ChoiceTag.tsx'

/** Prices rising: the standard, Ireland's rate now, or the customer's own. `place` keeps ids unique. */
export default function InflationChoice({ place }: { place: string }) {
  const { rate, own } = useStore(
    useShallow(({ plan }) => ({ rate: plan.infl, own: plan.inflOther })),
  )
  const [hint, setHint] = useState('')
  const standard = standardValue('infl') as number
  const { ie: irelandNow, ieSrc: irelandSource } = rules2026.infl
  const isStandard = rate === standard && !own
  const isIreland = rate === irelandNow && !own
  const isOther = own || (rate != null && !isStandard && !isIreland)
  const chips: [chosen: boolean, label: string, choose: () => void, value: string][] = [
    [
      isStandard,
      `Use the standard (${percent(standard)})`,
      () => chooseInflation(standard),
      String(standard),
    ],
    [
      isIreland,
      `${percent(irelandNow)} · Ireland now (${irelandSource})`,
      () => chooseInflation(irelandNow),
      String(irelandNow),
    ],
    [isOther, 'Other', chooseOwnInflation, 'other'],
  ]

  return (
    <div className="infl" id={`infl-${place}`}>
      <b style={{ fontSize: 14 }} id={`infl-l-${place}`}>
        Prices rising (inflation)
      </b>{' '}
      <ChoiceTag chosen={rate != null} />
      <p className="small" style={{ margin: '2px 0 6px' }}>
        Generally the standard is {percent(standard)} ({standardSource('infl')}). Prices in Ireland
        are rising {percent(irelandNow)} a year right now ({irelandSource}), mostly because of
        energy. Choose what you want to use.
      </p>
      <div className="chips" role="group" aria-labelledby={`infl-l-${place}`}>
        {chips.map(([chosen, label, choose, value]) => (
          <button
            key={value}
            className={chosen ? 'chip sm sel' : 'chip sm'}
            aria-pressed={chosen}
            data-a="infl"
            data-p={value}
            onClick={choose}
          >
            {label}
          </button>
        ))}
      </div>
      {isOther && (
        <>
          <div className="flabel" style={{ marginTop: 6 }}>
            <span id={`infl-o-${place}`}>My own rate (0–10%)</span>
            <ChoiceNumberBox
              name="infl|r"
              id={`infl-v-${place}`}
              value={rate != null ? +(rate * 100).toFixed(2) : null}
              unit="%"
              labelledBy={`infl-o-${place}`}
              min={0}
              max={10}
              onCommit={typeInflation}
              onHint={setHint}
            />
          </div>
          <span className="nbhint" id="nh-infl-r" role="status" aria-live="polite">
            {hint}
          </span>
        </>
      )}
    </div>
  )
}
