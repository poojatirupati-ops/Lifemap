// The discovery data must equal the ORIGINAL script's constants, run in node:vm, under our field names.
import { describe, expect, it } from 'vitest'
import { runOriginal } from './origSlice'
import {
  CHAPTERS,
  DISCOVER_QUESTIONS,
  DISCOVER_SIX,
  MONEY_PROFILE,
} from '../../src/domain/discovery/questions.data'
import { PROFILE_SECTIONS, TERMS } from '../../src/domain/discovery/terms.data'
import { GOAL_CATEGORIES, OTHER_GOALS, suggestedGoals } from '../../src/domain/discovery/goals.data'

const original = runOriginal(
  'CHAPTERS, DQ, DISC6, TERMS, SECT, SECT_IC, UM, SECQ, GOALCAT, OTHER_LIST, SUGGEST',
)
const plain = (x: unknown) => JSON.parse(JSON.stringify(x))

// Our data in the original's shape.
const option = ({ emoji, text, score, ...rest }: any) => ({
  ...rest,
  e: emoji,
  t: text,
  s: score,
})
const discover = ({ chapter, title, subtitle, options, section: _shownLater, ...rest }: any) => ({
  ...rest,
  act: chapter,
  q: title,
  sub: subtitle,
  o: options.map(option),
})
const money = (q: any) =>
  typeof q === 'string'
    ? { d: q }
    : {
        u: q.id,
        sec: q.section,
        q: q.title,
        help: q.help,
        panel: q.panel,
        chips: q.chips,
        o: q.options.map(option),
      }
const step = (s: any) => ({
  n: s.step,
  t: s.title,
  term: s.term,
  plain: s.plain,
  e: s.emoji,
  intro: s.intro,
  qs: s.questions.map(money),
})
const category = (c: any) => ({
  k: c.key,
  t: c.title,
  e: c.emoji,
  amt: c.amount,
  yrs: c.years ?? undefined,
  kind: c.kind,
  spec: c.specialist,
})
// the original's Q2 and Q4 options carry an unused w; scoring reads PW
const withoutW = (questions: any[]) =>
  plain(questions).map((q: any) => ({ ...q, o: q.o.map(({ w: _unused, ...o }: any) => o) }))

describe('discovery data equals the original', () => {
  it('questions', () => {
    expect(CHAPTERS).toEqual(plain(original.CHAPTERS))
    expect(plain(DISCOVER_QUESTIONS.map(discover))).toEqual(withoutW(original.DQ))
    expect(plain(DISCOVER_SIX.map(discover))).toEqual(withoutW(original.DISC6))
    expect(plain(MONEY_PROFILE.map(step))).toEqual(plain(original.UM))
    expect(Object.fromEntries(DISCOVER_QUESTIONS.map((q) => [q.id, q.section]))).toEqual(
      plain(original.SECQ),
    )
  })
  it('terms', () => {
    expect(TERMS).toEqual(plain(original.TERMS))
    const sections = Object.entries(PROFILE_SECTIONS)
    expect(Object.fromEntries(sections.map(([k, s]) => [k, [s.title, s.plain]]))).toEqual(
      plain(original.SECT),
    )
    expect(Object.fromEntries(sections.map(([k, s]) => [k, s.icon]))).toEqual(
      plain(original.SECT_IC),
    )
  })
  it('goals', () => {
    // the original's unit and legacy age are read by no screen here
    const used = plain(original.GOALCAT).map(({ unit: _u, age: _a, ...c }: any) => c)
    expect(plain(GOAL_CATEGORIES.map(category))).toEqual(used)
    expect(OTHER_GOALS.map((g) => [g.emoji, g.name, g.amount, g.years])).toEqual(
      plain(original.OTHER_LIST),
    )
    for (const age of [18, 34, 35, 44, 45, 54, 55, 80])
      expect(suggestedGoals(age)).toEqual(original.SUGGEST(age))
  })
})
