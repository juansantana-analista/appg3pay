importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'pwa-cache-v2'; // Altere a versão aqui sempre que modificar os arquivos
const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
];

// A função utilitária para corrigir URLs de requisições interceptadas
const getFixedUrl = (req) => {
    var now = Date.now();
    var url = new URL(req.url);
    url.protocol = self.location.protocol;

    if (url.hostname === self.location.hostname) {
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
    }
    return url.href;
};

// Evento de instalação
self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting()); // Faz com que o novo Service Worker ative imediatamente
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
        }).then(() => {
            return self.clients.claim(); // Faz com que o novo Service Worker controle todos os clientes
        })
    );
});

// Evento de fetch
self.addEventListener('fetch', event => {
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        const cached = caches.match(event.request);
        const fixedUrl = getFixedUrl(event.request);
        const fetched = fetch(fixedUrl, { cache: 'no-store' });
        const fetchedCopy = fetched.then(resp => resp.clone());

        event.respondWith(
            Promise.race([fetched.catch(_ => cached), cached])
                .then(resp => resp || fetched)
                .catch(_ => { /* ignore errors */ })
        );

        event.waitUntil(
            Promise.all([fetchedCopy, caches.open(CACHE_NAME)]) // Use CACHE_NAME aqui
                .then(([response, cache]) => response.ok && cache.put(event.request, response))
                .catch(_ => { /* ignore errors */ })
        );
    }
});

// Evento de push
self.addEventListener('push', (event) => {
    event.waitUntil(
        // Aqui você pode adicionar o código para lidar com notificações push
    );
});
