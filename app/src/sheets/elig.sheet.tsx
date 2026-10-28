import { useState } from 'react'
import { ELIGIBILITY_QUESTIONS } from './eligibility.ts'
import EligibilityQuestion from './EligibilityQuestion.tsx'
import EligibilityResult from './EligibilityResult.tsx'

export const key = 'elig'

/** The quiz starts over each time the sheet opens. */
export function Body() {
  const [answers, setAnswers] = useState<number[]>([])
  const [index, setIndex] = useState(0)

  if (index >= ELIGIBILITY_QUESTIONS.length)
    return (
      <EligibilityResult
        answers={answers}
        onRestart={() => {
          setAnswers([])
          setIndex(0)
        }}
      />
    )

  return (
    <EligibilityQuestion
      index={index}
      answer={answers[index]}
      onPick={(option) => {
        setAnswers((previous) => Object.assign([...previous], { [index]: option }))
        setIndex(index + 1)
      }}
      onBack={() => setIndex(index - 1)}
    />
  )
}
