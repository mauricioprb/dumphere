<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->beforeEach(function (): void {
    $this->withoutVite();
})->in(
    'Feature',
    'Unit/WebSocketTokenServiceTest.php',
);

pest()->use(LazilyRefreshDatabase::class)->in(
    'Feature/CollaborationSchemaTest.php',
    'Feature/DocumentEndpointsTest.php',
    'Feature/DocumentTreeTest.php',
    'Feature/GrantPrefixCommandTest.php',
    'Feature/ReservedPrefixTest.php',
    'Feature/PurgeStaleDocumentsTest.php',
    'Feature/SeoTest.php',
);
