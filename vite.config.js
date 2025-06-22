import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// O manifesto agora está simplificado para usar apenas o ícone SVG.
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
      src: 'checklist.svg',
      sizes: 'any',
      type: 'image/svg+xml',
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