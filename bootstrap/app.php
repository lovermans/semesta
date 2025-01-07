<?php

use App\Http\Middleware\AddSecurityHeaders;
use App\Http\Middleware\MinifyHtmlResponse;
use App\Http\Middleware\StartCustomSession;
use App\Http\Middleware\ValidateCustomCsrfToken;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        $middleware->trustProxies(at: '*');

        $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_PREFIX
        );

        $middleware->web(replace: [
            StartSession::class => StartCustomSession::class,
            ValidateCsrfToken::class => ValidateCustomCsrfToken::class,
        ]);

        $middleware->web(append: [
            MinifyHtmlResponse::class,
            AddSecurityHeaders::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
