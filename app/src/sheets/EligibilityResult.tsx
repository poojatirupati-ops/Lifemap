import { openCalculator } from '../state/explore.ts'
import { euro } from '../lib/format.ts'
import { useStore } from '../state/store.ts'
import { estimate, type Estimate } from '../domain/finances/eligibility.ts'
import SheetTitle from './SheetTitle.tsx'

const thousands = (amount: number) => euro(Math.round(amount / 1000) * 1000)

function limitNote({ limitedBy, incomeMultiple, firstHome, depositShare }: Estimate) {
  if (limitedBy === 'income')
    return `Your income sets the limit: lenders usually lend up to ${incomeMultiple}× income${firstHome ? ' for first-time buyers' : ''}.`
  return `Your deposit sets the limit: you need at least ${Math.round(depositShare * 100)}% of the price saved.`
}

/** The rough borrowing estimate, and where to go next. */
export default function EligibilityResult({
  answers,
  onRestart,
}: {
  answers: number[]
  onRestart: () => void
}) {
  const result = estimate(answers)
  const { borrow, price, deposit } = result
  return (
    <div className="elr">
      <span className="elr-ok">✓ Your estimate</span>
      <SheetTitle>You could borrow about</SheetTitle>
      <b className="elr-big">{thousands(borrow)}</b>
      <div className="elr-g">
        <div>
          <small>Home price up to</small>
          <b>{thousands(price)}</b>
        </div>
        <div>
          <small>Your deposit</small>
          <b>{euro(deposit)}</b>
        </div>
      </div>
      <p className="elr-n">{limitNote(result)} A rough guide only, not a mortgage offer.</p>
      <button className="btn" onClick={() => openCalculator('borrow')}>
        Open the Borrow calculator
      </button>
      <button
        className="btn ghost"
        style={{ marginTop: 8 }}
        onClick={() => useStore.getState().openSheet('xpert|mortgage')}
      >
        Talk to a mortgage expert
      </button>
      <button className="link" style={{ marginTop: 6 }} onClick={onRestart}>
        Start again
      </button>
    </div>
  )
}
