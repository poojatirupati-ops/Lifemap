import { useStore } from '../../state/store.ts'
import { continueToAdviserMatch, returnFromProfile } from '../../state/profile.ts'
import { isProfileComplete } from '../../domain/discovery/profileQuestions.ts'

/** Back to where the money profile was opened from: the adviser match, My Plan or the meeting. */
export default function ProfileReturn() {
  const from = useStore(({ plan }) => plan.moneyProfile.returnTo)
  const complete = useStore(({ plan }) => isProfileComplete(plan))

  if (from === 'c1')
    return (
      <button
        className={complete ? 'btn ghost' : 'btn sun'}
        style={{ marginTop: 10 }}
        data-a="book2"
        onClick={continueToAdviserMatch}
      >
        Continue to my adviser match
      </button>
    )
  if (from !== 'plan' && from !== 'exp') return null
  return (
    <button
      className="btn ghost"
      style={{ marginTop: 10 }}
      data-a="umback"
      data-p={from}
      onClick={() => returnFromProfile(from)}
    >
      {from === 'plan' ? 'Back to my plan' : 'Back to my meeting'}
    </button>
  )
}
