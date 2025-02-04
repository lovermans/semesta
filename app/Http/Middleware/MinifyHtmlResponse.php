<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class MinifyHtmlResponse
{
    protected array $skippedElements = [];

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);


        if (Str::contains(strtolower($response->headers->get('Content-Type')), ['application/javascript','application/json','text/css','text/html'])) {

            $html = $response->getContent();

            // if (strpos($html, '<pre>') !== false) {
            //     $replace = [
            //         // "/<\?php/" => '<?php ',
            //         // "/\r/" => '',
            //         // "/>\n</" => '><',
            //         // "/>\s+\n</" => '><',
            //         // "/>\n\s+</" => '><',
            //         '/ {2,}/' => ' ',
            //         '/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/s' => '',
            //     ];
            // } else {
            //     $replace = [
            //         // '/<!--[^\[](.*?)[^\]]-->/s' => '',
            //         // "/<\?php/" => '<?php ',
            //         // "/\n([\S])/" => '$1',
            //         // "/\r/" => '',
            //         // "/\n/" => '',
            //         // "/\t/" => '',
            //         // '/ +/' => ' ',
            //         '/ {2,}/' => ' ',
            //         '/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/s' => '',
            //     ];
            // }

            $debugMode = $response->exception && config('app.debug') ? true : false;

            $htmlConfig = [
                'html' => $html,
                'removeBlankLinesInScriptElements' => $debugMode ? false : true,
                'collapseWhitespaces' => $debugMode ? false : true,
                'ignoreElements' => $debugMode ? ['pre',
            'textarea', 'script'] : ['pre',
            'textarea']
            ];

            $minifiedHtml = $this->minify(...$htmlConfig);

            $response->setContent($minifiedHtml);
        }

        return $response;
    }

    public function minify(
        ?string $html, 
        bool $removeHtmlComments = true, 
        bool $removeBlankLinesInScriptElements = true, 
        bool $removeWhitespaceBetweenTags = true,
        bool $collapseWhitespaces = true,
        array $ignoreElements = [
            'pre',
            'textarea',
        ]
        ): ?string
    {

        if ($removeHtmlComments) {
            $html = $this->removeHtmlComments($html);
        }

        if ($removeBlankLinesInScriptElements) {
            $html = $this->trimScriptElements($html);
        }

        if ($collapseWhitespaces) {
            $html = $this->collapseWhitespaces($html, $removeWhitespaceBetweenTags, $ignoreElements);
        }

        return trim($html);
    }

    protected function removeHtmlComments(?string $html): ?string
    {
        return (string)preg_replace('~<!--[^]><!\[](?!Livewire|ko |/ko)(.*?)[^]]-->~s', '', $html);
    }

    protected function trimScriptElements(?string $html): ?string
    {
        if (preg_match_all('~<script[^>]*>(.*)</script>~Uuis', $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $replace = trim((string)preg_replace('~^\p{Z}+|\p{Z}+$|^\s+~m', '', $match[1]));
                $html = str_replace($match[1], $replace, $html);
            }
        }

        return $html;
    }

    protected function collapseWhitespaces(?string $html, bool $removeWhitespaceBetweenTags, array $ignoreElements): ?string
    {
        $html = $this->hideElements($html, $ignoreElements);

        $whitespaceCollapses = [
            '~\s+~u' => ' ',
        ];

        if ($removeWhitespaceBetweenTags) {
            $regexes = [
                '~> +<~' => '><',
                '~(<[a-z]+[^>]*>) +~i' => '$1',
                '~ +(</[a-z]+)~i' => '$1',
            ];
            $whitespaceCollapses = array_merge($whitespaceCollapses, $regexes);
        }

        $html = (string)preg_replace(array_keys($whitespaceCollapses), array_values($whitespaceCollapses), $html);

        return $this->restoreElements($html);
    }

    protected function hideElements(?string $html, array $ignoreElements): ?string
    {
        foreach ($ignoreElements as $element) {
            $pattern = '~<' . $element . '[^>]*>(.*)</' . $element . '>~Uuis';
            if (preg_match_all($pattern, $html, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $this->skippedElements['#' . md5($match[1]) . '#'] = $match[1];
                }
            }
        }
        if (count($this->skippedElements)) {
            $html = str_replace(array_values($this->skippedElements), array_keys($this->skippedElements), $html);
        }

        return $html;
    }

    protected function restoreElements(?string $html): ?string
    {
        if (count($this->skippedElements)) {
            return str_replace(array_keys($this->skippedElements), array_values($this->skippedElements), $html);
        }

        return $html;
    }
}
