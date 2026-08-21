<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Str;

final class RecoveryKey
{
    public static function generate(): string
    {
        return Str::random(40);
    }

    public static function digest(string $key): string
    {
        return hash('sha256', $key);
    }

    public static function matches(string $key, ?string $digest): bool
    {
        return $key !== ''
            && $digest !== null
            && hash_equals($digest, self::digest($key));
    }
}
