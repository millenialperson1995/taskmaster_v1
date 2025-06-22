// src/service-worker.js

// Importações do Workbox para o cache de arquivos (PWA offline)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// Este array é injetado automaticamente pelo vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Cache de fontes do Google
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// --- INÍCIO DA CORREÇÃO ---
// Adiciona uma estratégia de cache para as chamadas da API do Appwrite.
// Use a URL do seu endpoint do Appwrite aqui.
// O padrão para a cloud é 'https://cloud.appwrite.io/v1/'.
const appwriteEndpoint = 'https://cloud.appwrite.io/v1/';

registerRoute(
  ({ url }) => url.href.startsWith(appwriteEndpoint),
  new NetworkFirst({
    cacheName: 'appwrite-api-cache',
    plugins: [
      {
        // Garante que apenas respostas bem-sucedidas (status 2xx) sejam cacheadas.
        cacheWillUpdate: async ({ response }) => {
          if (response && response.status >= 200 && response.status < 300) {
            return response;
          }
          // Retorna null para não cachear respostas de erro.
          return null;
        },
      },
    ],
  })
);
// --- FIM DA CORREÇÃO ---


// Lógica para Notificações Push
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || "TaskMaster";

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png', // Ícone da notificação
    badge: '/checklist.svg',   // Ícone para a barra de status (Android)
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Lógica para clique na notificação (opcional, mas recomendado)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/') // Corrigido aqui
  );
});