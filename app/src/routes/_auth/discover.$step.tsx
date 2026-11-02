import clsx from 'clsx'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import Screen from '../../shell/Screen.tsx'
import { CHAPTER_ART, CHAPTERS, DISCOVER_SIX } from '../../domain/discovery/questions.data.ts'
import { questionScreen } from '../../state/discovery.ts'
import { useStore } from '../../state/store.ts'
import AnswerOption from '../../components/discover/AnswerOption.tsx'
import ChapterBar from '../../components/discover/ChapterBar.tsx'
import ScenarioPanel from '../../components/discover/ScenarioPanel.tsx'

// /discover/1 to /discover/6: the question's number sets plan.discoverStep (0 to 5)
export const Route = createFileRoute('/_auth/discover/$step')({
  beforeLoad: ({ params }) => {
    const index = Number(params.step) - 1
    if (!DISCOVER_SIX[index]) throw redirect({ to: '/discover/$step', params: { step: '1' } })
    useStore.getState().update((plan) => void (plan.discoverStep = index))
  },
  component: DiscoverQuestion,
})

function DiscoverQuestion() {
  const index = useStore((store) => store.plan.discoverStep)
  const question = DISCOVER_SIX[index]
  const picked = useStore((store) => store.plan.answers[question.id])
  const navigate = useNavigate()
  const { pickAnswer, previousQuestion, nextQuestion } = useStore.getState()
  const { options } = question
  const wide = options.length === 5 || options.some((option) => option.text.length > 30)

  return (
    <Screen
      id={questionScreen(index)}
      note={`Discover question ${index + 1} of ${DISCOVER_SIX.length} (DISC Q${question.id}, verbatim). One tap advances. Lifecast term shown as a tag on each answer (§12).`}
      quiz
    >
      <div className="qtop">
        <ChapterBar />
        <button
          className="qx"
          aria-label="Close and go to start"
          onClick={() => void navigate({ to: '/' })}
        >
          ✕
        </button>
      </div>
      <div className="qbody qcenter">
        <div className="qmeta">
          <div className="qcount">
            Question{' '}
            <b>
              {index + 1} of {DISCOVER_SIX.length}
            </b>
          </div>
          <div className="qeye">{CHAPTERS[question.chapter]}</div>
        </div>
        <div
          className="qart"
          aria-hidden="true"
          style={{ backgroundImage: `var(--${CHAPTER_ART[question.chapter]})` }}
        >
          <i />
          <i />
          <i />
        </div>
        <h2 tabIndex={-1}>{question.title}</h2>
        <p className="qsub">{question.subtitle}</p>
        <p className="qtap">Tap an answer to continue</p>
        {question.type === 'scenario' ? (
          <ScenarioPanel from={question.from} to={question.to} />
        ) : null}
        <div
          className={clsx('opts', !wide && 'two', picked !== undefined && 'picked')}
          role="group"
          aria-label="Answers"
        >
          {options.map((option, i) => (
            <AnswerOption
              key={i}
              option={option}
              index={i}
              selected={picked === i}
              wide={wide}
              onPick={() => pickAnswer(i)}
            />
          ))}
        </div>
      </div>
      <div className="qfoot">
        <button className="qback" onClick={previousQuestion}>
          ← Back
        </button>
        <span className="qhint" />
        <button className="qback" onClick={nextQuestion}>
          Skip
        </button>
      </div>
    </Screen>
  )
}
