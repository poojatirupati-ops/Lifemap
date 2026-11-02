// Each converted sheet renders the same DOM as the ORIGINAL's sheetHTML() for the same plan.
import { describe, expect, it, vi } from 'vitest'
import { rendered, shape } from './dom'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import SheetHost from '../../src/shell/SheetHost'
import { useStore } from '../../src/state/store'

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

const original = runOriginal('applyAssume, syncLists, autoSafety, sheetHTML')

function theirs(state: any, sheet: string, screenId = '') {
  original.setState({ ...structuredClone(state), sheet })
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  return shape(original.sheetHTML(screenId))
}

// Radix's Dialog adds pointer-events to the shell (R-05's SheetFrame); the bodies are what this compares
const withoutRadixStyle = (lines: string[]) =>
  lines.map((line) => line.replace(' style=pointer-events: auto;', ''))

function ours(state: any, sheet: string) {
  useStore.getState().load({ ...structuredClone(state), sheet })
  return withoutRadixStyle(shape(rendered(<SheetHost />)))
}

// TODO(R-31): settings.ts quotes the 2026 exit tax for every plan year (see assumptions.golden.test.ts)
const maskExitTax = (lines: string[]) =>
  lines.map((line) => line.replace(/ less \d+% exit tax/, ''))

const fixture = (name: string) => fixtures.find(([file]) => file === name)![1]

// whyask and save carry the sign-in copy (the login-wall cards changed it on purpose), so they differ
const SIMPLE = ['money', 'invite', 'delete', 'history', 'profile', 'other']
const WITH_PLAN = [
  'assume',
  'explain|str',
  'explain|gap',
  'explain|dec',
  'fnd|0',
  'fnd|1',
  'fnd|2',
  'fnd|3',
  'fnd|4',
  'xpert|mortgage',
  'xpert|pension',
  'ex|income',
  'ex|pens.monthly',
  'gate|report',
  'calcadd|emergency',
  'calcadd|debtpay',
  'elig',
]

describe('sheets equal the original', () => {
  for (const name of ['fresh.json', 'sample-plan.json', 'finances-partial.json'])
    for (const sheet of [...SIMPLE, ...WITH_PLAN]) {
      // the findings need goals: explain only opens from results
      if (sheet.startsWith('explain') && name === 'fresh.json') continue
      it(`${sheet} on ${name}`, () => {
        const state = fixture(name)
        expect(maskExitTax(ours(state, sheet))).toEqual(maskExitTax(theirs(state, sheet)))
      })
    }
})
