<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;

class AddSecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        Vite::useCspNonce();

        $response = $next($request);

        if ((strtolower(strtok($response->headers->get('Content-Type'), ';')) === 'text/html')
            //  || (is_object($response) && $response instanceof Response)
        ) {
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('X-Frame-Options', 'DENY');
            // $response->headers->set('Content-Security-Policy', "default-src 'self' 'nonce-".Vite::cspNonce()."' 'sha256-KnTKOmenDlnJNzjC3NQYwzUGB3sP3xj1So7Zi5TebWk=';base-uri 'self';frame-ancestors 'none';img-src 'self' * data:;script-src 'self' 'nonce-".Vite::cspNonce()."' 'strict-dynamic' 'unsafe-inline' 'unsafe-hashes' 'sha256-bqOxJgOingQ6DPZoJUJLUkKPUVrpjPZg5dihjH+kwto=' http: https:;style-src 'self' 'unsafe-inline'");
            if (!$response->exception) {
            
                $response->headers->set('Content-Security-Policy', "default-src 'self' 'nonce-".Vite::cspNonce()."' 'sha256-V3iSpR5LsMzgMzBO77mfujLtlczoGoxPxVLF7hJGPxc=' 'sha256-Nqnn8clbgv+5l0PgxcTOldg8mkMKrFn4TvPL+rYUUGg=';base-uri 'self';frame-ancestors 'none';img-src 'self' * data:;script-src 'self' 'nonce-".Vite::cspNonce()."' 'strict-dynamic' 'unsafe-hashes' 'sha256-bqOxJgOingQ6DPZoJUJLUkKPUVrpjPZg5dihjH+kwto='");
            }
            
            $response->headers->set('Vary', 'Accept,Accept-Encoding,X-PJAX');
            // $response->headers->remove('X-Powered-By');
            // $response->headers->remove('Server');
        }

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Access-Control-Allow-Origin', $request->host());

        return $response;
    }
}
