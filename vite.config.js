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
      src: 'pwa-192x192.png', // Lembre-se de colocar este arquivo na pasta `public`
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png', // Lembre-se de colocar este arquivo na pasta `public`
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png', // Ícone "maskable" para melhor adaptação em diferentes formatos de ícones no Android
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

// Configuração principal do Vite
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // A estratégia 'injectManifest' é usada para injetar o precache manifest
      // em um service worker customizado, permitindo lógica personalizada.
      strategies: 'injectManifest',

      // Define o tipo de registro do service worker para se atualizar automaticamente
      // quando uma nova versão estiver disponível.
      registerType: 'autoUpdate',

      // Caminho para o seu service worker customizado.
      srcDir: 'src',
      filename: 'service-worker.js',

      // Define os padrões de arquivos a serem incluídos no precache.
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },

      // Usa a constante do manifesto definida acima.
      manifest: pwaManifest,
    }),
  ],
});