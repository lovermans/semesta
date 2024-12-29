var latestVersion = "{{ $app->config->get('app.name', 'Laravel') }}-service-worker-v-" + "{{ filemtime($app->publicPath('build/manifest.json')) }}";

var resources = [
    "{{ $app->request->getBasePath() . '/' }}",
    // "offline",
    "pwa-manifest.json",
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
    "{{ $app->url->asset('/favicon.ico') }}",
    "{{ $app->url->asset('/favicon.svg') }}",
    "{{ Vite::asset('resources/css/main.css') }}",
    "{{ Vite::asset('resources/js/pusher-esm.js') }}",
    "{{ Vite::asset('resources/js/echo-esm.js') }}"
];

async function onInstall(event) {
    caches.open(latestVersion)
        .then(function (cache) {
            resources.forEach(function (resource) {
                cache.add(new Request(resource), { cache: 'reload', credentials: 'include' });
            });
        })
        .catch(function (error) {
            console.error('Failed to retrieve resources', error);
        });
};

async function onActivate(event) {
    caches.keys().then(function (cacheNames) {
        return Promise.all(
            cacheNames.map(function (cacheName) {
                if (latestVersion.indexOf(cacheName) === -1) {
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

                const cacheOffline = await caches.open(latestVersion);
                const cachedResponse = await cacheOffline.match(event.request, { ignoreSearch: true, ignoreVary: true });

                if (cachedResponse) return cachedResponse;

                const networkResponse = await fetch(event.request);

                return networkResponse;

            } catch (error) {

                const savedCache = await caches.open(latestVersion);
                const offlineResponse = await savedCache.match("offline");

                console.error('Failed to retrieve cached resources', error);

                return offlineResponse;
            }
        })()
    )
});