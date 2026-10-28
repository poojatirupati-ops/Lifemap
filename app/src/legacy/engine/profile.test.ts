import { expect, test } from 'vitest'
import { DISCOVER } from '../content/discover.data.ts'
import { MONEY } from '../content/moneyProfile.data.ts'
import { myTerms, personality, QUESTIONS, riskProfile } from './profile.ts'

test('each Discover option maps to its tag', () => {
  const tags = DISCOVER.map(q => [q.id, q.o.map(o => o.tag)])
  expect(tags).toEqual([
    ['q2', ['The Budgeter', 'Money Vigilant', 'The Opportunist', 'The Money Monk']],
    ['q4', ['FOMO · Herd behaviour', 'Due diligence', 'Advice-seeker', 'Loss aversion']],
    ['q7', ['Emergency fund', 'Thin buffer', 'Relies on credit', 'No safety net']],
    ['q8', ['Low risk', 'Cautious', 'Balanced', 'High risk']],
    ['q9', ['Panic selling', 'Anchoring', 'Long-term investor', 'Buy the dip']],
    ['q12', ['Financial anxiety', 'Cautious optimism', 'Financially confident', 'Money avoidance']],
  ])
  expect(DISCOVER.every(q => q.o.every(o => o.line))).toBe(true)
})

test('asked once: 13 unique question ids', () => {
  const ids = QUESTIONS.map(q => q.id)
  expect(new Set(ids).size).toBe(13)
  expect(DISCOVER.length + MONEY.length).toBe(13)
})

test('profile scoring on 4 answer sets', () => {
  // 1. Budgeter, steady, thin cushion, motorway: Achiever, Cautious
  const a1 = { q2: 0, q4: 1, q7: 0, q8: 0, q9: 2, q12: 2 }
  expect(personality(a1)?.name).toBe('Achiever')
  expect(riskProfile(a1).label).toBe('Cautious')
  // 2. Opportunist wanting growth but relying on credit: want capped by can afford, mismatch note
  const a2 = { q2: 2, q4: 0, q7: 2, q8: 3, q9: 3, q12: 1 }
  const r2 = riskProfile(a2)
  expect(personality(a2)?.name).toBe('Explorer')
  expect(r2.want).toBe(5) // Healy Pass, plus one for buying the dip
  expect(r2.can).toBe(2)
  expect(r2.label).toBe('Cautious–balanced')
  expect(r2.limit).toBe('can')
  expect(r2.mis).toContain('emergency fund is thin')
  // 3. Full answers, ready and able: Growth, no cap from horizon or experience
  const a3 = { q2: 2, q4: 1, q7: 0, q8: 3, q9: 3, q12: 2, u9: 3, u10: 3, u11: 2, u12: 3, u14: 3, q6: 3, u4: 1 }
  const r3 = riskProfile(a3, { chips: ['Shares or funds'] })
  expect(r3.label).toBe('Growth')
  expect(r3.provisional).toBe(false)
  // 4. Money Monk who avoids money, panics, short horizon: Cautious, personality Contented
  const a4 = { q2: 3, q4: 3, q7: 3, q8: 1, q9: 0, q12: 3, u9: 0, u10: 0, u11: 0, u12: 0, u14: 0 }
  const r4 = riskProfile(a4)
  expect(personality(a4)?.name).toBe('Contented')
  expect(r4.label).toBe('Cautious')
  expect(r4.mis).toContain('emergency fund')
})

test('no type or profile is guessed from too little', () => {
  expect(personality({ q2: 0, q4: 1 })).toBeNull()
  expect(riskProfile({ q2: 0 }).label).toBeNull()
})

test('own terms include behaviour traits', () => {
  const t = [...myTerms({ q2: 0, q4: 0, u4: 3, u11: 3 })]
  expect(t.map(x => x.tag)).toEqual(['The Budgeter', 'FOMO · Herd behaviour', 'Procrastination · Status quo bias', 'Overconfidence bias'])
})

