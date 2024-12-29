<?php

namespace App\Http\Controllers;

class RootController extends Controller
{
    public function createPwaManifestJson()
    {
        return response()->view('pwa-manifest')->withHeaders(['Content-Type' => 'application/json']);
    }
}
