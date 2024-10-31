importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// nome do cache, altere quando houver alterações nos arquivos
const CACHE_NAME = 'pwa-cache-v1.1'; 
const RESOURCES_TO_CACHE = [
    '/',
    '/index.html',
    '/home.html',
    '/css/index.css',
    '/css/detalhes.css',
    '/css/carrinho.css',
    '/js/routes.js',
    '/js/funcoes.js',
];

// Evento de instalação
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(RESOURCES_TO_CACHE);
        })
    );
});

// Evento de ativação
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Remove caches antigos
                    }
                })
            );
        })
    );
});

// Evento de fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone()); // Atualiza o cache com a nova resposta
                    return response;
                });
            });
        })
    );
});

// Listener para mensagens de atualização
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting(); // Força a ativação do novo Service Worker
    }
});