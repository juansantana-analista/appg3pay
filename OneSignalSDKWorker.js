importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// This is the "Offline page" service worker
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "ToDo-replace-this-name.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
    event.respondWith((async () => {
      try {
        // Sempre tente buscar da rede
        const networkResponse = await fetch(event.request);
  
        // Se a resposta for bem-sucedida, retorne-a
        if (networkResponse.ok) {
          return networkResponse;
        } else {
          // Se houver um erro, você pode optar por retornar uma página offline
          const cache = await caches.open(CACHE);
          const cachedResp = await cache.match(offlineFallbackPage);
          return cachedResp;
        }
      } catch (error) {
        // Se a requisição falhar, tente retornar a página offline
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  });