import type { Goal } from '../../state/types.ts'

/** The goal a video is about: one with its topic, or retirement for a pension video. */
export const goalForVideo = (goals: Goal[], kind: string): Goal | undefined =>
  goals.find((goal) => goal.spec === kind && goal.kind !== 'retire') ??
  (kind === 'pension' ? goals.find((goal) => goal.kind === 'retire') : undefined)
