// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import sample from '../fixtures/sample-me.json'
import RequiredChoices from '../../src/components/finance/RequiredChoices.tsx'
import CalcAssumptions from '../../src/components/calc/CalcAssumptions.tsx'
import { ASSUMPTIONS } from '../../src/domain/planning/assumptionFields.data.ts'

beforeEach(() => useStore.getState().load(structuredClone(sample) as unknown as Snapshot))

test('step 7 lists every Your assumptions field; a change is counted and drives the plan', () => {
  const { container } = render(<RequiredChoices />)
  const rest = container.querySelector('#p4-rest')!
  const keys = [...rest.querySelectorAll('.asmf')].map((el) => el.getAttribute('data-k'))
  expect(keys).toEqual(Object.keys(ASSUMPTIONS))
  const changed = () => Number(/You have changed (\d+)/.exec(rest.textContent!)?.[1] ?? 0)
  const before = changed()
  fireEvent.click(rest.querySelector('[data-p="bands|flat"]')!)
  expect(useStore.getState().plan.assumptions.bands).toBe('flat')
  expect(changed()).toBe(before + 1)
})

test('the last-money tool asks for the plan-until age with the other assumptions', () => {
  const { container } = render(<CalcAssumptions toolId="lastmoney" />)
  const keys = [...container.querySelectorAll('.asmf')].map((el) => el.getAttribute('data-k'))
  expect(keys).toEqual(['ddTiming', 'planEnd'])
})
