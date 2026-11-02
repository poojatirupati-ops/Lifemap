import { useGreeting } from '../../hooks/useGreeting.ts'
import { dateLine, greeting } from '../../lib/greeting.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { personality } from '../../domain/discovery/profile.ts'
import { useStore } from '../../state/store.ts'

/** The gradient hero: date, greeting, where the customer is on the ladder and their money personality. */
export default function HomeHero({ stage }: { stage: string }) {
  const { name, age } = useGreeting()
  const type = personality(useProfileAnswers())

  return (
    <div className="h0hero hh2">
      <span className="hfx" aria-hidden="true">
        <i className="o1"></i>
        <i className="o2"></i>
      </span>
      <span className="h0date">
        <i aria-hidden="true"></i>
        {dateLine()}
      </span>
      <h2 className="t" tabIndex={-1}>
        <span className="hh-hi">{greeting() + (name ? ',' : '')}</span>{' '}
        {name ? <span className="hh-nm">{name}</span> : 'welcome back'}{' '}
        <span className="wave" aria-hidden="true">
          👋
        </span>
      </h2>
      <p className="hh-sub">{stage + (age ? ` · age ${age}` : '')}</p>
      {type && (
        <button
          className="h0pill"
          data-a="me"
          data-p="terms"
          onClick={() => useStore.getState().openMe('terms')}
        >
          <span className="h0badge" aria-hidden="true">
            {type.emoji}
          </span>
          <span>
            Your money personality: <b>{type.name}</b>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>
      )}
    </div>
  )
}
