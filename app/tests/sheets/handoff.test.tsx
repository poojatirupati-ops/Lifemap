// "Add to my plan" from a calculator says and does what the ORIGINAL's handoffHTML()/applyHandoff() do.
import { describe, expect, it, vi } from 'vitest'
import { rendered, shape } from './dom'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import type { Handoff } from '../../src/domain/calc/types'
import { applyHandoff } from '../../src/domain/goals/handoff'
import HandoffBody from '../../src/sheets/HandoffBody'
import { useStore } from '../../src/state/store'
import { fromOriginal, toOriginal } from '../../src/state/migrate'

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

const original = runOriginal('applyAssume, syncLists, handoffHTML, applyHandoff')

const GOALS: Handoff[] = [
  { kind: 'retire', name: 'Retirement', emoji: '🌅', amount: 30000.4, age: 64 },
  { kind: 'retire', name: 'Retirement', emoji: '🌅', amount: 25000, age: 99 },
  { kind: 'pension', name: 'Pension top-up', emoji: '🌅', amount: 120.5 },
  { kind: 'need', need: 'life', name: 'Life cover', emoji: '🛡️', amount: 350000 },
  { kind: 'need', need: 'ip', name: 'Income protection', emoji: '🛡️', amount: 2100 },
  { kind: 'mfree', name: 'Mortgage free', emoji: '🏦', years: 12 },
  { kind: 'safety', name: 'Emergency fund', emoji: '🪂', amount: 12000, years: 2, saved: 3000 },
  { kind: 'pot', name: 'Savings pot', emoji: '🐷', amount: 20000, years: 5 },
  {
    kind: 'spend',
    goalKind: 'home',
    name: 'First home (deposit goal)',
    emoji: '🏡',
    amount: 40000,
    years: 4,
  },
  { kind: 'spend', name: 'Car', emoji: '🚗', amount: 18000, years: 0 },
  { kind: 'blocked', message: 'Choose an inflation rate first' },
]

/** The hand-off in the original's field names. */
const asOriginal = (goal: Handoff | null) => {
  if (!goal) return null
  const { emoji, goalKind, message, ...rest } = goal
  return { ...rest, em: emoji, k: goalKind, msg: message }
}

function prepare(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  return structuredClone(original.getState())
}

describe('handoff', () => {
  for (const name of ['sample-plan.json', 'goals-set.json'])
    for (const goal of [...GOALS, null])
      it(`${goal?.kind ?? 'nothing'} ${goal?.name ?? goal?.need ?? ''} on ${name}`, () => {
        const state = prepare(fixtures.find(([file]) => file === name)![1])
        useStore.getState().load(structuredClone(state))
        const ours = shape(rendered(<HandoffBody toolId="emergency" goal={goal} />))
        const theirs = original
          .handoffHTML('emergency', asOriginal(goal))
          .replace(/<h2 class="t"/, '<h2 class="t" id="sheet-t" tabindex="-1"')
        expect(ours).toEqual(shape(theirs))
        if (!goal || goal.kind === 'blocked') return

        const plan: any = fromOriginal(structuredClone(state))
        const message = applyHandoff(plan, goal)
        original.setState(structuredClone(state))
        expect(message).toBe(original.applyHandoff(asOriginal(goal)))
        const after = original.getState()
        const pick = (p: any) => ({
          goals: p.goals,
          gid: p.gid,
          retireAge: p.retireAge,
          retireSet: p.retireSet,
          penExtra: p.penExtra,
          needs: p.needs,
          src: p.src,
        })
        expect(pick(toOriginal(plan))).toEqual(pick(after))
      })
})
