<title>{{ $app->config->get('app.name') }}</title>
<meta content="{{ $app->config->get('app.description') }}" name="description">

<link href="{{ $app->request->url() }}" rel="canonical">
<link href="{{ $app->config->get('app.author') }}" rel="author">
<link href="{{ $app->config->get('app.publisher') }}" rel="publisher">

<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1" name="viewport">
<meta content="IE=edge" http-equiv="X-UA-Compatible">
<meta content="Laravel 11" name="generator">

<link href="{{ $app->request->getSchemeAndHttpHost() }}" rel="preconnect">
<link href="{{ $app->request->getSchemeAndHttpHost() }}" rel="dns-prefetch">

<meta content="{{ $app->url->route('start') }}" name="msapplication-starturl">

<meta content="{{ $app->config->get('app.name', 'Laravel') }}" name="application-name">
<meta content="{{ $app->config->get('app.name', 'Laravel') }}" name="apple-mobile-web-app-title">

<meta content="yes" name="mobile-web-app-capable">
<meta content="yes" name="apple-mobile-web-app-capable">

<meta content="#9e9e9e" name="theme-color">
<meta content="#9e9e9e" name="msapplication-TileColor">
<meta content="#9e9e9e" name="msapplication-navbutton-color">
<meta content="#9e9e9e" name="apple-mobile-web-app-status-bar-style">

<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-57x57.png') }}" rel="apple-touch-icon" sizes="57x57">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-60x60.png') }}" rel="apple-touch-icon" sizes="60x60">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-72x72.png') }}" rel="apple-touch-icon" sizes="72x72">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-76x76.png') }}" rel="apple-touch-icon" sizes="76x76">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-114x114.png') }}" rel="apple-touch-icon" sizes="114x114">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-120x120.png') }}" rel="apple-touch-icon" sizes="120x120">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-144x144.png') }}" rel="apple-touch-icon" sizes="144x144">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-152x152.png') }}" rel="apple-touch-icon" sizes="152x152">
<link href="{{ Vite::asset('resources/images/app-icon/apple-icon-180x180.png') }}" rel="apple-touch-icon" sizes="180x180">
<link href="{{ Vite::asset('resources/images/app-icon/android-icon-192x192.png') }}" rel="icon" sizes="192x192" type="image/png">
<link href="{{ Vite::asset('resources/images/app-icon/android-icon-512x512.png') }}" rel="icon" sizes="512x512" type="image/png">
<link href="{{ Vite::asset('resources/images/app-icon/favicon-32x32.png') }}" rel="icon" sizes="32x32" type="image/png">
<link href="{{ Vite::asset('resources/images/app-icon/favicon-96x96.png') }}" rel="icon" sizes="96x96" type="image/png">
<link href="{{ Vite::asset('resources/images/app-icon/favicon-16x16.png') }}" rel="icon" sizes="16x16" type="image/png">
<link href="{{ Vite::asset('resources/images/app-icon/android-icon-192x192.png') }}" rel="shortcut icon">
<meta content="{{ Vite::asset('resources/images/app-icon/ms-icon-144x144.png') }}" name="msapplication-TileImage">

<link href="{{ $app->url->asset('/favicon.ico') }}" rel="icon" type="image/x-icon">
<link href="{{ $app->url->asset('/favicon.svg') }}" rel="icon" type="image/svg+xml">

<link crossorigin="use-credentials" href="{{ $app->url->route('pwa-manifest') }}" rel="manifest">

<link href="{{ Vite::asset('resources/css/main.css') }}" rel="stylesheet">
