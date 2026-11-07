// "What your plan assumes" must list the same rows as the ORIGINAL's assumeRows(), run in node:vm.
import { describe, expect, it, vi } from 'vitest'
import { runOriginal } from '../golden/origSlice'
import { fromOriginal } from '../../src/state/migrate'
import { fixtures } from '../golden/origProfile'
import { planAssumptions } from '../../src/domain/planning/assumptions/rows'
import { prepared as preparedBy } from '../golden/helpers'

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

const original = runOriginal('applyAssume, syncLists, autoSafety, assumeRows, planReady')

const prepared = (state: any) => fromOriginal<any>(preparedBy(original, state))

describe('planAssumptions', () => {
  for (const [name, state] of fixtures)
    it(name, () => {
      const plan = prepared(state)
      const theirs = original
        .assumeRows()
        .map((row: string[]) => [row[0], row[1], row[2], row[3] ?? ''])
      const ours = planAssumptions(plan, original.planReady()).map((row) => [
        row.label,
        row.value,
        row.tag,
        row.note ?? '',
      ])
      expect(ours).toEqual(theirs)
    })
})
