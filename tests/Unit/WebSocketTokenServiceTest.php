<?php

declare(strict_types=1);

use App\Support\WebSocketTokenService;
use Illuminate\Support\Facades\Config;

it('generates and verifies a document scoped token', function (): void {
    $documentId = '0198f37a-21b4-7d6c-8a9b-123456789abc';
    Config::set('app.yjs_ws_secret', 'test-secret');
    $service = app(WebSocketTokenService::class);

    $token = $service->generate($documentId);

    expect($token)
        ->toMatch('/^[A-Za-z0-9_-]+$/')
        ->and($service->verify($token))->toBe($documentId);
});

it('rejects tampered and malformed tokens', function (): void {
    $documentId = '0198f37a-21b4-7d6c-8a9b-123456789abc';
    Config::set('app.yjs_ws_secret', 'test-secret');
    $service = app(WebSocketTokenService::class);
    $token = $service->generate($documentId);

    expect($service->verify(substr($token, 0, -2) . 'aa'))
        ->toBeNull()
        ->and($service->verify('not-base64'))->toBeNull();
});
