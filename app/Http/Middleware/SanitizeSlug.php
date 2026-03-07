<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeSlug
{
    private const SLUG_PATTERN = '/^[a-z0-9][a-z0-9\-\/]{0,199}$/';

    private const RESERVED_SEGMENTS = [
        'admin', 'api', 'health', 'login', 'register',
        'dashboard', 'settings', 'reverb', 'broadcasting',
        'assets', 'build', 'vendor',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('slug');

        if ($slug === null) {
            return $next($request);
        }

        $slug = strtolower(trim($slug, '/'));

        if (! preg_match(self::SLUG_PATTERN, $slug)) {
            abort(404, 'Invalid document URL.');
        }

        $firstSegment = explode('/', $slug)[0];
        if (in_array($firstSegment, self::RESERVED_SEGMENTS, true)) {
            abort(404, 'This URL is reserved.');
        }

        if (str_contains($slug, '//')) {
            abort(404, 'Invalid document URL.');
        }

        $request->route()->setParameter('slug', $slug);

        return $next($request);
    }
}
