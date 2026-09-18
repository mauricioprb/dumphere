<?php

declare(strict_types=1);

use App\Models\Document;
use Illuminate\Support\Facades\Hash;

it('reserves a special address without a payment provider', function (): void {
    $this->artisan('prefix:grant', [
        'address' => 'Studio',
        '--password' => 'owner secret',
        '--years' => 5,
        '--readonly' => true,
        '--visitor-password' => 'team secret',
        '--hue' => 210,
        '--saturation' => 0,
    ])->assertSuccessful();

    $document = Document::where('slug', 'studio')->first();

    expect($document)->not->toBeNull()
        ->and($document->reserved_until->year)->toBe(now()->addYears(5)->year)
        ->and(Hash::check('owner secret', $document->owner_password_hash))->toBeTrue()
        ->and(Hash::check('team secret', $document->visitor_password_hash))->toBeTrue()
        ->and($document->readonly)->toBeTrue()
        ->and($document->theme_hue)->toBe(210)
        ->and($document->theme_chroma)->toBe(0);
});

it('refuses addresses with slashes, reserved words or impossible settings', function (): void {
    $this->artisan('prefix:grant', ['address' => 'a/b', '--password' => 'x'])->assertFailed();
    $this->artisan('prefix:grant', ['address' => 'terms', '--password' => 'x'])->assertFailed();
    $this->artisan('prefix:grant', ['address' => 'ok', '--password' => 'x', '--hue' => 400])->assertFailed();
    $this->artisan('prefix:grant', ['address' => 'ok', '--password' => 'x', '--years' => 0])->assertFailed();

    expect(Document::count())->toBe(0);
});

it('takes over an address that already exists, keeping its content', function (): void {
    Document::create(['slug' => 'notes', 'title' => 'Notes', 'content_html' => '<p>written before</p>']);

    $this->artisan('prefix:grant', ['address' => 'notes', '--password' => 'owner secret'])->assertSuccessful();

    $document = Document::where('slug', 'notes')->first();

    expect($document->content_html)->toBe('<p>written before</p>')
        ->and($document->reserved_until)->not->toBeNull();
});
