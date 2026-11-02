// @vitest-environment jsdom
import { renderToStaticMarkup as markup } from 'react-dom/server'
import { act, fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'
import type { Plan } from '../../src/state/types.ts'
import { path, renderAt, settle } from '../renderAt.tsx'
import Emo from '../../src/components/ui/Emo.tsx'
import GIcon from '../../src/components/ui/GIcon.tsx'

const setPlan = (patch: Partial<Plan>) => useStore.getState().load({ ...fresh(), ...patch })

describe('behaviour', () => {
  it('TabBar marks the current tab and switches tabs', async () => {
    setPlan({ onboarded: true })
    await renderAt('/home')
    const { getByText } = within(screen.getByRole('navigation', { name: 'Main' }))
    expect(getByText('Home').getAttribute('aria-current')).toBe('page')
    await act(async () => fireEvent.click(getByText('My Plan')))
    await settle()
    expect([path(), useStore.getState().planScrollTo]).toEqual(['/plan', 'timeline'])
    expect(
      within(screen.getByRole('navigation', { name: 'Main' })).getByText('My Plan').className,
    ).toBe('center on')
  })

  it('Emo hides emoji from the accessible name, but never all of it', () => {
    expect(
      markup(
        <b>
          <Emo>{'🏡 Buy a home'}</Emo>
        </b>,
      ),
    ).toBe('<b><span aria-hidden="true">🏡</span> Buy a home</b>')
    expect(
      markup(
        <b>
          <Emo>{'🏡'}</Emo>
        </b>,
      ),
    ).toBe('<b>🏡</b>')
  })

  it('GIcon swaps a goal emoji for its line icon', () => {
    const goal = markup(<GIcon emoji="🏡" className="e" />)
    expect(goal).toMatch(/^<span class="e gix"><svg [^>]*class="gi"/)
    expect(markup(<GIcon emoji="🦄" className="e" />)).toBe('<span class="e">🦄</span>')
  })

  it("the plan builder's Back leaves it when the step has no back of its own", async () => {
    setPlan({})
    await renderAt('/build/about')
    await act(async () => fireEvent.click(screen.getByLabelText('Back')))
    await settle()
    expect([useStore.getState().planBuilder, path()]).toEqual([false, '/plan'])
  })
})
