import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

afterEach(cleanup)
// After the test file's vi.mock calls: the route tree imports the modules they replace. DOM tests only (the router reads self).
beforeAll(async () => {
  if (typeof self !== 'undefined') await import('../shell/appRouter.ts')
})
