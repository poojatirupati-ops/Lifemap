import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // hidden: maps are built for private upload (error tracking) but no bundle points at them; sst.config.ts keeps them out of the site
  build: { sourcemap: 'hidden' },
  server: { proxy: { '/api': 'http://localhost:8787', '/health': 'http://localhost:8787' } },
  test: {
    setupFiles: ['src/test/setup.ts'],
    // the persistent module cache keeps a stale import.meta.glob, so new sheets render as placeholders
    fsModuleCache: false,
    exclude: ['**/node_modules/**', 'tests/e2e/**'], // tests/e2e is Playwright
    // golden tests run the original in node:vm and are slow under load
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  plugins: [
    // file-based routes in src/routes; must come before react()
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    VitePWA({
      registerType: 'prompt', // shell/UpdatePrompt.tsx asks before reloading into a new version
      // API calls (export, plan) must reach the server, never the cached app shell
      workbox: { navigateFallbackDenylist: [/^\/api\//, /^\/health$/] },
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'LifeMap',
        short_name: 'LifeMap',
        description: "The life you'd like, mapped out. A life map that guides you, step by step.",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#182A54',
        theme_color: '#182A54',
        lang: 'en-IE',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
