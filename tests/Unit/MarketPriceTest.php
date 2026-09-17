<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

it('opens documents without payment pricing for every language', function (?string $language): void {
    $this->withoutVite();

    if ($language !== null) {
        $this->withHeader('Accept-Language', $language);
    }

    $this->get('/notes')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Document/Show')
        ->where('paid', false)
        ->missing('price'));
})->with([
    'brazilian portuguese' => ['pt-BR'],
    'european portuguese' => ['pt-PT'],
    'bare portuguese' => ['pt'],
    'english' => ['en'],
    'american english' => ['en-US'],
    'german' => ['de-DE'],
    'unknown' => [''],
    'missing language' => [null],
]);
