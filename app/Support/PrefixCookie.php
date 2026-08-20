<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

/**
 * Owner convenience cookie for a paid prefix — never the source of truth.
 *
 * It is derived from the owner password, so changing that password revokes every
 * cookie still in circulation. Losing it costs a retype, never access.
 *
 * Visitors get no cookie on purpose: a stored grant would outlive the owner's
 * decision to close the page again.
 */
final class PrefixCookie
{
    public const OWNER = 'owner';

    private const LIFETIME_MINUTES = [
        self::OWNER => 60 * 24 * 7,
    ];

    /**
     * Starts a fresh owner session, retiring whichever one was active. Only one
     * browser holds the privilege at a time; signing in elsewhere ends this one.
     */
    public static function claim(Document $document): SymfonyCookie
    {
        $document->forceFill(['owner_session_id' => Str::random(40)])->save();

        // Whoever was holding the privilege elsewhere is disconnected and re-evaluated.
        $document->announceRulesChanged();

        return self::issue($document, self::OWNER);
    }

    public static function issue(Document $document, string $scope): SymfonyCookie
    {
        return Cookie::make(
            self::name($document, $scope),
            (string) self::value($document, $scope),
            self::LIFETIME_MINUTES[$scope],
        );
    }

    public static function held(Request $request, Document $document, string $scope): bool
    {
        $expected = self::value($document, $scope);
        $presented = (string) $request->cookie(self::name($document, $scope), '');

        return $expected !== null && $presented !== '' && hash_equals($expected, $presented);
    }

    private static function name(Document $document, string $scope): string
    {
        return "dh_{$scope}_" . substr(hash('sha256', $document->slug), 0, 16);
    }

    private static function value(Document $document, string $scope): ?string
    {
        $secret = $document->owner_password_hash;
        $session = $document->owner_session_id;

        return $secret === null || $session === null
            ? null
            : substr(hash('sha256', $scope . ':' . $secret . ':' . $session), 0, 32);
    }
}
