<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\DocumentSlug;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeSlug
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('slug');

        if ($slug === null) {
            return $next($request);
        }

        $slug = DocumentSlug::normalize($slug);

        if (! DocumentSlug::isValid($slug)) {
            abort(404, 'Invalid document URL.');
        }

        $request->route()->setParameter('slug', $slug);

        return $next($request);
    }
}
