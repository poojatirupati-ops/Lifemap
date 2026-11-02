// Home's "Your next best step": one thing to do now, most urgent first.
import type { Plan } from '../../state/types.ts'
import type { NextFoundation } from './nextFoundation.ts'

export type NextAction = 'looks' | 'foundation' | 'profile' | 'whatIf' | 'book' | 'meeting'

export type NextStep = {
  emoji: string
  title: string
  detail: string
  button: string
  action: NextAction
  /** the foundation level's index, or the goal to try a what-if on */
  target?: number
}

type NextStepInputs = {
  /** money details that need a look and are not acknowledged */
  looks: number
  foundation: NextFoundation | null
  /** answered money-profile questions, of 13 */
  profileAnswers: number
  profileRechecked: boolean
  book: Pick<Plan['booking'], 'done' | 'slot'>
  /** the least covered goal and its percent */
  weakest: { id: number; name: string; percent: number } | null
  whatIfSaved: boolean
}

const step = (
  emoji: string,
  title: string,
  detail: string,
  button: string,
  action: NextAction,
  target?: number,
): NextStep => ({ emoji, title, detail, button, action, target })

export function nextStep(inputs: NextStepInputs): NextStep {
  const { looks, foundation, book, weakest } = inputs
  const profileDone = inputs.profileAnswers >= 13
  if (looks) {
    const title = looks === 1 ? 'One detail needs a look' : `${looks} details need a look`
    return step('⚠️', title, 'So your plan stays accurate. It takes a minute.', 'Check it', 'looks')
  }
  if (foundation && foundation.level.level <= 4) {
    const { level, title, detail } = foundation
    return step(level.emoji, title, detail, 'See why', 'foundation', level.level - 1)
  }
  if (book.done && (!profileDone || !inputs.profileRechecked)) {
    const title = 'Check your profile before your adviser meeting'
    return step('🧭', title, `${book.slot}. About 2 minutes.`, 'Check my profile', 'profile')
  }
  if (weakest && weakest.percent < 95 && !inputs.whatIfSaved) {
    const title = `Try a what-if for ${weakest.name.toLowerCase()}`
    const detail = `${weakest.name} is ${weakest.percent}% covered. See what a small change would do.`
    return step('🔮', title, detail, 'Try it', 'whatIf', weakest.id)
  }
  if (!profileDone) {
    const detail = '6 quick questions on risk, capacity and how you invest.'
    return step('🧭', 'Finish your profile', detail, 'Start', 'profile')
  }
  if (!book.done)
    return step(
      '📅',
      'Talk it through with an adviser',
      'Free, no obligation.',
      'Book a meeting',
      'book',
    )
  return step('✅', "You're all set", `Your meeting: ${book.slot}.`, 'See my meeting', 'meeting')
}
