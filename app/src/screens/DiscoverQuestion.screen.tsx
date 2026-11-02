import clsx from 'clsx'
import { CHAPTER_ART, CHAPTERS, DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import type { Plan } from '../state/types.ts'
import { questionScreen } from '../state/discovery.ts'
import { useStore } from '../state/store.ts'
import AnswerOption from '../components/discover/AnswerOption.tsx'
import ChapterBar from '../components/discover/ChapterBar.tsx'
import ScenarioPanel from '../components/discover/ScenarioPanel.tsx'

export const key = 'DQ'
export const id = (plan: Plan) => questionScreen(plan.discoverStep)
export const note = (plan: Plan) =>
  `Discover question ${plan.discoverStep + 1} of ${DISCOVER_SIX.length} (DISC Q${DISCOVER_SIX[plan.discoverStep].id}, verbatim). One tap advances. Lifecast term shown as a tag on each answer (§12).`
export const kind = 'quiz'

export function Body() {
  const index = useStore((store) => store.plan.discoverStep)
  const question = DISCOVER_SIX[index]
  const picked = useStore((store) => store.plan.answers[question.id])
  const go = useStore((store) => store.go)
  const pickAnswer = useStore((store) => store.pickAnswer)
  const previousQuestion = useStore((store) => store.previousQuestion)
  const nextQuestion = useStore((store) => store.nextQuestion)
  const { options } = question
  const wide = options.length === 5 || options.some((option) => option.text.length > 30)

  return (
    <>
      <div className="qtop">
        <ChapterBar />
        <button className="qx" aria-label="Close and go to start" onClick={() => go('D0')}>
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
    </>
  )
}
