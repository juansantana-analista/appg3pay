
importScripts("https://cdn.pushalert.co/sw-74144.js");

    const HOSTNAME_WHITELIST = [
        self.location.hostname,
        'fonts.gstatic.com',
        'fonts.googleapis.com',
        'cdn.jsdelivr.net'
    ]

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

    /**
     *  @Functional Fetch
     *  All network requests are being intercepted here.
     *
     *  void respondWith(Promise<Response> r)
     */
    self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request)
        const fixedUrl = getFixedUrl(event.request)
        const fetched = fetch(fixedUrl, { cache: 'no-store' })
        const fetchedCopy = fetched.then(resp => resp.clone())

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
        Promise.race([fetched.catch(_ => cached), cached])
            .then(resp => resp || fetched)
            .catch(_ => { /* eat any errors */ })
        )

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
        Promise.all([fetchedCopy, caches.open("pwa-cache")])
            .then(([response, cache]) => response.ok && cache.put(event.request, response))
            .catch(_ => { /* eat any errors */ })
        )
    }
    });
    self.addEventListener('push', (event) => {
        event.waitUntil(
        );
    });

    let deferredPrompt;
    const installPromptDiv = document.getElementById('installPrompt');
    const installButton = document.getElementById('btnInstall');

    // Capturar o evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (event) => {
        // Prevenir que o navegador exiba o prompt automaticamente
        event.preventDefault();
        deferredPrompt = event;

        // Mostrar o prompt sempre que o usuário abrir o site, se ainda não estiver instalado
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            installPromptDiv.style.display = 'block';
        }
    });

    // Quando o botão for clicado, exibir o prompt de instalação
    installButton.addEventListener('click', () => {
        installPromptDiv.style.display = 'none'; // Esconder o prompt personalizado
        deferredPrompt.prompt(); // Exibir o prompt nativo de instalação

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou a instalação.');
            } else {
                console.log('Usuário rejeitou a instalação.');
            }
            deferredPrompt = null;
        });
    });

    // Verificar se o PWA já está instalado
    window.addEventListener('appinstalled', () => {
        console.log('PWA instalado.');
        installPromptDiv.style.display = 'none'; // Ocultar o prompt se o PWA foi instalado
    });