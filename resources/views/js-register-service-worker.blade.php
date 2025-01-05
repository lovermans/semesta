(() => {
    if ('serviceWorker' in navigator &&
        window.location.protocol === 'https:' &&
        window.self == window.top &&
        navigator.onLine
    ) {
        let serviceWorkerUpdated = false;
        let serviceWorkerActivated = false;

        function checkServiceWorkerUpdateAndRefreshPage() {
            if (serviceWorkerActivated && serviceWorkerUpdated) {
                console.log('Reload Page');
                window.location.reload();
            };
        };

        navigator.serviceWorker.register("{{ $app->request->getBasePath() . '/service-worker.js' }}")
            .then(registration => {
                registration.addEventListener('updatefound', () => {
                    console.log('Service Worker Update Found');
                    const worker = registration.installing;

                    worker.addEventListener('statechange', () => {
                        console.log({
                            state: worker.state
                        });

                        if (worker.state === 'activated') {
                            console.log('Service Worker Activated');
                            serviceWorkerActivated = true;

                            checkServiceWorkerUpdateAndRefreshPage();
                        };
                    });
                });
            });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker Changed');
            serviceWorkerUpdated = true;

            checkServiceWorkerUpdateAndRefreshPage();
        });

    };
})();