import { Fragment } from 'react'
import { discoverAnswered } from '../domain/discovery/profile.ts'
import { MONEY_PROFILE } from '../domain/discovery/questions.data.ts'
import { DISCOVERY_DISCLAIMER } from '../domain/identity/personality.data.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import Emo from '../components/ui/Emo.tsx'
import PrefilledAnswers from '../components/define/PrefilledAnswers.tsx'
import ProfileQuestionCard from '../components/define/ProfileQuestionCard.tsx'
import {
  NEW_QUESTIONS,
  answerOf,
  finishProfile,
  profileQuestion,
} from '../components/define/profileActions.ts'

export const key = 'B4'
export const id = 'B4'
export const note =
  'Plan builder step 4: your money profile = Understand Me. The 6 Discover answers pre-filled (confirm or change) + 7 to answer (Q6 + u9, u10, u12, u14, u4, u11; §13 wording). 13 questions in the whole journey. Skippable.'

const SECTIONS = MONEY_PROFILE.map((step) => ({
  ...step,
  entries: step.questions.map(profileQuestion),
}))

const questionsLeft = (plan: Pick<Plan, 'ans' | 'um'>) =>
  NEW_QUESTIONS.filter((entry) => answerOf(plan, entry) == null).length

function progressText(plan: Plan) {
  const left = questionsLeft(plan)
  const all = NEW_QUESTIONS.length
  const status =
    left === all
      ? `${all} quick questions`
      : left
        ? `${left} of ${all} left`
        : `All ${all} answered`
  return `${status} · your first ${discoverAnswered(plan.ans)} answers are filled in`
}

export const Head = () =>
  FlowHead({
    eye: 'Step 4',
    title: 'Your money profile',
    sub: `${progressText(useStore.getState().plan)}. You can skip this.`,
    back: () => useStore.getState().go('F4'),
  })

export function Body() {
  const answers = useStore((store) => store.plan.ans)
  const unanswered = SECTIONS.map((section) =>
    section.entries.filter((entry) => !entry.discover || answers[entry.question.id] == null),
  )

  return (
    <>
      {SECTIONS.map((section, index) => (
        <Fragment key={section.step}>
          <div className="sec" style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 16 }}>
              <Emo>{`${section.emoji} ${section.term}: `}</Emo>
              <span style={{ fontWeight: 600 }}>{section.plain}</span>
            </h3>
          </div>
          <PrefilledAnswers entries={section.entries} />
          {unanswered[index].map((entry) => (
            <ProfileQuestionCard key={entry.question.id} entry={entry} />
          ))}
        </Fragment>
      ))}
      <p className="disc">
        Indicative only, to guide your conversation. Your adviser confirms your risk profile with
        you. {DISCOVERY_DISCLAIMER}
      </p>
    </>
  )
}

export function Foot() {
  const anyLeft = useStore((store) => questionsLeft(store.plan) > 0)
  return (
    <>
      <button className="btn" data-a="pbprofile" onClick={finishProfile}>
        {anyLeft ? 'Save and continue' : 'Continue'}
      </button>
      <button className="btn ghost" data-a="pbprofile" data-p="skip" onClick={finishProfile}>
        Skip for now
      </button>
    </>
  )
}
