<?php

declare(strict_types=1);

namespace App\Support;

final class MarketPrice
{
    public static function market(?string $preferredLanguage): string
    {
        return str_starts_with(strtolower((string) $preferredLanguage), 'pt') ? 'brl' : 'usd';
    }

    public static function priceId(?string $preferredLanguage): string
    {
        return (string) config('stripe.prices.' . self::market($preferredLanguage));
    }
}
