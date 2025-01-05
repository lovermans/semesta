<?php

namespace App\Http\Controllers;

class RootController extends Controller
{
    public function createFontFaceCSS()
    {
        return response()->view('css-font-face')->withHeaders(['Content-Type' => 'text/css', 'Cache-Control' => 'max-age=2592000, public']);
    }

    public function createPwaManifestJson()
    {
        return response()->view('json-pwa-manifest')->withHeaders(['Content-Type' => 'application/json']);
    }

    public function createServiceWorkerJs()
    {
        return response()->view('js-service-worker')->withHeaders(['Content-Type' => 'application/javascript', 'Cache-Control' => 'no-cache']);
    }

    public function createWebSocketJs()
    {
        return response()->view('js-websocket')->withHeaders(['Content-Type' => 'application/javascript', 'Cache-Control' => 'max-age=2592000, public']);
    }

    public function registerServiceWorker()
    {
        return response()->view('js-register-service-worker')->withHeaders(['Content-Type' => 'application/javascript', 'Cache-Control' => 'max-age=2592000, public']);
    }
}
