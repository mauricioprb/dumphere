<?php

declare(strict_types=1);

use App\Support\DocumentSlug;

dataset('valid document slugs', [
    'single segment' => ['notes'],
    'hyphenated segment' => ['configuration-notes'],
    'nested path' => ['team/weekly/notes'],
    'maximum length' => [str_repeat('a', DocumentSlug::MAX_LENGTH)],
]);

dataset('invalid document slugs', [
    'empty value' => [''],
    'reserved segment' => ['admin'],
    'reserved nested segment' => ['terms/privacy'],
    'trailing hyphen before separator' => ['leading-/segment'],
    'leading hyphen after separator' => ['segment-/next'],
    'empty segment' => ['one//two'],
    'too many segments' => ['one/two/three/four/five'],
    'above maximum length' => [str_repeat('a', DocumentSlug::MAX_LENGTH + 1)],
]);

it('accepts valid slugs', function (string $slug): void {
    expect(DocumentSlug::isValid($slug))->toBeTrue();
})->with('valid document slugs');

it('rejects invalid slugs', function (string $slug): void {
    expect(DocumentSlug::isValid($slug))->toBeFalse();
})->with('invalid document slugs');
