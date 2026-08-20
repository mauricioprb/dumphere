<?php

declare(strict_types=1);

use App\Support\MarketPrice;

it('sends brazilian visitors to the brazilian price', function (string $language, string $market): void {
    expect(MarketPrice::market($language))->toBe($market);
})->with([
    'brazilian portuguese' => ['pt-BR', 'brl'],
    'european portuguese' => ['pt-PT', 'brl'],
    'bare portuguese' => ['pt', 'brl'],
    'english' => ['en', 'usd'],
    'american english' => ['en-US', 'usd'],
    'german' => ['de-DE', 'usd'],
    'unknown' => ['', 'usd'],
]);

it('falls back to the dollar price when the language is missing', function (): void {
    expect(MarketPrice::market(null))->toBe('usd');
});
