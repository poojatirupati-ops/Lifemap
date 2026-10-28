import { useShallow } from 'zustand/react/shallow'
import { personality } from '../../domain/discovery/profile.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { localToday } from '../../lib/today.ts'
import { openMe } from '../plan/planActions.ts'
import Avatar from './Avatar.tsx'
import { profilePercent, useMePlan } from './mePlan.ts'

const today = () => localToday((globalThis as { __TODAY?: string }).__TODAY)

/** The hub's header card: photo, name, age, money personality and three stats. */
export default function ProfileCard() {
  const plan = useMePlan(
    useShallow((plan) => ({
      name: plan.acct.name || plan.fin.name || 'You',
      age: plan.about.age,
      retireSet: plan.retireSet,
      retireAge: plan.retireAge,
      goals: plan.goals.length,
      percent: profilePercent(plan),
      type: personality({ discover: plan.ans, money: plan.um.a, products: plan.um.chips }),
      startYear: assumption(plan, 'startYear', today()),
    })),
  )
  const startsLater = plan.startYear > today().getFullYear()

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
