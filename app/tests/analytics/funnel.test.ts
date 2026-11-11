import { expect, it } from 'vitest'
import { heldEvents, watchFunnel } from '../../src/analytics/analytics.ts'
import { fresh } from '../../src/state/fresh.ts'
import { showCurrentScreen, startFrom } from '../../src/state/shell.ts'
import { useStore } from '../../src/state/store.ts'

it('holds a screen view and each answer until consent; a loaded plan is not answers', () => {
  startFrom(fresh())
  const stop = watchFunnel()
  showCurrentScreen('D2', '')
  useStore.getState().update((plan) => {
    plan.answers.q3 = 1
  })
  useStore.getState().update((plan) => {
    plan.about.dependants = 2
  })
  useStore.getState().setFigure('repayment', 'rate', 4.1)
  expect(useStore.getState().plan.calcValues.repayment).toEqual({ rate: 4.1 }) // saved with the plan
  startFrom({ ...fresh(), answers: { q1: 0, q2: 1, q4: 2 } }) // a restore: many at once
  stop()
  expect(heldEvents().slice(-4)).toEqual([
    ['screen_viewed', { screen: 'D2' }],
    ['question_answered', { question: 'discover.q3', answer: 1, screen: 'D2' }],
    ['question_answered', { question: 'dependants', answer: 2, screen: 'D2' }],
    ['calculator_answered', { calculator: 'repayment', input: 'rate', screen: 'D2' }],
  ])
})
