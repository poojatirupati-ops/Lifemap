import { useShallow } from 'zustand/react/shallow'
import { percent, toNumber } from '../../lib/format.ts'
import { rules2026 } from '../../domain/planning/rates.ts'
import { ASSUMPTIONS } from './assumptionFields.data.ts'
import { capCardRate, leaveRateForAdviser } from './assumptionActions.ts'
import { isMine, valueInUse } from './assumptionText.ts'
import { useMePlan, type MePlan } from './mePlan.ts'

type RateKey = 'cardRate' | 'loanRate'

const CARD_CAP = rules2026.guide.cardCap

// a balance with no rate on the statement
function rateMissing({ fin }: MePlan, key: RateKey) {
  if (key === 'cardRate') return toNumber(fin.cardBal) > 0 && !(toNumber(fin.cardRate) > 0)
  return toNumber(fin.loanBal) + toNumber(fin.debt) > 0 && !(toNumber(fin.loanRate) > 0)
}

/** M4: an unknown card or loan rate is never a dead end: the legal cap, or a planning rate left for the adviser. */
export default function UnknownRateChips({ rate }: { rate: RateKey }) {
  const { leftForAdviser, mine, missing, value } = useMePlan(
    useShallow((plan) => ({
      leftForAdviser: !!plan.advRate?.[rate] && plan.asm[rate] != null,
      mine: isMine(plan, rate),
      missing: rateMissing(plan, rate),
      value: valueInUse(plan, rate),
    })),
  )
  if ((mine && !leftForAdviser) || !(missing || leftForAdviser)) return null

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
            onClick={() => leaveRateForAdviser(rate)}
          >
            I don't know my rate: use a planning rate ({percent(ASSUMPTIONS[rate].fallback!)}) and
            leave it for my adviser
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
