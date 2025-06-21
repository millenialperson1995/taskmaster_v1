// Importações do Workbox para o cache de arquivos (PWA offline)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Este array é injetado automaticamente pelo vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Cache de fontes do Google
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com', 
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

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