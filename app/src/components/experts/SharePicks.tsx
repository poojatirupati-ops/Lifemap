import { useShallow } from 'zustand/react/shallow'
import { hasEnoughForPersonality } from '../../domain/discovery/profile.ts'
import type { Share } from '../../domain/identity/booking.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'

const ITEMS: { item: Share; label: string; detail: string }[] = [
  { item: 'report', label: 'Your plan report', detail: 'Goals, results and what-ifs' },
  { item: 'fin', label: 'Your finances', detail: 'The figures in your 6 sections' },
  { item: 'docs', label: 'Your documents', detail: 'Statements you uploaded' },
  {
    item: 'um',
    label: 'Your Understand Me profile',
    detail: 'Personality and indicative risk profile',
  },
]

type SharePlan = Pick<Plan, 'answers' | 'sources' | 'hasResults'>

const OFFERED: Record<Share, (plan: SharePlan) => boolean> = {
  report: (plan) => plan.hasResults,
  fin: (plan) => plan.hasResults,
  docs: (plan) => Object.values(plan.sources).includes('doc'),
  um: (plan) => hasEnoughForPersonality(plan.answers),
}

/** Consent before sharing: each item ticked on its own (all unticked at first), then the agreement. */
export default function SharePicks({ adviserName }: { adviserName: string }) {
  const plan = useStore(
    useShallow(({ plan }) => ({
      answers: plan.answers,
      sources: plan.sources,
      hasResults: plan.hasResults,
      booking: plan.booking,
    })),
  )
  const { setShare, setBooking, openSheet } = useStore.getState()
  return (
    <>
      <div className="card">
        {ITEMS.filter(({ item }) => OFFERED[item](plan)).map(({ item, label, detail }) => (
          <label className="check" key={item}>
            <input
              type="checkbox"
              data-share={item}
              defaultChecked={plan.booking.share[item]}
              onChange={(event) => setShare(item, event.target.checked)}
            />
            <span>
              <b>{label}</b>
              <br />
              <span className="small">{detail}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="card">
        <label className="check">
          <input
            type="checkbox"
            data-agree="1"
            defaultChecked={plan.booking.agree}
            onChange={(event) => setBooking({ agree: event.target.checked })}
          />
          <span>
            I agree to share the items I've ticked with {adviserName}. I can withdraw this at any
            time.
          </span>
        </label>
        <p className="small" style={{ margin: '6px 0 0' }}>
          LifeMap may be paid a fee by the adviser's firm if you go ahead. Your adviser will tell
          you how they are paid before you agree to anything.{' '}
          <button
            className="link"
            style={{ padding: 0, fontSize: 12.5 }}
            onClick={() => openSheet('money')}
          >
            How LifeMap makes money
          </button>
        </p>
      </div>
    </>
  )
}
