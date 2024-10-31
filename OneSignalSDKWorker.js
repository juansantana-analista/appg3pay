importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'pwa-cache-v1.18'; // Altere a versão aqui sempre que modificar os arquivos
const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
];

// Função utilitária para corrigir URLs de requisições interceptadas
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
    event.waitUntil(self.skipWaiting()); // Ativa imediatamente o novo Service Worker
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
            return self.clients.claim(); // Faz o novo SW controlar todos os clientes
        }).then(() => {
            // Atualiza as abas abertas ao ativar o novo Service Worker
            self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
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

// Listener para mensagens de atualização
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});

// Evento de push
self.addEventListener('push', (event) => {
    event.waitUntil(
        // Adicione aqui o código para lidar com notificações push, se necessário
    );
});
