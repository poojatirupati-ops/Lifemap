// "Add to my plan" from a calculator says and does what the ORIGINAL's handoffHTML()/applyHandoff() do.
import { describe, expect, it } from 'vitest'
import { rendered, shape } from './dom'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import type { Handoff } from '../../src/components/calc/types'
import { applyHandoff } from '../../src/sheets/handoff'
import HandoffBody from '../../src/sheets/HandoffBody'
import { useStore } from '../../src/state/store'

const original = runOriginal('applyAssume, syncLists, handoffHTML, applyHandoff')

const GOALS: Handoff[] = [
  { kind: 'retire', name: 'Retirement', em: '🌅', amount: 30000.4, age: 64 },
  { kind: 'retire', name: 'Retirement', em: '🌅', amount: 25000, age: 99 },
  { kind: 'pension', name: 'Pension top-up', em: '🌅', amount: 120.5 },
  { kind: 'need', need: 'life', name: 'Life cover', em: '🛡️', amount: 350000 },
  { kind: 'need', need: 'ip', name: 'Income protection', em: '🛡️', amount: 2100 },
  { kind: 'mfree', name: 'Mortgage free', em: '🏦', years: 12 },
  { kind: 'safety', name: 'Emergency fund', em: '🪂', amount: 12000, years: 2, saved: 3000 },
  { kind: 'pot', name: 'Savings pot', em: '🐷', amount: 20000, years: 5 },
  {
    kind: 'spend',
    k: 'home',
    name: 'First home (deposit goal)',
    em: '🏡',
    amount: 40000,
    years: 4,
  },
  { kind: 'spend', name: 'Car', em: '🚗', amount: 18000, years: 0 },
  { kind: 'blocked', msg: 'Choose an inflation rate first' },
]

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
          .handoffHTML('emergency', goal)
          .replace(/<h2 class="t"/, '<h2 class="t" id="sheet-t" tabindex="-1"')
        expect(ours).toEqual(shape(theirs))
        if (!goal || goal.kind === 'blocked') return

        const plan = structuredClone(state)
        const message = applyHandoff(plan, goal)
        original.setState(structuredClone(state))
        expect(message).toBe(original.applyHandoff(goal))
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
        expect(pick(plan)).toEqual(pick(after))
      })
})
