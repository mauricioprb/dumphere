<?php

declare(strict_types=1);

return [
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    'prices' => [
        'brl' => env('STRIPE_PRICE_BRL'),
        'usd' => env('STRIPE_PRICE_USD'),
    ],

    'years' => (int) env('STRIPE_ACCESS_YEARS', 100),
    'max_documents' => (int) env('PAID_PREFIX_MAX_DOCUMENTS', 50),
];
