<?php

declare(strict_types=1);

namespace Dumphere;

use RuntimeException;

final class WebSocketToken
{
    public const SCOPE_WRITE = 'write';

    public const SCOPE_READ = 'read';

    private const TTL_SECONDS = 3600;

    private const DOCUMENT_ID_PATTERN = '/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/';

    private readonly string $secret;

    public function __construct(string $secret)
    {
        if ($secret === '') {
            throw new RuntimeException('A WebSocket signing secret is required.');
        }

        if (str_starts_with($secret, 'base64:')) {
            $decoded = base64_decode(substr($secret, 7), true);

            if ($decoded === false || $decoded === '') {
                throw new RuntimeException('The WebSocket signing secret is invalid.');
            }

            $secret = $decoded;
        }

        $this->secret = $secret;
    }

    public static function gate(bool $readonly, ?string $visitorPasswordHash, ?string $ownerSessionId = null): string
    {
        $rules = ($readonly ? '1' : '0') . ':' . ($visitorPasswordHash ?? '') . ':' . ($ownerSessionId ?? '');

        return substr(hash('sha256', $rules), 0, 12);
    }

    public function generate(string $documentId, string $scope = self::SCOPE_WRITE, string $gate = ''): string
    {
        $expiresAt = time() + self::TTL_SECONDS;
        $signature = $this->sign($documentId, $scope, $gate, $expiresAt);

        return $this->base64UrlEncode("{$documentId}:{$scope}:{$gate}:{$expiresAt}:{$signature}");
    }

    public function matches(string $token, string $documentId, string $gate): bool
    {
        $decoded = $this->base64UrlDecode($token);

        if ($decoded === false) {
            return false;
        }

        $parts = explode(':', $decoded, 5);

        return $this->verify($token) === $documentId && count($parts) === 5 && hash_equals($gate, $parts[2]);
    }

    public function verify(string $token): ?string
    {
        $decoded = $this->base64UrlDecode($token);

        if ($decoded === false) {
            return null;
        }

        $parts = explode(':', $decoded, 5);

        if (count($parts) !== 5) {
            return null;
        }

        [$documentId, $scope, $gate, $expiresAt, $signature] = $parts;

        if (! preg_match(self::DOCUMENT_ID_PATTERN, $documentId)
            || ! in_array($scope, [self::SCOPE_WRITE, self::SCOPE_READ], true)
            || ! preg_match('/^[0-9a-f]{0,12}$/', $gate)
            || ! ctype_digit($expiresAt)
            || (int) $expiresAt < time()) {
            return null;
        }

        $expected = $this->sign($documentId, $scope, $gate, (int) $expiresAt);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        return $documentId;
    }

    private function sign(string $documentId, string $scope, string $gate, int $expiresAt): string
    {
        return hash_hmac('sha256', "{$documentId}:{$scope}:{$gate}:{$expiresAt}", $this->secret);
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

        return base64_decode(strtr($value, '-_', '+/') . str_repeat('=', $padding), true);
    }
}
