import { createRoot } from 'react-dom/client'
import './fonts.css' // self-hosted Inter + JetBrains Mono (no Google Fonts)
import App from './shell/App.tsx'
import './lib/lmTestHook.ts' // window.__lm for tools/view-equal.mjs (localhost + lm-test-auth only)

// No StrictMode: the original runs each render side effect once, and the equality tools compare against that.
createRoot(document.getElementById('root')!).render(<App />)
