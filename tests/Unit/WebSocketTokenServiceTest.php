<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Document\Services\WebSocketTokenService;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class WebSocketTokenServiceTest extends TestCase
{
    private const DOCUMENT_ID = '0198f37a-21b4-7d6c-8a9b-123456789abc';

    public function test_it_generates_and_verifies_a_document_scoped_token(): void
    {
        Config::set('app.yjs_ws_secret', 'test-secret');
        $service = app(WebSocketTokenService::class);

        $token = $service->generate(self::DOCUMENT_ID);

        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]+$/', $token);
        $this->assertSame(self::DOCUMENT_ID, $service->verify($token));
    }

    public function test_it_rejects_tampered_and_malformed_tokens(): void
    {
        Config::set('app.yjs_ws_secret', 'test-secret');
        $service = app(WebSocketTokenService::class);
        $token = $service->generate(self::DOCUMENT_ID);

        $this->assertNull($service->verify(substr($token, 0, -2).'aa'));
        $this->assertNull($service->verify('not-base64'));
    }
}
