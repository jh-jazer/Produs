import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['produs-logo.png'],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Produs Productivity',
        short_name: 'Produs',
        description: 'The minimalist, high-contrast productivity tool for focused work.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'produs-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'produs-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'produs-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Habits',
            url: '/dashboard/habits',
            icons: [{ src: 'produs-logo.png', sizes: '192x192' }]
          },
          {
            name: 'Planner',
            url: '/dashboard/planner',
            icons: [{ src: 'produs-logo.png', sizes: '192x192' }]
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Exclude /api/ and /auth/ from navigation fallback to allow server-side redirects (like OAuth)
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
