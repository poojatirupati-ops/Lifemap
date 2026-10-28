import { meHead } from '../components/me/meHead.ts'
import { backToMe } from '../components/finance/financeActions.ts'
import ProfileReturn from '../components/me/ProfileReturn.tsx'
import ProfileSectionButton from '../components/me/ProfileSectionButton.tsx'
import {
  PROFILE_QUESTIONS,
  profileAnswered,
  profileLeftText,
  profilePercent,
} from '../components/me/mePlan.ts'
import { openMe } from '../components/plan/planActions.ts'
import { discoverAnswered } from '../domain/discovery/profile.ts'
import { MONEY_PROFILE } from '../domain/discovery/questions.data.ts'
import { useStore } from '../state/store.ts'

export const key = 'ME:um'
export const id = 'ME-UM'
export const note =
  'Understand Me = your money profile: 13 questions in 3 sections, each named with the term + a plain label (§12). 6 pre-filled from Discover, 7 to answer.'

export const Head = () =>
  meHead({
    title: 'Your money profile',
    sub: `${profileLeftText(useStore.getState().plan)}.`,
    back: backToMe,
  })

export function Body() {
  const plan = useStore((store) => store.plan)
  const answered = profileAnswered(plan)
  const percent = profilePercent(plan)

  return (
    <>
      <div className="card ump-hero">
        <div className="ump-top">
          <div>
            <small>Your progress</small>
            <b>
              {answered}
              <span> of 13 answered</span>
            </b>
          </div>
          <span className="ump-pct">{percent}%</span>
        </div>
        <div className="ump-bar">
          <i style={{ width: `${percent}%` }}></i>
        </div>
        <p>
          {discoverAnswered(plan.ans)} came from your first answers. Three short sections make up
          your risk profile.
        </p>
      </div>
      {MONEY_PROFILE.map((section) => (
        <ProfileSectionButton key={section.step} section={section} />
      ))}
      {answered === PROFILE_QUESTIONS && (
        <button
          className="btn"
          data-a="me"
          data-p="umr"
          style={{ marginTop: 6 }}
          onClick={() => openMe('umr')}
        >
          See my profile
        </button>
      )}
      <ProfileReturn />
    </>
  )
}
