importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-cache-v5"; // Atualizei versão
const offlineFallbackPage = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      // Garante que a página offline está sempre no cache
      return cache.add(offlineFallbackPage);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches antigos
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map((cacheName) => {
          if (cacheName !== CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Habilita preload se suportado
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Função para fetch com timeout
function fetchWithTimeout(request, timeout = 4000) {
  return Promise.race([
    fetch(request, { cache: "no-store" }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Intercepta requisições
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Tenta buscar online com timeout de 4 segundos
          const response = await fetchWithTimeout(event.request, 4000);
          return response;
        } catch (error) {
          // Se falhou (offline ou timeout), mostra página offline
          console.log("SW: Network failed, showing offline page");
          const cache = await caches.open(CACHE);
          const offlineResponse = await cache.match(offlineFallbackPage);
          
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Fallback final - tenta cache da página atual
          return cache.match(event.request) || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Para outras requisições (CSS, JS, imagens, etc.)
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const response = await fetchWithTimeout(event.request, 3000);
        
        // Só faz cache de requisições GET bem-sucedidas
        if (event.request.method === 'GET' && response && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Se falhou, tenta buscar no cache
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Se não tem no cache, deixa falhar
        throw error;
      }
    })
  );
});