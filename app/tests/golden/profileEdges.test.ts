// Branches the fixture grid in profile.test.ts never isolates, each against the ORIGINAL in node:vm.
import { describe, expect, it } from 'vitest'
import { suggestedHorizon } from '../../src/domain/discovery/profile'
import { riskRead } from '../../src/domain/discovery/riskRead'
import { emergencyFundToAdd, essentialSpending } from '../../src/domain/goals/goals'
import { assumption } from '../../src/domain/planning/assumptions'
import { original, plain, fixtures, originalNormalized, ourNormalized } from './origProfile'
import { toOriginal } from '../../src/state/migrate'
import { asOriginalRead, profileAnswers, riskContext } from './profileAdapters'

const withAge = fixtures.filter(([, plan]) => plan.about.age != null)
const range = (count: number) => [...Array(count).keys()]

const ourRead = (plan: any) =>
  plain(
    asOriginalRead(
      riskRead(profileAnswers(plan), riskContext(plan, true, plain(original.cushionM()))),
    ),
  )

describe('risk read, every Understand Me capacity answer on its own', { timeout: 30_000 }, () => {
  it('u10 0..3 x u11 0..3 x u12 0..2 x u14 0..3, two answer sets', () => {
    const answerSets = [
      { '6': 3, '7': 3, '8': 3, '9': 3 },
      { '6': 2, '7': 2, '8': 2, '9': 2 },
    ]
    // 1e6: a full emergency fund, so the cushion never caps first
    const cashes = [null, 1e6]
    const capacityAnswers = range(4).flatMap((u10) =>
      range(4).flatMap((u11) =>
        range(3).flatMap((u12) => range(4).map((u14) => ({ u10, u11, u12, u14 }))),
      ),
    )
    for (const [fixture, fixturePlan] of withAge.slice(0, 3)) {
      for (const answers of answerSets) {
        for (const cash of cashes) {
          for (const capacity of capacityAnswers) {
            const input = structuredClone(fixturePlan)
            input.ans = { ...input.ans, ...answers }
            if (cash) input.fin = { ...input.fin, cash }
            input.um = {
              ...input.um,
              a: { ...input.um.a, u9: 3, ...capacity },
              chips: ['Shares or funds'],
            }
            originalNormalized(input)
            const plan = ourNormalized(input)
            expect(ourRead(plan), `${fixture} ${Object.values(capacity).join('')}`).toEqual(
              plain(original.riskRead(true)),
            )
          }
        }
      }
    }
  }, 120_000)
})

describe('horizon suggestion at every year boundary', { timeout: 30_000 }, () => {
  it('a pot goal, or another goal, 1..12 years away', () => {
    for (const [fixture, fixturePlan] of withAge) {
      for (const kind of ['pot', 'spend']) {
        for (let years = 1; years <= 12; years++) {
          const input = structuredClone(fixturePlan)
          const age = input.about.age + years
          input.goals = [{ id: 1, k: 'x', kind, age, saved: 0, amount: 1 }]
          originalNormalized(input)
          const plan = ourNormalized(input)
          expect(
            suggestedHorizon(plan.goals, plan.about.age, plan.retireAge),
            `${fixture} ${kind} ${years}`,
          ).toBe(original.suggestU9())
        }
      }
    }
  })
})

describe('emergency fund cash tolerance', { timeout: 30_000 }, () => {
  it('cash just under and just over the target', () => {
    for (const [fixture, fixturePlan] of withAge) {
      for (const belowTarget of [0.3, 0.7, -0.3]) {
        const input = structuredClone(fixturePlan)
        input.app = true
        input.safetyOff = false
        input.safetyWanted = false
        input.goals = input.goals.filter((goal: any) => goal.k !== 'safety')
        input.src = { ...input.src, costsM: 'typed', cash: 'typed' }
        input.fin = { ...input.fin, costsM: 2000 }
        const sized = ourNormalized(input)
        const target = assumption(sized, 'safetyMonths') * essentialSpending(sized)
        input.fin.cash = target - belowTarget
        originalNormalized(input)
        original.getState().app = true
        original.autoSafety()
        const plan = ourNormalized(input)
        const added = emergencyFundToAdd(plan, plan.nextGoalId)
        if (added) plan.goals.push(added)
        expect(plain(toOriginal(plan).goals), `${fixture} ${belowTarget}`).toEqual(
          plain(original.getState().goals),
        )
      }
    }
  })
})

describe('risk read, the cushion months from their own figures', { timeout: 30_000 }, () => {
  it('cash covering 0 to 4 months of essential spending', () => {
    for (const [fixture, fixturePlan] of withAge) {
      for (const months of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]) {
        const input = structuredClone(fixturePlan)
        input.ans = { ...input.ans, '6': 3, '7': 3, '8': 3, '9': 3 }
        input.src = { ...input.src, costsM: 'typed', cash: 'typed' }
        input.fin = { ...input.fin, costsM: 2000 }
        input.fin.cash = Math.round(months * essentialSpending(ourNormalized(input)))
        originalNormalized(input)
        const plan = ourNormalized(input)
        expect(ourRead(plan), `${fixture} ${months}`).toEqual(plain(original.riskRead(true)))
      }
    }
  })
})
