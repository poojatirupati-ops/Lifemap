import type { ReactNode } from 'react'
import { ADVICE_GUARD, type Topic } from './topics.tsx'

const ASKS_FOR_ADVICE =
  /\b(should i|shall i|which (fund|product|pension|provider|bank)|recommend|best (fund|investment|pension|mortgage|option)|buy|sell|invest in|worth it|tell me what to do)\b/

/**
 * A typed question's answer: never advice; else the first topic whose words match.
 * `topics` are the plan's own topics then the general ones; `hasPlan` says whether plan topics exist.
 */
export function matchQuestion(
  text: string,
  topics: Topic[],
  hasPlan: boolean,
  inApp: boolean,
): ReactNode {
  const typed = text.toLowerCase()
  if (ASKS_FOR_ADVICE.test(typed)) return ADVICE_GUARD
  const answer = (key: string) => topics.find((topic) => topic.key === key)?.answer
  const gap = hasPlan ? (answer('pgap') ? 'pgap' : 'pok') : 'covered'
  const rules: [RegExp, string][] = [
    [/advice|advise/, 'advice'],
    [/%|percent|covered|on track/, gap],
    [/today|inflation|prices/, 'today'],
    [/capacity|afford|loss/, 'capacity'],
    [/behaviou?r/, 'behaviour'],
    [/risk|profile/, hasPlan ? 'prisk' : 'risk'],
    [/retire|pension/, hasPlan ? 'pret' : 'covered'],
    [/gap|short/, hasPlan && answer('pgap') ? 'pgap' : 'covered'],
    [/strength|best/, hasPlan ? 'pbest' : 'covered'],
    [/estimat|example|don.?t know|not sure/, 'estimate'],
    [/data|safe|privacy|share|delete/, 'data'],
    [/partner|wife|husband|spouse/, 'partner'],
    [/cost|free|fee|charge|money do you make/, 'free'],
  ]
  for (const [words, key] of rules) if (words.test(typed) && answer(key)) return answer(key)
  const book = inApp ? ', or book a free adviser meeting for personal advice' : ''
  return `I can explain how LifeMap works and what your results mean. Try one of the questions above${book}.`
}
