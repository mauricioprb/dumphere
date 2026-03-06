<?php

use App\Http\Controllers\Document\DocumentController;
use App\Http\Middleware\SanitizeSlug;
use App\Http\Middleware\ThrottleByIp;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
})->name('health');

Route::middleware([ThrottleByIp::class, SanitizeSlug::class])
    ->group(function () {
        Route::post('/{slug}/save', [DocumentController::class, 'save'])
            ->where('slug', '[a-z0-9][a-z0-9\-\/]*')
            ->name('document.save');

        Route::get('/{slug}', [DocumentController::class, 'show'])
            ->where('slug', '[a-z0-9][a-z0-9\-\/]*')
            ->name('document.show');
    });
