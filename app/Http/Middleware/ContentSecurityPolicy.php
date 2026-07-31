<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    public function handle(Request $request, Closure $next): Response
    {
        $nonce = base64_encode(random_bytes(16));

        Vite::useCspNonce($nonce);
        app()->instance('csp-nonce', $nonce);

        $response = $next($request);

        $scriptSources = ["'self'", "'nonce-{$nonce}'"];
        $styleSources = ["'self'", "'unsafe-inline'", 'https://fonts.bunny.net'];
        $connectSources = ["'self'"];

        if (Vite::isRunningHot()) {
            $hotUrl = @file_get_contents(Vite::hotFile());
            $viteOrigin = is_string($hotUrl)
                ? $this->origin(trim($hotUrl), ['http', 'https'])
                : null;

            if ($viteOrigin !== null) {
                $scriptSources[] = $viteOrigin;
                $styleSources[] = $viteOrigin;
                $connectSources[] = $viteOrigin;

                $webSocketOrigin = preg_replace(
                    '/^http(s?):/',
                    'ws$1:',
                    $viteOrigin,
                );

                if (is_string($webSocketOrigin)) {
                    $connectSources[] = $webSocketOrigin;
                }
            }
        }

        $publicWebSocketUrl = config('yjs.public_url');

        if (is_string($publicWebSocketUrl)) {
            $webSocketOrigin = $this->origin($publicWebSocketUrl, ['ws', 'wss']);

            if ($webSocketOrigin !== null) {
                $connectSources[] = $webSocketOrigin;
            }
        }

        $csp = implode('; ', [
            "default-src 'self'",
            'script-src '.implode(' ', array_unique($scriptSources)),
            'style-src '.implode(' ', array_unique($styleSources)),
            "font-src 'self' https://fonts.bunny.net",
            "img-src 'self' data: blob: https:",
            'connect-src '.implode(' ', array_unique($connectSources)),
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
        ]);

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }

    /**
     * @param  list<string>  $allowedSchemes
     */
    private function origin(string $url, array $allowedSchemes): ?string
    {
        $parts = parse_url($url);
        $scheme = $parts['scheme'] ?? null;
        $host = $parts['host'] ?? null;

        if (! is_string($scheme)
            || ! in_array($scheme, $allowedSchemes, true)
            || ! is_string($host)
        ) {
            return null;
        }

        $formattedHost = str_contains($host, ':') ? "[{$host}]" : $host;
        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return "{$scheme}://{$formattedHost}{$port}";
    }
}
