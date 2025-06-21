import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // ADICIONADO

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // ADICIONADO: Bloco de configuração do PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'checklist.svg'],
      manifest: {
        name: 'TaskMaster',
        short_name: 'TaskMaster',
        description: 'Organize seu dia, conquiste suas metas.',
        theme_color: '#1e293b', // Cor do tema escuro
        background_color: '#f1f5f9', // Cor de fundo claro
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // Você precisa criar este ícone
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Você precisa criar este ícone
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Ícone "mascarável"
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
      },
    }),
  ],
})