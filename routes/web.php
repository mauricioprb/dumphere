<?php

declare(strict_types=1);

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PrefixController;
use App\Http\Middleware\SanitizeSlug;
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

Route::post('/checkout', [CheckoutController::class, 'create'])
    ->middleware('throttle:10,1')
    ->name('checkout.create');

Route::post('/checkout/webhook', [CheckoutController::class, 'webhook'])->name('checkout.webhook');

Route::get('/claim', [PrefixController::class, 'claim'])
    ->middleware('throttle:10,1')
    ->name('prefix.claim');
Route::post('/claim', [PrefixController::class, 'storeOwnerPassword'])
    ->middleware('throttle:10,1')
    ->name('prefix.claim.store');

Route::get('/recover', [PrefixController::class, 'recoverForm'])->name('prefix.recover');
Route::post('/recover', [PrefixController::class, 'recover'])
    ->middleware('throttle:5,1')
    ->name('prefix.recover.store');

Route::middleware(['throttle:60,1', SanitizeSlug::class])
    ->group(function () {
        Route::get('/api/document-tree/{slug}', [DocumentController::class, 'tree'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.tree');

        Route::post('/{slug}/settings', [PrefixController::class, 'settings'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->middleware('throttle:30,1')
            ->name('prefix.settings');

        Route::post('/{slug}/save', [DocumentController::class, 'save'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.save');

        Route::delete('/{slug}', [DocumentController::class, 'destroy'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.destroy');

        Route::post('/{slug}', [DocumentController::class, 'unlock'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.unlock');

        Route::get('/{slug}', [DocumentController::class, 'show'])
            ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-\/]*')
            ->name('document.show');
    });
