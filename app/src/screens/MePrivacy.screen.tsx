import { useShallow } from 'zustand/react/shallow'
import {
  ANALYTICS_LABEL,
  setAnalyticsConsent,
  useAnalyticsConsent,
} from '../analytics/analytics.ts'
import { meHead } from '../components/me/meHead.ts'
import Emo from '../components/ui/Emo.tsx'
import { backToMe } from '../components/finance/financeActions.ts'
import { setReminders, toggleAdviserQuestion } from '../components/me/meActions.ts'
import { SUSTAINABLE_QUESTION } from '../domain/identity/advisers.data.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'ME:privacy'
export const id = 'ME-PRIV'
export const note =
  'Privacy & preferences: consents, sustainability preference (§13, optional, goes to the adviser), what each adviser can see, delete my data.'

export const Head = () => meHead({ title: 'Privacy & preferences', back: backToMe })

const SHARED: [part: keyof Plan['booking']['share'], label: string][] = [
  ['report', 'Plan report'],
  ['fin', 'Finances'],
  ['docs', 'Documents'],
  ['um', 'Understand Me profile'],
]

export function Body() {
  const { reminders, sustainable, shared } = useStore(
    useShallow(({ plan }) => ({
      reminders: plan.account.marketingConsent,
      sustainable: plan.adviserQuestions.includes(SUSTAINABLE_QUESTION),
      shared: plan.booking.done ? plan.booking.share : null,
    })),
  )
  const openSheet = useStore((store) => store.openSheet)
  const analytics = useAnalyticsConsent()

  return (
    <>
      <div className="card">
        <label className="check">
          <input type="checkbox" checked disabled />
          <span>Use my details to build my plan (needed for the service)</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            data-acct="c2"
            defaultChecked={reminders}
            onChange={(event) => setReminders(event.currentTarget.checked)}
          />
          <span>Send me reminders and updates</span>
        </label>
        {analytics === null ? null : (
          <label className="check">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => void setAnalyticsConsent(event.currentTarget.checked)}
            />
            <span>{ANALYTICS_LABEL}</span>
          </label>
        )}
      </div>
      <div className="card">
        <b>Your preferences</b>
        <p className="small" style={{ margin: '4px 0 8px' }}>
          Optional. Your adviser will ask about this before recommending anything.
        </p>
        <div className="chips">
          <button
            className={sustainable ? 'chip sm sel' : 'chip sm'}
            aria-pressed={sustainable}
            data-a="advq"
            data-p={SUSTAINABLE_QUESTION}
            onClick={() => toggleAdviserQuestion(SUSTAINABLE_QUESTION)}
          >
            <Emo>{`🌿 ${SUSTAINABLE_QUESTION}`}</Emo>
          </button>
        </div>
      </div>
      <div className="card">
        <b>What your adviser can see</b>
        {shared ? (
          SHARED.map(([part, label]) => (
            <div className="mini" key={part}>
              <span>{label}</span>
              <b>{shared[part] ? 'Shared' : 'Not shared'}</b>
            </div>
          ))
        ) : (
          <p className="small" style={{ margin: '6px 0 0' }}>
            Nothing is shared. You choose what to share when you book.
          </p>
        )}
      </div>
      {/* api/src/routes/me.ts: one JSON file of everything held */}
      <a
        className="btn ghost"
        style={{ marginTop: 12 }}
        href="/api/me/export"
        download="lifemap-my-data.json"
      >
        Download my data
      </a>
      <button
        className="btn ghost"
        style={{ marginTop: 12, color: 'var(--gap-t)' }}
        data-a="sheet"
        data-p="delete"
        onClick={() => openSheet('delete')}
      >
        Delete my data
      </button>
      <button className="link" data-a="sheet" data-p="money" onClick={() => openSheet('money')}>
        How LifeMap makes money
      </button>
    </>
  )
}
