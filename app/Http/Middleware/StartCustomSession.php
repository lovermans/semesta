<?php

namespace App\Http\Middleware;

use Illuminate\Contracts\Session\Session;
use Illuminate\Session\Middleware\StartSession as StartDefaultSession;
use Illuminate\Support\Facades\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;

class StartCustomSession extends StartDefaultSession
{
    protected function addCookieToResponse(Response $response, Session $session)
    {
        if ($this->sessionIsPersistent($config = $this->manager->getSessionConfig())) {
            $response->headers->setCookie(new Cookie(
                $session->getName(),
                $session->getId(),
                $this->getCookieExpirationDate(),
                Request::getBasePath() ?: $config['path'],
                $config['domain'],
                $config['secure'] ?? false,
                $config['http_only'] ?? true,
                false,
                $config['same_site'] ?? null,
                $config['partitioned'] ?? false
            ));
        }
    }
}
