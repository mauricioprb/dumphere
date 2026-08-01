<?php

declare(strict_types=1);

use App\Http\Controllers\DocumentController;
use App\Http\Middleware\SanitizeSlug;
use App\Http\Middleware\ThrottleByIp;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/robots.txt', function (): Response {
    $contents = implode("\n", [
        'User-agent: *',
        'Allow: /',
        'Disallow: /health',
        '',
        'Sitemap: ' . url('/sitemap.xml'),
        '',
    ]);

    return response($contents, 200, [
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Cache-Control' => 'public, max-age=3600',
    ]);
})->name('robots');

Route::get('/sitemap.xml', function (): Response {
    return response()
        ->view('sitemap', [
            'urls' => [route('home'), route('terms')],
        ])
        ->header('Content-Type', 'application/xml; charset=UTF-8')
        ->header('Cache-Control', 'public, max-age=3600');
})->name('sitemap');

Route::get('/health', function () {
    DB::select('SELECT 1');

    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
})->name('health');

Route::middleware([ThrottleByIp::class, SanitizeSlug::class])
    ->group(function () {
        Route::post('/{slug}/save', [DocumentController::class, 'save'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.save');

        Route::get('/{slug}', [DocumentController::class, 'show'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.show');
    });
