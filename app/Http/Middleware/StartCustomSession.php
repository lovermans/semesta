<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Contracts\Session\Session;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Session\Middleware\StartSession as StartDefaultSession;

class StartCustomSession extends StartDefaultSession
{
    protected function addCookieToResponse(Response $response, Session $session)
    {
        if ($this->sessionIsPersistent($config = $this->manager->getSessionConfig())) {
            $response->headers->setCookie(new Cookie(
                $session->getName(),
                $session->getId(),
                $this->getCookieExpirationDate(),
                request()->getBasePath() ?: $config['path'],
                $config['domain'],
                $config['secure'] ?? false,
                $config['http_only'] ?? true,
                false,
                $config['same_site'] ?? null,
                $config['partitioned'] ?? false
            ));
        }
    }

    protected function storeCurrentUrl(Request $request, $session)
    {
        if ($request->isMethod('GET') &&
            $request->route() instanceof Route &&
            ! $request->ajax() &&
            ! $request->prefetch() &&
            ! $request->isPrecognitive()&&
            ! in_array($request->route()->getName(), [
                'json-pwa-manifest',
                'js-register-service-worker',
                'js-service-worker',
                'js-websocket',
                'offline-fallback',
                'page-need-javascript'
            ])) {
            $session->setPreviousUrl($request->fullUrl());
        }
    }
}
