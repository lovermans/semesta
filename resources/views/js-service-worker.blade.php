var CACHE_VERSION = "{{ filemtime($app->publicPath('build/manifest.json')) }}";

var CURRENT_CACHES = {
    assets: "assets-v-" + CACHE_VERSION,
    pages: "pages-v-" + CACHE_VERSION
};

var RESOURCES = {
    assets: [
        "{{ $app->url->route('page-need-javascript') }}",
        "{{ $app->url->route('offline-fallback') }}",
        "{{ $app->url->route('json-pwa-manifest') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-100.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-300.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-400.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-500.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-700.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-900.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-100-Italic.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-300-Italic.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-400-Italic.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-500-Italic.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-700-Italic.woff2') }}",
        "{{ Vite::asset('resources/fonts/woff2/Roboto-900-Italic.woff2') }}",
        "{{ Vite::asset('resources/images/svg/icon-sprites.svg') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-57x57.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-60x60.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-72x72.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-76x76.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-114x114.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-120x120.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-144x144.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-152x152.png') }}",
        "{{ Vite::asset('resources/images/app-icon/apple-icon-180x180.png') }}",
        "{{ Vite::asset('resources/images/app-icon/android-icon-192x192.png') }}",
        "{{ Vite::asset('resources/images/app-icon/android-icon-512x512.png') }}",
        "{{ Vite::asset('resources/images/app-icon/favicon-32x32.png') }}",
        "{{ Vite::asset('resources/images/app-icon/favicon-96x96.png') }}",
        "{{ Vite::asset('resources/images/app-icon/favicon-16x16.png') }}",
        "{{ Vite::asset('resources/images/app-icon/ms-icon-144x144.png') }}",
        "{{ Vite::asset('resources/images/app-icon/maskable_icon_x192.png') }}",
        "{{ Vite::asset('resources/images/app-icon/maskable_icon_x512.png') }}",
        "{{ $app->url->asset('/favicon.ico') }}",
        "{{ $app->url->asset('/favicon.svg') }}",
        "{{ $app->url->route('css-font-face') . '?id=' . filemtime($app->resourcePath('views/css-font-face.blade.php')) }}",
        "{{ Vite::asset('resources/css/main.css') }}",
        "{{ Vite::asset('resources/js/start.js') }}",
        "{{ $app->url->route('js-register-service-worker') . '?id=' . filemtime($app->resourcePath('views/js-register-service-worker.blade.php')) }}",
        "{{ $app->url->route('js-websocket') . '?id=' . filemtime($app->resourcePath('views/js-websocket.blade.php')) }}",
        "{{ Vite::asset('resources/js/svg-sprites-icon-loader.js') }}",
        "{{ Vite::asset('resources/js/pusher-esm.js') }}",
        "{{ Vite::asset('resources/js/echo-esm.js') }}"
    ],
    pages: [
        /* "{{ $app->url->route('start') }}", */
    ]
};

var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
    return CURRENT_CACHES[key];
});

async function onInstall(event) {
    Object.entries(CURRENT_CACHES).forEach(function ([key, value]) {
        caches.open(value)
            .then(function (cache) {
                RESOURCES[key].forEach(function (resource) {
                    cache.add(new Request(resource, { credentials: 'include' }));
                });
            })
            .catch(function (error) {
                console.error('Failed to retrieve resources ' + key, error);
            });
    });
};

async function onActivate(event) {
    caches.keys()
        .then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
};

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(onInstall(event));
});

self.addEventListener('activate', function (event) {
    event.waitUntil(onActivate(event));
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        (async () => {
            try {

                const cachedResponse = await caches.match(event.request, { ignoreSearch: true, ignoreVary: true });

                if (cachedResponse) return cachedResponse;

                const preloadResponse = await event.preloadResponse;
                if (preloadResponse) return preloadResponse;

                const networkResponse = await fetch(event.request);

                return networkResponse;

            } catch (error) {

                if (event.request.mode === 'navigate') {
                    const offlineResponse = await caches.match('offline-fallback');

                    console.error('Failed to retrieve cached resources', error);

                    return offlineResponse;
                };
            }
        })()
    );
});