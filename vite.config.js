import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // MODIFICADO: Alterado para 'injectManifest' para usar um service worker customizado
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      // ADICIONADO: Caminho para o nosso novo service worker
      srcDir: 'src',
      filename: 'service-worker.js',
      
      manifest: {
        name: 'TaskMaster',
        short_name: 'TaskMaster',
        description: 'Organize seu dia, conquiste suas metas.',
        theme_color: '#1e293b',
        background_color: '#f1f5f9',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
      },
    }),
  ],
})