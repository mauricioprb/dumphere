<?php

declare(strict_types=1);

namespace App\Actions;

use App\Support\MarketPrice;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use NumberFormatter;
use Stripe\StripeClient;
use Throwable;

class ResolvePrefixPrice
{
    private const TTL_SECONDS = 86400;

    public function __construct(private readonly StripeClient $stripe) {}

    public function execute(?string $preferredLanguage): ?string
    {
        $priceId = MarketPrice::priceId($preferredLanguage);

        if ($priceId === '') {
            return null;
        }

        return Cache::remember("prefix-price:{$priceId}", self::TTL_SECONDS, function () use ($priceId): ?string {
            try {
                $price = $this->stripe->prices->retrieve($priceId);
            } catch (Throwable $exception) {
                Log::warning('Could not read the prefix price from Stripe.', ['message' => $exception->getMessage()]);

                return null;
            }

            if ($price->unit_amount === null) {
                return null;
            }

            $currency = strtoupper((string) $price->currency);
            $formatter = new NumberFormatter(
                $currency === 'BRL' ? 'pt_BR' : 'en_US',
                NumberFormatter::CURRENCY,
            );

            return $formatter->formatCurrency($price->unit_amount / 100, $currency) ?: null;
        });
    }
}
