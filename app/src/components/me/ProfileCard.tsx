import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import { personality, profileAnswers } from '../../domain/discovery/profile.ts'
import { profilePercent } from '../../domain/discovery/profileQuestions.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { localToday } from '../../lib/today.ts'
import Avatar from './Avatar.tsx'
import { useFigures } from '../../hooks/useFigures.ts'

/** The hub's header card: photo, name, age, money personality and three stats. */
export default function ProfileCard() {
  useFigures()
  const openMe = useStore((store) => store.openMe)
  const plan = useStore(
    useShallow(({ plan }) => ({
      name: plan.account.name || plan.figures.name || 'You',
      age: plan.about.age,
      retireSet: plan.retireSet,
      retireAge: plan.retireAge,
      goals: plan.goals.length,
      percent: profilePercent(plan),
      type: personality(profileAnswers(plan)),
      startYear: assumption(plan, 'startYear', localToday()),
    })),
  )
  const startsLater = plan.startYear > localToday().getFullYear()

  return (
    <div className="card mepro">
      <div className="mp-cover" aria-hidden="true"></div>
      <Avatar ring={plan.percent} />
      <h3 className="mp-name">{plan.name}</h3>
      <p className="mp-sub">
        {plan.age
          ? `Age ${plan.age}${startsLater ? ` when your plan starts in ${plan.startYear}` : ''}`
          : 'Add your date of birth in Edit profile'}
        {plan.retireSet && (
          <>
            <br />
            Retiring at {plan.retireAge}
          </>
        )}
      </p>
      {plan.type && (
        <span className="mp-type">
          <span aria-hidden="true">{plan.type.emoji}</span>
          {plan.type.name}
        </span>
      )}
      <button className="mp-edit" data-a="me" data-p="details" onClick={() => openMe('details')}>
        Edit profile
      </button>
      <div className="mp-stats">
        <div>
          <b>
            {plan.percent}
            <small>%</small>
          </b>
          <span>Profile</span>
        </div>
        <div>
          <b>{plan.goals}</b>
          <span>Goals</span>
        </div>
        <div>
          <b>{plan.retireSet ? plan.retireAge : '–'}</b>
          <span>Retire at</span>
        </div>
      </div>
    </div>
  )
}
