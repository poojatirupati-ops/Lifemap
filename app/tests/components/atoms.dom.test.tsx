// @vitest-environment jsdom
import { renderToStaticMarkup as markup } from 'react-dom/server'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'
import type { Plan } from '../../src/state/types.ts'
import FlowHead from '../../src/components/frame/FlowHead.tsx'
import TabBar from '../../src/components/frame/TabBar.tsx'
import Emo from '../../src/components/ui/Emo.tsx'
import GIcon from '../../src/components/ui/GIcon.tsx'

const setPlan = (patch: Partial<Plan>, screen = 'D0') =>
  useStore.getState().load({ ...fresh(), ...patch, screen: screen })

describe('behaviour', () => {
  it('TabBar marks the current tab and switches tabs', () => {
    setPlan({ hasResults: true, tab: 'home' })
    const { getByText } = render(<TabBar />)
    expect(getByText('Home').getAttribute('aria-current')).toBe('page')
    fireEvent.click(getByText('My Plan'))
    expect(useStore.getState().plan).toMatchObject({ tab: 'plan', planSeg: 'main' })
    expect(getByText('My Plan').className).toBe('center on')
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

  it('FlowHead back in the plan builder leaves it when no back is given', () => {
    setPlan({ inShell: true, tab: 'plan', planBuilder: true }, 'F1')
    const { getByLabelText } = render(<>{FlowHead({ eye: 'Step 2', title: 'Goals' })}</>)
    fireEvent.click(getByLabelText('Back'))
    expect(useStore.getState().plan.planBuilder).toBe(false)
  })
})
