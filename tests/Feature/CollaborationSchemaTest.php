<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schema;

it('only reads document columns that still exist', function (): void {
    $sql = file_get_contents(base_path('yjs-server/server.mjs'));

    preg_match_all('/\b(?:d|owner)\.([a-z_]+)\b/', $sql, $matches);
    $columns = array_unique($matches[1]);

    expect($columns)->not->toBeEmpty();

    foreach ($columns as $column) {
        expect(Schema::hasColumn('documents', $column))
            ->toBeTrue("yjs-server/server.mjs reads documents.{$column}, which is not in the schema");
    }
});
