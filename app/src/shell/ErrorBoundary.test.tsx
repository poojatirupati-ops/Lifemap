// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary.tsx'

test('a crashing screen shows the calm fallback instead of a blank app', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const Crash = () => {
    throw new Error('boom')
  }
  render(
    <ErrorBoundary>
      <Crash />
    </ErrorBoundary>,
  )
  expect(screen.getByRole('alert').textContent).toContain('Your plan is safe')
})
