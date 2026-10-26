<?php

declare(strict_types=1);

namespace Dumphere;

final class OwnerToken
{
    public static function newSession(): string
    {
        return bin2hex(random_bytes(20));
    }

    public static function for(?string $passwordHash, ?string $sessionId): ?string
    {
        return $passwordHash === null || $sessionId === null
            ? null
            : substr(hash('sha256', 'owner:' . $passwordHash . ':' . $sessionId), 0, 32);
    }

    public static function matches(mixed $presented, ?string $passwordHash, ?string $sessionId): bool
    {
        $expected = self::for($passwordHash, $sessionId);

        return $expected !== null && is_string($presented) && $presented !== '' && hash_equals($expected, $presented);
    }
}
