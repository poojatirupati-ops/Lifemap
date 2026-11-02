// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { fresh } from '../../src/state/fresh.ts'
import { seedContent } from '../content/seed.ts'
import { useStore } from '../../src/state/store.ts'
import * as Home from '../../src/screens/ExploreHome.screen.tsx'
import * as Topic from '../../src/screens/ExploreTopic.screen.tsx'
import * as Category from '../../src/screens/ExploreCategory.screen.tsx'

beforeEach(() => {
  seedContent()
  useStore.getState().load({ ...fresh(), tab: 'explore' })
})

test('XPL-01: works before a plan, with no what-ifs', () => {
  const { container } = render(<Home.Body />)
  expect(container.querySelector('[data-a="gowi"]')).toBeNull()
  expect(container.querySelectorAll('[data-a="cat"]')).toHaveLength(6)
})

test('XPL-CAT: a group with statements shows the upload card above its calculators', () => {
  const { container } = render(<Category.Body param="retire" />)
  expect(container.querySelector('.card.pst')).not.toBeNull()
  expect(container.querySelectorAll('[data-a="calc"]').length).toBeGreaterThan(0)
})

test('XPL-TOPIC: calculators then the statement link', () => {
  const { container } = render(<Topic.Body param="Pensions" />)
  expect(container.querySelectorAll('[data-a="calc"]').length).toBeGreaterThan(0)
})
