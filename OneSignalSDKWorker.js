importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Nome do cache - embora não usemos, ainda é boa prática nomear
const CACHE_NAME = 'no-cache';

// Evento de instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado.');
  self.skipWaiting(); // Força o Service Worker a entrar em controle imediatamente
});

// Evento de ativação
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado.');
  // Remove caches antigos, mesmo que não seja usado
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Assume controle imediato
});

// Evento fetch para interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Retorna a resposta diretamente do servidor
        return response;
      })
      .catch((error) => {
        console.error('Falha ao buscar:', error);
        throw error; // Opcional: pode exibir uma mensagem de erro customizada
      })
  );
});