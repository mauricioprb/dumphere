<?php

declare(strict_types=1);

namespace App\Domain\Document\Support;

final class DocumentSlug
{
    public const MAX_LENGTH = 100;

    public const MAX_SEGMENTS = 4;

    private const SEGMENT_PATTERN = '/^[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/';

    private const RESERVED_FIRST_SEGMENTS = [
        'admin',
        'api',
        'assets',
        'broadcasting',
        'build',
        'dashboard',
        'favicon',
        'health',
        'login',
        'register',
        'reverb',
        'robots',
        'settings',
        'sitemap',
        'terms',
        'up',
        'vendor',
    ];

    public static function normalize(string $slug): string
    {
        return strtolower(trim($slug, '/'));
    }

    public static function isValid(string $slug): bool
    {
        $slug = self::normalize($slug);

        if ($slug === '' || strlen($slug) > self::MAX_LENGTH) {
            return false;
        }

        if (substr_count($slug, '/') >= self::MAX_SEGMENTS || str_contains($slug, '//')) {
            return false;
        }

        foreach (explode('/', $slug) as $segment) {
            if (preg_match(self::SEGMENT_PATTERN, $segment) !== 1) {
                return false;
            }
        }

        return ! in_array(explode('/', $slug, 2)[0], self::RESERVED_FIRST_SEGMENTS, true);
    }
}
