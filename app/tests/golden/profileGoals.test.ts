// Goals and the normalisers must equal the ORIGINAL script's, run in node:vm, on every fixture.
import { describe, expect, it } from 'vitest'
import { OTHER_GOALS } from '../../src/domain/discovery/goals.data'
import {
  clampSafetyMonths,
  emergencyFundToAdd,
  goalsRetiringAt,
  newGoal,
} from '../../src/domain/goals/goals'
import { syncAges, syncSafety } from '../../src/domain/plan/normalize'
import { localToday } from '../../src/lib/today'
import { defaultSettings } from '../../src/domain/planning/settings'
import { TODAY } from './origSlice'
import { original, plain, fixtures, originalNormalized, ourNormalized } from './origProfile'
import { pensionItem, planVariants } from './profileVariants'

describe('normalisers equal the original', () => {
  it('syncAges and syncSafety', () => {
    for (const [fixture, fixturePlan] of fixtures) {
      for (const input of planVariants(fixturePlan)) {
        const plan = ourNormalized(input)
        originalNormalized(input)
        original.syncAges()
        original.syncSafety()
        expect(plain(plan), fixture).toEqual(plain(original.getState()))
      }
    }
  })

  it('syncAges and syncSafety are idempotent', () => {
    for (const [, fixturePlan] of fixtures) {
      for (const input of planVariants(fixturePlan)) {
        const plan = ourNormalized(input)
        const again = structuredClone(plan)
        syncAges(again, localToday(TODAY))
        syncSafety(again)
        expect(plain(again)).toEqual(plain(plan))
      }
    }
  })
})

describe('goals equal the original', () => {
  it('newGoal for each kind, with and without a custom goal', () => {
    for (const [fixture, fixturePlan] of fixtures) {
      for (const input of planVariants(fixturePlan)) {
        if (input.about.age == null) continue
        for (const key of ['home', 'retire', 'edu', 'legacy', 'safety', 'travel']) {
          for (const other of [undefined, OTHER_GOALS[0]]) {
            const plan = ourNormalized(input)
            originalNormalized(plan)
            const custom = other && [other.emoji, other.name, other.amount, other.years]
            const originalGoal = plain(original.mkGoal(key, custom))
            const goal = newGoal(plan, plan.gid++, key, other)
            expect(plain(goal), fixture + key).toEqual(originalGoal)
            expect(plan.gid).toBe(original.getState().gid)
          }
        }
      }
    }
  })

  it('safety months, the emergency fund added when short, the retirement age', () => {
    for (const [, fixturePlan] of fixtures) {
      for (const input of planVariants(fixturePlan)) {
        if (input.about.age == null) continue
        const months = ourNormalized(input)
        originalNormalized(months)
        original.setSafetyMonths(7)
        months.asm = { ...months.asm, safetyMonths: clampSafetyMonths(7) }
        syncSafety(months)
        expect(plain(months)).toEqual(plain(original.getState()))

        const started = { ...ourNormalized(input), app: true }
        originalNormalized(started)
        original.getState().app = true
        original.autoSafety()
        const plan = { ...ourNormalized(started), app: true }
        const added = emergencyFundToAdd(plan, plan.gid)
        if (added) plan.goals.push(added)
        expect(plain(plan.goals)).toEqual(plain(original.getState().goals))

        const retiring = ourNormalized(input)
        originalNormalized(retiring)
        original.setRetireAge(61)
        retiring.goals = goalsRetiringAt(retiring.goals, 61)
        expect(plain(retiring.goals)).toEqual(plain(original.getState().goals))
      }
    }
  })

  it('pension own share follows asmV, including the admin override', () => {
    const base = structuredClone(fixtures[0][1])
    base.lists = {
      pens: [
        pensionItem({ value: 5000, monthly: 200 }),
        pensionItem({ value: 100, monthly: 100, own: 30 }),
      ],
    }
    const cases = [
      [undefined, '', undefined],
      [0.4, '', undefined],
      [0.4, 'Self-employed', undefined],
      [0.4, '', 0.25],
    ] as const
    try {
      for (const [partnerValue, work, ownShare] of cases) {
        defaultSettings.standards.ownShare.partnerValue = partnerValue
        original.SETTINGS.s.ownShare.pv = partnerValue
        const input = structuredClone(base)
        input.fin.work = work
        if (ownShare != null) input.asm = { ownShare }
        const plan = ourNormalized(input)
        const originalPlan = originalNormalized(input)
        expect(plan.fin.pensionOwnM).toBe(originalPlan.fin.pensionOwnM)
        expect(plan.fin.pensionOwnM).toBeGreaterThan(0)
      }
    } finally {
      delete defaultSettings.standards.ownShare.partnerValue
      delete original.SETTINGS.s.ownShare.pv
    }
  })
})
