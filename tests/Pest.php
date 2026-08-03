<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->in(
    'Feature',
    'Unit/WebSocketTokenServiceTest.php',
);

pest()->use(LazilyRefreshDatabase::class)->in(
    'Feature/DocumentEndpointsTest.php',
    'Feature/DocumentTreeTest.php',
    'Feature/PurgeStaleDocumentsTest.php',
    'Feature/SeoTest.php',
);
