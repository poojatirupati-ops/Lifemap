// Profile data and scoring must equal the ORIGINAL script's, run in node:vm, on every fixture.
import { describe, expect, it } from 'vitest'
import {
  ADVISER_NOTES,
  COMFORT_LABELS,
  EXPERIENCE_NOTE,
  MISMATCH_MESSAGES,
  PERSONALITY_TIE_ORDER,
  PERSONALITY_WEIGHTS,
  RISK_LABELS,
  RISK_SET_BY,
} from '../../src/domain/discovery/profile.data'
import { discoverQuestion, moneyQuestion } from '../../src/domain/discovery/questions.data'
import {
  hasEnoughForPersonality,
  optionScore,
  personality,
  suggestedHorizon,
} from '../../src/domain/discovery/profile'
import { discoverAnswered, profileAnswered } from '../../src/domain/discovery/profileQuestions'
import { riskLabelText, riskRead } from '../../src/domain/discovery/riskRead'
import { asOriginalRead, profileAnswers, riskContext } from './profileAdapters'
import { original, plain, fixtures, originalNormalized, ourNormalized } from './origProfile'
import { variant } from './profileVariants'

describe('profile data equals the original', { timeout: 30_000 }, () => {
  it('tables and wording', () => {
    expect(PERSONALITY_WEIGHTS).toEqual(plain(original.PW))
    expect(PERSONALITY_TIE_ORDER).toEqual(original.P_ORDER)
    expect(RISK_LABELS).toEqual(plain(original.RISK_LBL))
    expect(COMFORT_LABELS).toEqual(plain(original.COMFORT))
    expect(MISMATCH_MESSAGES).toEqual(plain(original.MIS))
    expect(ADVISER_NOTES).toEqual(plain(original.MIS_ADV))
    expect(RISK_SET_BY).toEqual(plain(original.RISK_SETBY))
    expect(EXPERIENCE_NOTE).toBe(original.KE_NOTE)
  })
})

// appetite (Q8) x composure (Q9) x surprise (Q7), with Q2/Q4/Q6/Q12 following them
const answerGrid = (plan: any) => {
  const plans = [plan]
  for (const appetite of [1, 2, 3, 4]) {
    for (const composure of [1, 2, 3, 4]) {
      for (const surprise of [0, 2, 3]) {
        plans.push(
          variant(plan, (p) => {
            p.ans = {
              ...p.ans,
              '2': appetite - 1,
              '4': composure % 4,
              '6': appetite - 1,
              '7': surprise,
              '8': appetite - 1,
              '9': composure - 1,
              '12': surprise,
            }
          }),
        )
      }
    }
  }
  return plans
}

const moneyAnswerSets = [
  {},
  { u4: 2, u9: 1, u10: 1, u11: 3, u12: 0, u14: 1 },
  { u4: 0, u9: 3, u10: 3, u11: 2, u12: 2, u14: 3 },
]

describe('profile scoring equals the original', { timeout: 30_000 }, () => {
  it('personality, counts, horizon, risk read on every fixture and answer grid', () => {
    for (const [fixture, fixturePlan] of fixtures) {
      for (const answered of answerGrid(fixturePlan)) {
        for (const money of moneyAnswerSets) {
          const input = variant(answered, (p) => {
            p.um = {
              ...p.um,
              a: { ...p.um.a, ...money },
              chips: money.u11 === 2 ? ['None'] : p.um.chips,
            }
          })
          if (input.about.age == null) continue
          originalNormalized(input)
          const plan = ourNormalized(input)
          const answers = profileAnswers(plan)
          expect(personality(answers)?.name ?? null, fixture).toBe(
            original.personality()?.name ?? null,
          )
          expect(discoverAnswered(plan.answers)).toBe(original.discCount())
          expect(hasEnoughForPersonality(plan.answers)).toBe(original.discEnough())
          expect(profileAnswered(plan)).toBe(original.umCount())
          expect(suggestedHorizon(plan.goals, plan.about.age, plan.retireAge)).toBe(
            original.suggestU9(),
          )
          for (const id of ['2', '6', '7', '8', '9']) {
            expect(optionScore(discoverQuestion(id), plan.answers[id])).toBe(
              original.dsc(id) ?? null,
            )
          }
          expect(optionScore(moneyQuestion('u9'), plan.moneyProfile.answers.u9)).toBe(
            original.umS('u9') ?? null,
          )
          const originalCushion = plain(original.cushionM())
          for (const complete of [false, true]) {
            const read = riskRead(answers, riskContext(plan, complete, originalCushion))
            const originalRead = plain(original.riskRead(complete))
            expect(plain(asOriginalRead(read)), fixture).toEqual(originalRead)
            expect(riskLabelText(read)).toBe(original.riskLabelText(originalRead))
          }
        }
      }
    }
  }, 120_000)
})
