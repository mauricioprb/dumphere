<?php

declare(strict_types=1);

use App\Http\Middleware\ContentSecurityPolicy;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Support\ErrorPage;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withSingletons([
        'csp-nonce' => fn (): string => base64_encode(random_bytes(16)),
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $trustedProxies = env('TRUSTED_PROXIES', '127.0.0.1');
        $middleware->trustProxies(
            at: $trustedProxies === '*'
                ? '*'
                : array_map('trim', explode(',', $trustedProxies))
        );

        $middleware->web(append: [
            SetLocale::class,
            ContentSecurityPolicy::class,
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(static function (Exceptions $exceptions): void {
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            $status = $exception->getStatusCode();

            // Server faults in development keep the framework's debug page, which says more.
            if (! ErrorPage::wantsPage($request) || ($status >= 500 && config('app.debug'))) {
                return null;
            }

            return ErrorPage::render($request, $status, headers: $exception->getHeaders());
        });
    })
    ->create();
