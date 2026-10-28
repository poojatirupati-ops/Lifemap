import { useStore } from '../state/store.ts'
import { meHead } from '../components/me/meHead.ts'
import { answerOf, NEW_QUESTIONS } from '../components/define/profileActions.ts'
import HouseholdCard from '../components/me/HouseholdCard.tsx'
import MeRow from '../components/me/MeRow.tsx'
import PersonalityCard from '../components/me/PersonalityCard.tsx'
import ProfileCard from '../components/me/ProfileCard.tsx'
import SignOutRow from '../components/me/SignOutRow.tsx'
import { makePlan, toProfile } from '../components/me/meActions.ts'
import { profileAnswered, profilePercent, useMePlan, type MePlan } from '../components/me/mePlan.ts'
import { openMe } from '../components/plan/planActions.ts'
import { discoverAnswered } from '../domain/discovery/profile.ts'

export const key = 'ME:home'
export const id = 'ME-01'
export const note =
  'Me = profile hub: name, partner (invite or add myself), dependants · money personality + indicative risk profile · re-check of first answers · deeper questions (feed My Plan). Not a gate.'

export const Head = () =>
  meHead({ title: 'Me', sub: 'Your profile. It shapes your plan and helps your adviser.' })

const needsProfileCheck = (plan: MePlan) =>
  plan.book.done && (profileAnswered(plan) < 13 || !plan.um.rechecked)

const deeperAnswered = (plan: MePlan) =>
  NEW_QUESTIONS.filter((entry) => answerOf(plan, entry) != null).length

export function Body() {
  const plan = useMePlan((plan) => plan)
  const inApp = useStore((store) => store.plan.app)

  return (
    <>
      {needsProfileCheck(plan) && (
        <div className="nudge">
          <span aria-hidden="true">🧭</span>
          <span>Check your profile before your adviser meeting</span>
          <button className="link" data-a="toprofile" onClick={toProfile}>
            Check now
          </button>
        </div>
      )}
      <ProfileCard />
      <HouseholdCard />
      <PersonalityCard />
      <h3 className="me-gh">Your profile</h3>
      <div className="melist">
        <MeRow
          emoji="✅"
          title="Your first answers"
          detail={
            plan.um.rechecked
              ? 'Checked ✓'
              : `${discoverAnswered(plan.ans)} answers · check they still fit`
          }
          action="me"
          page="recheck"
          onClick={() => openMe('recheck')}
        />
        <MeRow
          emoji="📖"
          title="Your money terms"
          detail="Adviser words, in plain English"
          action="me"
          page="terms"
          onClick={() => openMe('terms')}
        />
        <MeRow
          emoji="🧭"
          title="Your full money profile"
          detail={`${deeperAnswered(plan)} of 7 deeper questions`}
          action="me"
          page="um"
          right={<span className="me-pct">{profilePercent(plan)}%</span>}
          onClick={() => openMe('um')}
        />
      </div>
      <h3 className="me-gh">Settings</h3>
      <div className="melist">
        {inApp ? (
          <MeRow
            emoji="💶"
            title="My money"
            detail="Finances and documents"
            action="me"
            page="money"
            onClick={() => openMe('money')}
          />
        ) : (
          <MeRow
            emoji="💶"
            title="My money"
            detail="Added when you make your plan"
            action="makeplan"
            onClick={makePlan}
          />
        )}
        <MeRow
          emoji="🧮"
          title="Your assumptions"
          detail="Prices, growth and retirement"
          action="me"
          page="asm"
          onClick={() => openMe('asm')}
        />
        <MeRow
          emoji="🔐"
          title="Privacy & preferences"
          detail="Consents and your data"
          action="me"
          page="privacy"
          onClick={() => openMe('privacy')}
        />
        <SignOutRow />
      </div>
      <p className="disc">
        None of this is required. It sharpens your plan and means your adviser won't ask you again.
      </p>
    </>
  )
}
