importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-cache-v4";
const offlineFallbackPage = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.add(offlineFallbackPage);
    })
  );
  self.skipWaiting(); // Garante que o novo SW seja ativado imediatamente
});

// Limpa caches antigos ao ativar um novo SW
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

      // Atualiza os clientes imediatamente
      await self.clients.claim();
    })()
  );
});

// Comunicação com o frontend para forçar atualização
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Habilita preload se suportado
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Intercepta requisições
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Força atualização imediata do HTML
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(async () => {
        const cache = await caches.open(CACHE);
        return cache.match(offlineFallbackPage);
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone()); // Atualiza o cache
        return response;
      } catch (error) {
        return cache.match(event.request) || fetch(event.request);
      }
    })
  );
});

// Intercepta requisições de navegação para controlar o histórico
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Para navegação, sempre força busca da rede para garantir versão atualizada
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          // Clona a resposta para poder usar no cache
          const responseClone = response.clone();
          
          // Adiciona no cache para uso offline
          caches.open(CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          
          return response;
        })
        .catch(async () => {
          // Se offline, busca no cache
          const cache = await caches.open(CACHE);
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fallback para página offline
          return cache.match(offlineFallbackPage);
        })
    );
    return;
  }

  // Para outros recursos (CSS, JS, imagens), usa a estratégia existente
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        return cache.match(event.request) || fetch(event.request);
      }
    })
  );
});