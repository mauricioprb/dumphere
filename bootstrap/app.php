<?php

declare(strict_types=1);

use App\Http\Middleware\ContentSecurityPolicy;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $trustedProxies = env('TRUSTED_PROXIES', '127.0.0.1');
        $middleware->trustProxies(
            at: $trustedProxies === '*'
                ? '*'
                : array_map('trim', explode(',', $trustedProxies))
        );

        $middleware->web(append: [
            ContentSecurityPolicy::class,
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(static function (): void {})
    ->create();
