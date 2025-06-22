import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Para melhor organização, a configuração do Manifesto do PWA foi extraída.
const pwaManifest = {
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
      src: 'checklist.svg',    // Seu logo SVG. Navegadores modernos o usarão.
      sizes: 'any',            // 'any' é usado para SVGs, pois são escaláveis.
      type: 'image/svg+xml',
    },
    {
      src: 'pwa-192x192.png',   // Fallback para dispositivos que não suportam ícones SVG no manifesto.
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png',   // Fallback em alta resolução.
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'apple-touch-icon.png', // Ícone específico para dispositivos Apple.
      sizes: '180x180',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png',   // Ícone "maskable" para se adaptar a diferentes formatos no Android.
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    }
  ],
};

// Configuração principal do Vite
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'service-worker.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: pwaManifest,
    }),
  ],
});