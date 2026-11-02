import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../../components/frame/AppScreen.tsx'
import { backToMe } from '../../../../../state/finances.ts'
import ProfileReturn from '../../../../../components/me/ProfileReturn.tsx'
import ProfileSectionButton from '../../../../../components/me/ProfileSectionButton.tsx'
import {
  discoverAnswered,
  PROFILE_QUESTIONS,
  profileAnswered,
  profilePercent,
} from '../../../../../domain/discovery/profileQuestions.ts'
import { profileProgress } from '../../../../../domain/discovery/profileQuestions.ts'
import { MONEY_PROFILE } from '../../../../../domain/discovery/questions.data.ts'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../../../../state/store.ts'

export const Route = createFileRoute('/_auth/_app/me/profile/')({ component: MeProfile })

function MeProfile() {
  const { answered, percent, firstAnswers } = useStore(
    useShallow(({ plan }) => ({
      answered: profileAnswered(plan),
      percent: profilePercent(plan),
      firstAnswers: discoverAnswered(plan.answers),
    })),
  )
  const { openMe } = useStore.getState()
  const progress = useStore((store) => profileProgress(store.plan))
  return (
    <AppScreen
      id="ME-UM"
      note={
        'Understand Me = your money profile: 13 questions in 3 sections, each named with the term + a plain label (§12). 6 pre-filled from Discover, 7 to answer.'
      }
      title="Your money profile"
      sub={`${progress}.`}
      back={backToMe}
      bell
    >
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
    </AppScreen>
  )
}
