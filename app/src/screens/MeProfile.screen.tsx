import { meHead } from '../components/me/meHead.ts'
import { backToMe } from '../components/finance/financeActions.ts'
import ProfileReturn from '../components/me/ProfileReturn.tsx'
import ProfileSectionButton from '../components/me/ProfileSectionButton.tsx'
import {
  discoverAnswered,
  PROFILE_QUESTIONS,
  profileAnswered,
  profilePercent,
} from '../domain/discovery/profile.ts'
import { profileProgress } from '../domain/discovery/profileQuestions.ts'
import { MONEY_PROFILE } from '../domain/discovery/questions.data.ts'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../state/store.ts'

export const key = 'ME:um'
export const id = 'ME-UM'
export const note =
  'Understand Me = your money profile: 13 questions in 3 sections, each named with the term + a plain label (§12). 6 pre-filled from Discover, 7 to answer.'

export const Head = () =>
  meHead({
    title: 'Your money profile',
    sub: `${profileProgress(useStore.getState().plan)}.`,
    back: backToMe,
  })

export function Body() {
  const { answered, percent, firstAnswers } = useStore(
    useShallow(({ plan }) => ({
      answered: profileAnswered(plan),
      percent: profilePercent(plan),
      firstAnswers: discoverAnswered(plan.answers),
    })),
  )
  const openMe = useStore((store) => store.openMe)

  return (
    <>
      <div className="card ump-hero">
        <div className="ump-top">
          <div>
            <small>Your progress</small>
            <b>
              {answered}
              <span> of {PROFILE_QUESTIONS} answered</span>
            </b>
          </div>
          <span className="ump-pct">{percent}%</span>
        </div>
        <div className="ump-bar">
          <i style={{ width: `${percent}%` }}></i>
        </div>
        <p>
          {firstAnswers} came from your first answers. Three short sections make up your risk
          profile.
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
