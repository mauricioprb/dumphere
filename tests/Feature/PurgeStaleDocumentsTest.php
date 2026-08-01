<?php

declare(strict_types=1);

use App\Actions\PurgeStaleDocuments;
use App\Models\Document;

it('removes only documents inactive for thirty days', function (): void {
    $createDocument = function (string $slug, mixed $lastAccessedAt, mixed $createdAt): Document {
        $document = Document::create([
            'slug' => $slug,
            'title' => ucfirst($slug),
            'content_html' => '',
            'last_accessed_at' => $lastAccessedAt,
        ]);
        $document->timestamps = false;
        $document->forceFill([
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ])->save();

        return $document;
    };

    $stale = $createDocument('stale', now()->subDays(31), now()->subDays(31));
    $neverAccessed = $createDocument('never-accessed', null, now()->subDays(31));
    $recent = $createDocument('recent', now()->subDays(2), now()->subDays(40));
    $newNeverAccessed = $createDocument('new-never-accessed', null, now()->subDays(2));

    $count = app(PurgeStaleDocuments::class)->execute();

    expect($count)->toBe(2);
    $this->assertModelMissing($stale);
    $this->assertModelMissing($neverAccessed);
    $this->assertModelExists($recent);
    $this->assertModelExists($newNeverAccessed);
});

it('rejects unsafe day values in the purge command', function (): void {
    $this->artisan('documents:purge', ['--days' => 0])
        ->expectsOutput('The number of days must be at least 1.')
        ->assertFailed();
});

it('schedules the purge command daily', function (): void {
    $this->artisan('schedule:list')
        ->expectsOutputToContain('documents:purge')
        ->assertSuccessful();
});
