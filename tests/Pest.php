<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->beforeEach(function (): void {
    $this->withoutVite();
})->in(
    'Feature',
    'Unit/WebSocketTokenServiceTest.php',
    'Unit/MarketPriceTest.php',
);

pest()->use(LazilyRefreshDatabase::class)->in(
    'Feature/DocumentEndpointsTest.php',
    'Feature/DocumentTreeTest.php',
    'Feature/GrantPrefixCommandTest.php',
    'Feature/PaidPrefixTest.php',
    'Feature/PurgeStaleDocumentsTest.php',
    'Feature/SeoTest.php',
    'Unit/MarketPriceTest.php',
);
