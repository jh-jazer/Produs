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
      registerType: 'autoUpdate',
      includeAssets: ['produs-logo.png'],
      manifest: {
        name: 'Produs',
        short_name: 'Produs',
        description: 'Produs - The Minimalist Productivity Tool',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
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
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
