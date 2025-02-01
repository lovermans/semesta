<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class LocaleSetting
{
    public function handle(Request $request, Closure $next): Response
    {
        $availableLangs  = ['en', 'id'];
        $userLang = substr($request->server('HTTP_ACCEPT_LANGUAGE'), 0, 2);

        if (session()->has('locale') && in_array(session()->get('locale'), $availableLangs)) {
            app()->setlocale(session()->get('locale'));
        } else if (in_array($userLang, $availableLangs)) {
            app()->setLocale($userLang);
            session()->put('locale', $userLang);
        }
        
        return $next($request);
    }
}
