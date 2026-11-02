import { personality } from '../../domain/discovery/profile.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { dateLine, greeting } from '../../lib/greeting.ts'
import { useStore } from '../../state/store.ts'

/** Home's hero before a plan: date, greeting, name and a pill to the money personality. */
export default function StartHero() {
  const name = useStore((store) => store.plan.account.name)
  const openMe = useStore((store) => store.openMe)
  const type = personality(useProfileAnswers())
  const pill = type
    ? {
        page: 'terms',
        badge: type.emoji,
        text: (
          <>
            Your money personality: <b>{type.name}</b>
          </>
        ),
      }
    : { page: 'recheck', badge: '🧭', text: 'See your money personality' }

  return (
    <div className="h0hero">
      <span className="hfx" aria-hidden="true">
        <i className="o1"></i>
        <i className="o2"></i>
      </span>
      <span className="h0date">{dateLine()}</span>
      <span className="h0hi">{greeting()}</span>
      <h2 className="t" tabIndex={-1}>
        {name || 'Welcome to Life Map'}
      </h2>
      <button className="h0pill" data-a="me" data-p={pill.page} onClick={() => openMe(pill.page)}>
        <span className="h0badge" aria-hidden="true">
          {pill.badge}
        </span>
        <span>{pill.text}</span>
        <span className="chev" aria-hidden="true">
          ›
        </span>
      </button>
    </div>
  )
}
