<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MinifyHtmlResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ((strtolower(strtok($response->headers->get('Content-Type'), ';')) === 'text/html')) {

            $html = $response->getContent();

            if (strpos($html, '<pre>') !== false) {
                $replace = [
                    "/<\?php/" => '<?php ',
                    "/\r/" => '',
                    "/>\n</" => '><',
                    "/>\s+\n</" => '><',
                    "/>\n\s+</" => '><',
                ];
            } else {
                $replace = [
                    // '/<!--[^\[](.*?)[^\]]-->/s' => '',
                    "/<\?php/" => '<?php ',
                    "/\n([\S])/" => '$1',
                    "/\r/" => '',
                    "/\n/" => '',
                    "/\t/" => '',
                    '/ +/' => ' ',
                ];
            }

            $minifiedHtml = preg_replace(array_keys($replace), array_values($replace), $html);

            $response->setContent($minifiedHtml);
        }

        return $response;
    }
}
