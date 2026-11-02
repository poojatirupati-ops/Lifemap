import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './fonts.css' // self-hosted Inter + JetBrains Mono (no Google Fonts)
import App from './shell/App.tsx'
import { queryClient } from './auth/planSync.ts'

// No StrictMode: the original runs each render side effect once, and the equality tools compare against that.
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
