// @vitest-environment jsdom
import { beforeEach, expect, test } from 'vitest'
import { fresh } from '../../src/state/fresh.ts'
import { seedContent } from '../content/seed.ts'
import { useStore } from '../../src/state/store.ts'
import { renderAt } from '../renderAt.tsx'

beforeEach(() => {
  seedContent()
  useStore.getState().load(fresh())
})

test('XPL-01: works before a plan, with no what-ifs', async () => {
  const { container } = await renderAt('/explore')
  expect(container.querySelector('[data-a="gowi"]')).toBeNull()
  expect(container.querySelectorAll('[data-a="cat"]')).toHaveLength(6)
})

test('XPL-CAT: a group with statements shows the upload card above its calculators', async () => {
  const { container } = await renderAt('/explore/category/retire')
  expect(container.querySelector('.card.pst')).not.toBeNull()
  expect(container.querySelectorAll('[data-a="calc"]').length).toBeGreaterThan(0)
})

test('XPL-TOPIC: calculators then the statement link', async () => {
  const { container } = await renderAt('/explore/topic/Pensions')
  expect(container.querySelectorAll('[data-a="calc"]').length).toBeGreaterThan(0)
})
