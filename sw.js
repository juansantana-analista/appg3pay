
importScripts("https://cdn.pushalert.co/sw-74144.js");

    const HOSTNAME_WHITELIST = [
        self.location.hostname,
        'fonts.gstatic.com',
        'fonts.googleapis.com',
        'cdn.jsdelivr.net'
    ];


    // O URL da página de "offline"
    const OFFLINE_URL = 'offline.html';

    // The Util Function to hack URLs of intercepted requests
    const getFixedUrl = (req) => {
        var now = Date.now()
        var url = new URL(req.url)

        // 1. fixed http URL
        // Just keep syncing with location.protocol
        // fetch(httpURL) belongs to active mixed content.
        // And fetch(httpRequest) is not supported yet.
        url.protocol = self.location.protocol

        // 2. add query for caching-busting.
        // Github Pages served with Cache-Control: max-age=600
        // max-age on mutable content is error-prone, with SW life of bugs can even extend.
        // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
        // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
        if (url.hostname === self.location.hostname) {
            url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
        }
        return url.href
    }

    /**
     *  @Lifecycle Activate
     *  New one activated when old isnt being used.
     *
     *  waitUntil(): activating ====> activated
     */
    self.addEventListener('activate', event => {
      event.waitUntil(self.clients.claim())
    })

    // Adicionar a página offline ao cache na instalação do Service Worker
    self.addEventListener('install', event => {
        event.waitUntil(
            caches.open('pwa-cache').then(cache => {
                return cache.add(OFFLINE_URL);
            })
        );
    });

    /**
     *  @Functional Fetch
     *  All network requests are being intercepted here.
     *
     *  void respondWith(Promise<Response> r)
     */
    self.addEventListener('fetch', event => {
        const { request } = event;
        const fixedUrl = getFixedUrl(request);

        // Verifica se o pedido está na whitelist
        if (HOSTNAME_WHITELIST.indexOf(new URL(request.url).hostname) > -1) {
            // Stale-while-revalidate
            const cached = caches.match(request);
            const fetched = fetch(fixedUrl, { cache: 'no-store' })
                .then(response => response)
                .catch(() => cached); // Se o fetch falhar, tenta o cache

            event.respondWith(
                fetched.then(response => {
                    // Se não conseguir buscar da rede ou cache, mostra a página offline
                    return response || caches.match(OFFLINE_URL);
                })
            );

            // Atualiza o cache
            event.waitUntil(
                fetched.then(response => {
                    return caches.open("pwa-cache").then(cache => {
                        if (response && response.ok) {
                            cache.put(request, response.clone());
                        }
                    });
                }).catch(() => { /* lidar com erros */ })
            );
        } else {
            // Redireciona para a página offline se não conseguir acessar a rede
            event.respondWith(
                fetch(fixedUrl).catch(() => caches.match(OFFLINE_URL))
            );
        }
    });
    self.addEventListener('push', (event) => {
        event.waitUntil(
        );
    });
