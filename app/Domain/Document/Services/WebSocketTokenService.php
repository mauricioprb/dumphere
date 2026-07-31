<?php

declare(strict_types=1);

namespace App\Domain\Document\Services;

use Illuminate\Support\Facades\Config;

class WebSocketTokenService
{
    private const TTL_SECONDS = 3600;

    public function generate(string $documentId): string
    {
        $expiresAt = time() + self::TTL_SECONDS;
        $signature = $this->sign($documentId, $expiresAt);

        return $this->base64UrlEncode("{$documentId}:{$expiresAt}:{$signature}");
    }

    public function verify(string $token): ?string
    {
        $decoded = $this->base64UrlDecode($token);

        if ($decoded === false) {
            return null;
        }

        $parts = explode(':', $decoded, 3);

        if (count($parts) !== 3) {
            return null;
        }

        [$documentId, $expiresAt, $signature] = $parts;

        if (! preg_match('/^[0-9a-f-]{36}$/i', $documentId) || ! ctype_digit($expiresAt) || (int) $expiresAt < time()) {
            return null;
        }

        $expected = $this->sign($documentId, (int) $expiresAt);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        return $documentId;
    }

    private function sign(string $documentId, int $expiresAt): string
    {
        $secret = $this->getSecret();

        return hash_hmac('sha256', "{$documentId}:{$expiresAt}", $secret);
    }

    private function getSecret(): string
    {
        $key = Config::get('app.yjs_ws_secret')
            ?? Config::get('app.key');

        if (! is_string($key) || $key === '') {
            throw new \RuntimeException('A WebSocket signing secret is required.');
        }

        if (str_starts_with($key, 'base64:')) {
            $decoded = base64_decode(substr($key, 7), true);

            if ($decoded === false || $decoded === '') {
                throw new \RuntimeException('The WebSocket signing secret is invalid.');
            }

            return $decoded;
        }

        return $key;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string|false
    {
        if (! preg_match('/^[A-Za-z0-9_-]+$/', $value)) {
            return false;
        }

        $padding = (4 - strlen($value) % 4) % 4;

        return base64_decode(strtr($value, '-_', '+/').str_repeat('=', $padding), true);
    }
}
