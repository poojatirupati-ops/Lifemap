// Ask LifeMap offers the same questions with the same answers as the ORIGINAL's askCtx()/askPlan()/
// ASK_GEN, and answers typed questions as its askMatch() does.
import { describe, expect, it, vi } from 'vitest'
import { rendered, shape } from './dom'
import { runOriginal } from '../golden/origSlice'
import { fromOriginal } from '../../src/state/migrate'
import { fixtures } from '../golden/origProfile'
import { contextTopic } from '../../src/components/ask/contextTopic'
import { matchQuestion } from '../../src/components/ask/matchQuestion'
import { planTopics } from '../../src/components/ask/planTopics'
import { GENERAL_TOPICS, type Topic } from '../../src/components/ask/topics'
import { project } from '../../src/domain/planning/project'
import { whatIfFrom } from '../../src/domain/planning/wi'

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

const original = runOriginal(
  'applyAssume, syncLists, autoSafety, askCtx, askPlan, askMatch, ASK_GEN',
)

function prepared(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  return fromOriginal<any>(structuredClone(original.getState()))
}

const topicsOf = (plan: any) => planTopics(plan, project(plan), whatIfFrom(plan.whatIf))

// the original says "this one is best covered" in Ask but "the best covered" in the explain sheet;
// we use one sentence for both
const sameStrength = (text: string) =>
  text.replace('this one is best covered', 'this one is the best covered')

const html = (node: unknown) => shape(rendered(<>{node}</>))
const ourItems = (topics: Topic[]) =>
  topics.map((topic) => [topic.key, html(topic.question), html(topic.answer)])
const theirItems = (items: string[][]) =>
  items.map(([key, question, answer]) => [key, shape(question), shape(sameStrength(answer))])

const SCREENS = [
  'DR',
  'DS',
  'HOME-0',
  'PLAN-0',
  'B1',
  'B4',
  'CALC',
  'XPL',
  'VID',
  'D1',
  'D3',
  'F1',
  'PLAN-ADD',
  'F2',
  'PLAN',
  'F4',
  'P1E',
  'P3',
  'PU',
  'HOME',
  'ME-HUB',
  'C2',
  'EXP-00',
  'XYZ',
]
const TYPED = [
  'Should I buy shares?',
  'what does 70% covered mean',
  'inflation?',
  'what is capacity',
  'my behaviour',
  'risk profile please',
  'when can I retire',
  'where is my gap',
  'my best goal',
  "I don't know my pension",
  'is my data safe',
  'can my wife join',
  'what are your fees',
  'hello there',
]

it('general and per-screen questions', () => {
  expect(ourItems(GENERAL_TOPICS)).toEqual(theirItems(original.ASK_GEN))
  for (const screen of SCREENS) {
    const ours = contextTopic(screen)
    const theirs = original.askCtx(screen)
    expect(ours ? ourItems([ours]) : null).toEqual(theirs ? theirItems([theirs]) : null)
  }
})

describe('questions about the plan', () => {
  for (const [name, state] of fixtures)
    it(name, () => {
      const plan = prepared(state)
      expect(ourItems(topicsOf(plan))).toEqual(theirItems(original.askPlan()))
    })
})

describe('typed questions', () => {
  for (const name of ['fresh.json', 'sample-plan.json'])
    it(
      name,
      () => {
        const plan = prepared(fixtures.find(([file]) => file === name)![1])
        const own = topicsOf(plan)
        for (const question of TYPED)
          expect(html(matchQuestion(question, [...own, ...GENERAL_TOPICS], plan.hasResults))).toEqual(
            shape(sameStrength(original.askMatch(question))),
          )
      },
      30000,
    )
})
