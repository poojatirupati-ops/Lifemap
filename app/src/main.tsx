import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { z } from 'zod'
import './fonts.css' // self-hosted Inter + JetBrains Mono (no Google Fonts)
import { appRouter } from './shell/appRouter.ts'
import { queryClient } from './auth/planSync.ts'

// zod's JIT uses Function(), which the CSP blocks; the interpreted path is fine for our small schemas
z.config({ jitless: true })

// No StrictMode: the original runs each render side effect once, and the equality tools compare against that.
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={appRouter} />
  </QueryClientProvider>,
)
