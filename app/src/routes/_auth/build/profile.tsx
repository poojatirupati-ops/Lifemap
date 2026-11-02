import { createFileRoute } from '@tanstack/react-router'
import { goTo } from '../../../shell/router.ts'
import { Fragment } from 'react'
import {
  isPrefilled,
  PROFILE_SECTIONS,
  profileProgress,
  questionsLeft,
} from '../../../domain/discovery/profileQuestions.ts'
import { DISCOVERY_DISCLAIMER } from '../../../domain/identity/personality.data.ts'
import { useStore } from '../../../state/store.ts'
import FlowScreen from '../../../components/frame/FlowScreen.tsx'
import Emo from '../../../components/ui/Emo.tsx'
import PrefilledAnswers from '../../../components/define/PrefilledAnswers.tsx'
import ProfileQuestionCard from '../../../components/define/ProfileQuestionCard.tsx'
import { finishProfile } from '../../../state/profile.ts'

export const Route = createFileRoute('/_auth/build/profile')({ component: Understand })

function Understand() {
  const answers = useStore((store) => store.plan.answers)

  const anyLeft = useStore((store) => questionsLeft(store.plan) > 0)
  const progress = useStore((store) => profileProgress(store.plan))
  return (
    <FlowScreen
      id="B4"
      note={
        'Plan builder step 4: your money profile = Understand Me. The 6 Discover answers pre-filled (confirm or change) + 7 to answer (Q6 + u9, u10, u12, u14, u4, u11; §13 wording). 13 questions in the whole journey. Skippable.'
      }
      eye="Step 4"
      title="Your money profile"
      sub={`${progress}. You can skip this.`}
      back={() => goTo('/build/review')}
      foot={
        <>
          <button className="btn" data-a="pbprofile" onClick={finishProfile}>
            {anyLeft ? 'Save and continue' : 'Continue'}
          </button>
          <button className="btn ghost" data-a="pbprofile" data-p="skip" onClick={finishProfile}>
            Skip for now
          </button>
        </>
      }
    >
      {PROFILE_SECTIONS.map((section) => (
        <Fragment key={section.step}>
          <div className="sec" style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 16 }}>
              <Emo>{`${section.emoji} ${section.term}: `}</Emo>
              <span style={{ fontWeight: 600 }}>{section.plain}</span>
            </h3>
          </div>
          <PrefilledAnswers entries={section.entries} />
          {section.entries
            .filter((entry) => !isPrefilled(entry, answers))
            .map((entry) => (
              <ProfileQuestionCard key={entry.question.id} entry={entry} />
            ))}
        </Fragment>
      ))}
      <p className="disc">
        Indicative only, to guide your conversation. Your adviser confirms your risk profile with
        you. {DISCOVERY_DISCLAIMER}
      </p>
    </FlowScreen>
  )
}
