<?php

declare(strict_types=1);

namespace App\Domain\Document\Services;

use Illuminate\Support\Facades\Config;

class WebSocketTokenService
{
    private const TTL_SECONDS = 86400;

    public function generate(string $slug): string
    {
        $expiresAt = time() + self::TTL_SECONDS;
        $signature = $this->sign($slug, $expiresAt);

        return base64_encode("{$slug}:{$expiresAt}:{$signature}");
    }

    public function verify(string $token): ?string
    {
        $decoded = base64_decode($token, true);

        if ($decoded === false) {
            return null;
        }

        $parts = explode(':', $decoded, 3);

        if (count($parts) !== 3) {
            return null;
        }

        [$slug, $expiresAt, $signature] = $parts;

        if ((int) $expiresAt < time()) {
            return null;
        }

        $expected = $this->sign($slug, (int) $expiresAt);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        return $slug;
    }

    private function sign(string $slug, int $expiresAt): string
    {
        $secret = $this->getSecret();

        return hash_hmac('sha256', "{$slug}:{$expiresAt}", $secret);
    }

    private function getSecret(): string
    {
        $key = Config::get('app.yjs_ws_secret')
            ?? Config::get('app.key');

        if (str_starts_with($key, 'base64:')) {
            return base64_decode(substr($key, 7));
        }

        return $key;
    }
}
