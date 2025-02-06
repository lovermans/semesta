<?php

namespace App\Http\Controllers;

class RootController extends Controller
{
    public function createPwaManifestJson()
    {
        return response()->view('morphs.json-pwa-manifest')->withHeaders(['Content-Type' => 'application/json']);
    }

    public function createServiceWorkerJs()
    {
        return response()->view('morphs.js-service-worker')->withHeaders(['Content-Type' => 'application/javascript', 'Cache-Control' => 'no-cache']);
    }

    public function createWebSocketJs()
    {
        return response()->view('morphs.js-websocket')->withHeaders(['Content-Type' => 'application/javascript', 'Cache-Control' => 'no-store']);
    }

    public function registerServiceWorker()
    {
        return response()->view('morphs.js-register-service-worker')->withHeaders(['Content-Type' => 'application/javascript', 'Cache-Control' => 'max-age=2592000, public']);
    }

    public function setAppLocale()
    {
        abort_unless(request()->isMethod('POST'), 404);
        
        session(['locale' => request('locale', 'en')]);
        
        return back();
    }
}
