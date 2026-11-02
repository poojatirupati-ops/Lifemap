import type { ReactNode } from 'react'
import { ADVICE_GUARD, type Topic } from './topics.tsx'

const ASKS_FOR_ADVICE =
  /\b(should i|shall i|which (fund|product|pension|provider|bank)|recommend|best (fund|investment|pension|mortgage|option)|buy|sell|invest in|worth it|tell me what to do)\b/

interface PlanKeys {
  hasPlan: boolean
  hasGap: boolean
}

function coverKey({ hasPlan, hasGap }: PlanKeys) {
  if (!hasPlan) return 'covered'
  return hasGap ? 'pgap' : 'pok'
}

/** Words in a question -> the topic that answers it (some depend on whether there is a plan). */
const RULES: [RegExp, string | ((plan: PlanKeys) => string)][] = [
  [/advice|advise/, 'advice'],
  [/%|percent|covered|on track/, coverKey],
  [/today|inflation|prices/, 'today'],
  [/capacity|afford|loss/, 'capacity'],
  [/behaviou?r/, 'behaviour'],
  [/risk|profile/, ({ hasPlan }) => (hasPlan ? 'prisk' : 'risk')],
  [/retire|pension/, ({ hasPlan }) => (hasPlan ? 'pret' : 'covered')],
  [/gap|short/, ({ hasGap }) => (hasGap ? 'pgap' : 'covered')],
  [/strength|best/, ({ hasPlan }) => (hasPlan ? 'pbest' : 'covered')],
  [/estimat|example|don.?t know|not sure/, 'estimate'],
  [/data|safe|privacy|share|delete/, 'data'],
  [/partner|wife|husband|spouse/, 'partner'],
  [/cost|free|fee|charge|money do you make/, 'free'],
]

/** A typed question's answer: never advice; else the first topic whose words match. */
export function matchQuestion(text: string, topics: Topic[], inApp: boolean): ReactNode {
  const typed = text.toLowerCase()
  if (ASKS_FOR_ADVICE.test(typed)) return ADVICE_GUARD
  const answer = (key: string) => topics.find((topic) => topic.key === key)?.answer
  // the plan's own topics always include its gap (or "on track")
  const hasPlan = answer('pgap') != null || answer('pok') != null
  const plan: PlanKeys = { hasPlan, hasGap: hasPlan && !!answer('pgap') }
  for (const [words, rule] of RULES) {
    const key = typeof rule === 'string' ? rule : rule(plan)
    if (words.test(typed) && answer(key)) return answer(key)
  }
  const book = inApp ? ', or book a free adviser meeting for personal advice' : ''
  return `I can explain how LifeMap works and what your results mean. Try one of the questions above${book}.`
}
