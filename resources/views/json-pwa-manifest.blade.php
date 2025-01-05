{
    "short_name": "{{ $app->config->get('app.name') }}",
    "name": "{{ $app->config->get('app.description') }}",
    "icons": [
        {
            "src": "{{ Vite::asset('resources/images/app-icon/maskable_icon_x192.png') }}",
            "type": "image/png",
            "sizes": "192x192",
            "purpose": "maskable"
        },
        {
            "src": "{{ Vite::asset('resources/images/app-icon/maskable_icon_x512.png') }}",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "any"
        }
    ],
    "id": "{{ $app->request->getBasePath() . '/' }}",
    "start_url": "{{ $app->request->getBasePath() . '/' }}",
    "background_color": "#9e9e9e",
    "display": "standalone",
    "theme_color": "#9e9e9e",
    "description": "{{ $app->config->get('app.description') }}"
}