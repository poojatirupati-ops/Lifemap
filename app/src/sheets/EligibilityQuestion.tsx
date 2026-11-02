import type { CSSProperties } from 'react'
import { ELIGIBILITY_QUESTIONS } from '../domain/finances/eligibility.ts'
import SheetTitle from './SheetTitle.tsx'

interface Props {
  index: number
  answer?: number
  onPick: (option: number) => void
  onBack: () => void
}

/** One quiz question with its progress bar. */
export default function EligibilityQuestion({ index, answer, onPick, onBack }: Props) {
  const { question, options } = ELIGIBILITY_QUESTIONS[index]
  const count = ELIGIBILITY_QUESTIONS.length
  const progress: CSSProperties = { width: `${Math.round((index / count) * 100)}%` }
  return (
    <div className="elq">
      <div className="elq-top">
        <span>
          Question {index + 1} of {count}
        </span>
        <span className="elq-bar">
          <i style={progress}></i>
        </span>
      </div>
      <SheetTitle>{question}</SheetTitle>
      <div className="elq-o">
        {options.map(({ icon, label }, option) => (
          <button
            key={label}
            className={answer === option ? 'elq-b sel' : 'elq-b'}
            onClick={() => onPick(option)}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </div>
      {index ? (
        <button className="link" onClick={onBack}>
          ← Back
        </button>
      ) : null}
    </div>
  )
}
