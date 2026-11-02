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

export type NextStepInputs = {
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

export function nextStep(inputs: NextStepInputs): NextStep {
  const { looks, foundation, book, weakest } = inputs
  if (looks)
    return {
      emoji: '⚠️',
      title: looks === 1 ? 'One detail needs a look' : `${looks} details need a look`,
      detail: 'So your plan stays accurate. It takes a minute.',
      button: 'Check it',
      action: 'looks',
    }
  if (foundation && foundation.level.level <= 4)
    return {
      emoji: foundation.level.emoji,
      title: foundation.title,
      detail: foundation.detail,
      button: 'See why',
      action: 'foundation',
      target: foundation.level.level - 1,
    }
  const profileDone = inputs.profileAnswers >= 13
  if (book.done && (!profileDone || !inputs.profileRechecked))
    return {
      emoji: '🧭',
      title: 'Check your profile before your adviser meeting',
      detail: `${book.slot}. About 2 minutes.`,
      button: 'Check my profile',
      action: 'profile',
    }
  if (weakest && weakest.percent < 95 && !inputs.whatIfSaved)
    return {
      emoji: '🔮',
      title: `Try a what-if for ${weakest.name.toLowerCase()}`,
      detail: `${weakest.name} is ${weakest.percent}% covered. See what a small change would do.`,
      button: 'Try it',
      action: 'whatIf',
      target: weakest.id,
    }
  if (!profileDone)
    return {
      emoji: '🧭',
      title: 'Finish your profile',
      detail: '6 quick questions on risk, capacity and how you invest.',
      button: 'Start',
      action: 'profile',
    }
  if (!book.done)
    return {
      emoji: '📅',
      title: 'Talk it through with an adviser',
      detail: 'Free, no obligation.',
      button: 'Book a meeting',
      action: 'book',
    }
  return {
    emoji: '✅',
    title: "You're all set",
    detail: `Your meeting: ${book.slot}.`,
    button: 'See my meeting',
    action: 'meeting',
  }
}
