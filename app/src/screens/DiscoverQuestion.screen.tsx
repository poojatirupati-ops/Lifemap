import { CHAPTERS, DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import type { Plan } from '../state/types.ts'
import { useStore } from '../state/store.ts'
import AnswerOption from '../components/discover/AnswerOption.tsx'
import ChapterBar from '../components/discover/ChapterBar.tsx'
import ScenarioPanel from '../components/discover/ScenarioPanel.tsx'
import {
  nextQuestion,
  pickAnswer,
  previousQuestion,
} from '../components/discover/discoverActions.ts'

export const key = 'DQ'
export const id = (plan: Plan) => `D${plan.di + 2}`
export const note = (plan: Plan) =>
  `Discover question ${plan.di + 1} of 6 (DISC Q${DISCOVER_SIX[plan.di].id}, verbatim). One tap advances. Lifecast term shown as a tag on each answer (§12).`
export const kind = 'quiz'

const CHAPTER_ART: Record<number, string> = {
  1: 'art-savings',
  2: 'art-investing',
  3: 'art-rain',
  4: 'art-map',
  5: 'art-pension',
}

export function Body() {
  const index = useStore((store) => store.plan.di)
  const picked = useStore((store) => store.plan.ans[DISCOVER_SIX[index].id])
  const question = DISCOVER_SIX[index]
  const { options, type } = question
  const wide = options.length === 5 || options.some((option) => option.text.length > 30)

  return (
    <>
      <div className="qtop">
        <ChapterBar />
        <button
          className="qx"
          data-a="go"
          data-p="D0"
          aria-label="Close and go to start"
          onClick={() => useStore.getState().go('D0')}
        >
          ✕
        </button>
      </div>
      <div className="qbody qcenter">
        <div className="qmeta">
          <div className="qcount">
            Question <b>{index + 1} of 6</b>
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
        {type === 'scenario' && <ScenarioPanel from={question.from!} to={question.to!} />}
        <div className={wide ? 'opts' : 'opts two'} role="group" aria-label="Answers">
          {options.map((option, i) => (
            <AnswerOption
              key={i}
              option={option}
              index={i}
              selected={picked === i}
              wide={wide}
              road={type === 'ride'}
              onPick={() => pickAnswer(i)}
            />
          ))}
        </div>
      </div>
      <div className="qfoot">
        <button className="qback" data-a="dprev" onClick={previousQuestion}>
          ← Back
        </button>
        <span className="qhint" />
        <button className="qback" data-a="dnext" onClick={nextQuestion}>
          Skip
        </button>
      </div>
    </>
  )
}
