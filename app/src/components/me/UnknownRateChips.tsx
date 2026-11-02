import type { Plan } from '../../state/types.ts'
import { useStore } from '../../state/store.ts'
import { useShallow } from 'zustand/react/shallow'
import { percent, toNumber } from '../../lib/format.ts'
import { rules2026 } from '../../domain/planning/rates.ts'
import type { AdviserRateField } from '../../domain/planning/assumptionFields.data.ts'
import { capCardRate, leaveRateForAdviser } from './assumptionActions.ts'
import { isMine, valueInUse } from '../../domain/planning/assumptionText.ts'

const CARD_CAP = rules2026.guide.cardCap

// a balance with no rate on the statement
function rateMissing({ figures }: Plan, key: string, balances: string[]) {
  const owed = balances.reduce((sum, balance) => sum + toNumber(figures[balance]), 0)
  return owed > 0 && !(toNumber(figures[key]) > 0)
}

/** M4: an unknown card or loan rate is never a dead end: the legal cap, or a planning rate left for the adviser. */
export default function UnknownRateChips({
  rate,
  field,
}: {
  rate: string
  field: AdviserRateField
}) {
  const { leftForAdviser, mine, missing, value } = useStore(
    useShallow(({ plan }) => ({
      leftForAdviser: !!plan.ratesForAdviser?.[rate] && plan.assumptions[rate] != null,
      mine: isMine(plan, rate),
      missing: rateMissing(plan, rate, field.balances),
      value: valueInUse(plan, rate),
    })),
  )
  if (!leftForAdviser && (mine || !missing)) return null

  return (
    <>
      <div className="chips" style={{ marginTop: 6 }}>
        {rate === 'cardRate' && value !== CARD_CAP && (
          <button className="chip sm" data-a="asmcap" data-p="cardRate" onClick={capCardRate}>
            Use {percent(CARD_CAP)} (the legal limit for new cards): cautious, not typical
          </button>
        )}
        {!leftForAdviser && (
          <button
            className="chip sm"
            data-a="asmadv"
            data-p={rate}
            onClick={() => leaveRateForAdviser(rate, field)}
          >
            I don't know my rate: use a planning rate ({percent(field.fallback)}) and leave it for
            my adviser
          </button>
        )}
      </div>
      {leftForAdviser && (
        <span className="small" style={{ display: 'block', marginTop: 4 }} id={`adv-${rate}`}>
          Planning rate {percent(Number(value))}, left for your adviser to check. Type your own rate
          any time.
        </span>
      )}
    </>
  )
}
