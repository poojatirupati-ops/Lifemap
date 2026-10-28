import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { proxy: { '/api': 'http://localhost:8787', '/health': 'http://localhost:8787' } },
  test: { setupFiles: ['src/legacy/test/setup.ts'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
