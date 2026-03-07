<?php

declare(strict_types=1);

namespace App\Domain\Document\Policies;

class RateLimitPolicy
{
    public const HTTP_MAX_PER_MINUTE = 60;

    public const WS_MAX_CONNECTIONS = 10;

    public const WS_MAX_MESSAGES_PER_SECOND = 30;

    public const MAX_DOCUMENT_SIZE = 512_000; // 500KB

    public const RESERVED_SLUGS = [
        'admin',
        'api',
        'health',
        'login',
        'register',
        'dashboard',
        'settings',
        'reverb',
        'broadcasting',
        'assets',
        'build',
        'favicon.ico',
        'robots.txt',
        'sitemap.xml',
    ];

    public static function isReservedSlug(string $slug): bool
    {
        $firstSegment = explode('/', trim($slug, '/'))[0];

        return in_array($firstSegment, self::RESERVED_SLUGS, true);
    }
}
