<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

final class ErrorPage
{
    /** @param array<string, string|int> $headers */
    public static function render(
        Request $request,
        int $status,
        ?string $reason = null,
        ?string $prefix = null,
        array $headers = [],
    ): SymfonyResponse {
        $response = Inertia::render('Error', [
            'status' => $status,
            'reason' => $reason,
            'prefix' => $prefix,
            'retryAfter' => isset($headers['Retry-After']) ? (int) $headers['Retry-After'] : null,
        ])->toResponse($request)->setStatusCode($status);

        foreach ($headers as $name => $value) {
            $response->headers->set($name, (string) $value);
        }

        return $response;
    }

    public static function wantsPage(Request $request): bool
    {
        return ! $request->expectsJson() && $request->acceptsHtml();
    }
}
