<?php

declare(strict_types=1);

use Dumphere\WebSocketToken;

it('generates and verifies a document scoped token', function (): void {
    $tokens = new WebSocketToken('test-secret');
    $token = $tokens->generate('6a1f0c2b3d4e5f607182');

    expect($token)
        ->toMatch('/^[A-Za-z0-9_-]+$/')
        ->and($tokens->verify($token))->toBe('6a1f0c2b3d4e5f607182')
        ->and((new WebSocketToken('other-secret'))->verify($token))->toBeNull();
});

it('rejects tampered and malformed tokens', function (): void {
    $tokens = new WebSocketToken('test-secret');
    $token = $tokens->generate('6a1f0c2b3d4e5f607182');

    expect($tokens->verify(substr($token, 0, -2) . 'aa'))->toBeNull()
        ->and($tokens->verify('not-base64!'))->toBeNull();
});

it('binds the token to the address rules', function (): void {
    $tokens = new WebSocketToken('test-secret');
    $gate = WebSocketToken::gate(false, 'hash', 'session');
    $token = $tokens->generate('6a1f0c2b3d4e5f607182', WebSocketToken::SCOPE_WRITE, $gate);

    expect($tokens->matches($token, '6a1f0c2b3d4e5f607182', $gate))->toBeTrue()
        ->and($tokens->matches($token, '6a1f0c2b3d4e5f607182', WebSocketToken::gate(true, 'hash', 'session')))->toBeFalse();
});

it('requires a dedicated websocket signing secret', function (): void {
    new WebSocketToken('');
})->throws(RuntimeException::class, 'A WebSocket signing secret is required.');
