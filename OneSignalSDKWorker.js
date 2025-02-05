importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-cache-v4"; // Alterado para forçar atualização
const ASSETS = [
  "/",
  "/img/logo.png",
  "offline.html"
];

self.addEventListener("install", async (event) => {
  self.skipWaiting(); // Ativa a nova versão do SW imediatamente
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Limpa caches antigos ao ativar um novo SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Intercepta requisições para servir do cache sempre que possível
self.addEventListener("fetch", (event) => {
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(event.request, response.clone()); // Salva a nova versão no cache
            return response;
          });
        });
      })
    );
    return;
  }

  // Mantém o fallback para páginas offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;
          if (preloadResp) return preloadResp;
          return await fetch(event.request);
        } catch (error) {
          const cache = await caches.open(CACHE);
          return await cache.match("offline.html");
        }
      })()
    );
  }
});
