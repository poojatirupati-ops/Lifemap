// What Explore puts first for this customer: tools and videos that match their goals.
import type { Goal } from '../../state/types.ts'
import { goalForVideo } from '../planning/goalForVideo.ts'

const ON_TRACK = 95
const MAX_TOOLS = 6

interface GoalCover {
  id: number
  spec: string
}

/** Calculators for these goal kinds: mortgage and pension tools first, then the everyday six. */
export function toolsForYou(goalSpecs: string[]) {
  const ids = [
    ...(goalSpecs.includes('mortgage') ? ['borrow', 'deposit'] : []),
    ...(goalSpecs.includes('pension') ? ['retirement', 'contrib'] : []),
    'goalplanner',
    'emergency',
    'surplus',
    'lifecover',
    'compound',
  ]
  return ids.slice(0, MAX_TOOLS)
}

/** Goals covered less than on-track, in plan order. */
export const slippingGoals = <G extends GoalCover>(goals: G[], percent: Record<number, number>) =>
  goals.filter((goal) => percent[goal.id] < ON_TRACK)

/** The least covered goal, when it is not on track. */
export function weakestGoal<G extends GoalCover>(goals: G[], percent: Record<number, number>) {
  const weakest = goals.toSorted((a, b) => percent[a.id] - percent[b.id])[0]
  return weakest && percent[weakest.id] < ON_TRACK ? weakest : null
}

/** Videos about the weakest goal first, then about any goal, then the rest. */
export function videosForYou<V extends { kind: string }>(
  videos: V[],
  goalSpecs: string[],
  weakestSpec?: string,
) {
  const score = (kind: string) =>
    (kind === weakestSpec ? 2 : 0) + (goalSpecs.includes(kind) ? 1 : 0)
  return videos.toSorted((a, b) => score(b.kind) - score(a.kind))
}

/** "Your <goal> goal is n% covered." for the goal a video is about, once the plan is ready. */
export function whyThisVideo(
  goals: Goal[],
  percent: Record<number, number>,
  ready: boolean,
  kind: string,
) {
  const goal = goalForVideo(goals, kind)
  return ready && goal
    ? `Your ${goal.name.toLowerCase()} goal is ${percent[goal.id]}% covered.`
    : null
}