const FULL = { q2: 2, q4: 1, q7: 0, q8: 3, q9: 3, q12: 2, u9: 3, u10: 3, u11: 2, u12: 3, u14: 3, q6: 3, u4: 1 }
const misOf = (a: object, o = {}) => riskProfile({ ...FULL, ...a }, o).mis!

test('half-answered money profile stays provisional', () => {
  const r = riskProfile({ q8: 3, q9: 3, q7: 0, u10: 3, u11: 2, u9: 3 }, { chips: ['Shares or funds'] })
  expect(r.provisional).toBe(true)
  expect(riskProfile(FULL, { chips: ['Shares or funds'] }).provisional).toBe(false)
})

test('invalid option indexes are ignored, never thrown', () => {
  expect(personality({ q2: 9, q4: 1, q7: 0, q8: 0 })).toBeNull()
  expect(() => personality({ q2: -1, q4: 1.5, q7: 0, q8: 0, q9: 2, q12: 2 })).not.toThrow()
  const r = riskProfile({ q8: 2, q9: 2, u9: 9 })
  expect(r.want).not.toBeNull()
  expect(r.time).toBe(5) // bad u9 falls back to the horizon argument
  expect([...myTerms({ q2: 9, q4: 0 })].map(t => t.tag)).toEqual(['FOMO · Herd behaviour'])
})

test('comfort comes from Q8 alone', () => {
  expect(riskProfile({ q8: 2 }).comfort).toBe('Balanced')
})

test('mismatch keys', () => {
  expect(misOf({ q8: 0, q9: 0, q7: 1 })).toContain('emergency fund often comes first') // K16
  expect(misOf({ q7: 1 })).toContain('emergency fund is thin') // K14c
  expect(misOf({ u12: 0 })).toContain('hit everyday life') // K14l
  expect(misOf({ u9: 0 })).toContain('within 5 years') // K14t
  expect(misOf({ q9: 1 })).toContain('falls may unsettle you') // K13
  expect(misOf({ q8: 1, q9: 3 })).toContain('could handle more') // K15
  expect(misOf({})).toContain('growth conversation') // K17
  expect(misOf({ u11: 3 }, { chips: ['Shares or funds'] })).toContain('broadly in line') // expert never K17
  expect(misOf({ q8: 1, q9: 2, u14: 1 })).toContain('broadly in line')
})

test('caps: horizon fallback, self-rated expert, chips, experience note', () => {
  expect(riskProfile({ q8: 3, q9: 3 }, { horizon: 0 }).time).toBe(1)
  expect(riskProfile({ q8: 3, q9: 3 }).time).toBe(5)
  expect(riskProfile(FULL, { chips: ['Savings account'] }).level).toBe(4) // expert self-rating, only savings held
  expect(riskProfile(FULL, { chips: ['Shares or funds'] }).level).toBe(5)
  const novice = riskProfile({ ...FULL, u11: 0 })
  expect(novice).toMatchObject({ level: 3, limit: 'experience', keNote: true })
  expect(riskProfile(FULL, { chips: ['None'] })).toMatchObject({ level: 4, limit: 'experience', keNote: false }) // chips cap at 4: not a beginner, no beginner copy
  expect(riskProfile({ ...FULL, u11: 1 })).toMatchObject({ level: 4, limit: 'experience', keNote: false }) // 'Basics'
  expect(riskProfile({ ...FULL, u11: 0, u10: 0 }).keNote).toBe(false)
})

test('personality tie-breaks', () => {
  // A and E tied at 2: q2 Budgeter (A) wins
  expect(personality({ q2: 0, q4: 0, q7: 1, q8: 3 })?.key).toBe('A')
  // A and E tied at 2: q2 answer is E, which beats the B,A,C,E order that would give A
  expect(personality({ q2: 2, q4: 1, q7: 0, q8: 1 })?.key).toBe('E')
  // q2 unanswered, B and E tied: q4 alone points at E, order would give B
  expect(personality({ q4: 0, q8: 0, q9: 0, q12: 1 })?.key).toBe('E')
  // B and C tied, neither q2 nor q4 decides: ORDER gives B
  expect(personality({ q7: 0, q8: 0, q9: 0, q12: 1, u4: 3 })?.key).toBe('B')
})
