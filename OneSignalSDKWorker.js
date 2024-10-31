importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";
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

// Ativar o preload de navegação, mas não usar cache.
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try {
      // Sempre tenta buscar a versão mais recente do recurso
      const networkResp = await fetch(event.request);
      return networkResp;
    } catch (error) {
      // Se falhar ao buscar na rede, retorna a página offline, se disponível
      const cache = await caches.open(CACHE);
      const cachedResp = await cache.match(offlineFallbackPage);
      return cachedResp;
    }
  })());
});
