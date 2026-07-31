<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Document\Actions\PurgeStaleDocuments;
use App\Domain\Document\Models\Document;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurgeStaleDocumentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_removes_only_documents_inactive_for_thirty_days(): void
    {
        $stale = $this->document('stale', now()->subDays(31), now()->subDays(31));
        $neverAccessed = $this->document('never-accessed', null, now()->subDays(31));
        $recent = $this->document('recent', now()->subDays(2), now()->subDays(40));
        $newNeverAccessed = $this->document('new-never-accessed', null, now()->subDays(2));

        $count = app(PurgeStaleDocuments::class)->execute();

        $this->assertSame(2, $count);
        $this->assertModelMissing($stale);
        $this->assertModelMissing($neverAccessed);
        $this->assertModelExists($recent);
        $this->assertModelExists($newNeverAccessed);
    }

    public function test_the_purge_command_rejects_unsafe_day_values(): void
    {
        $this->artisan('documents:purge', ['--days' => 0])
            ->expectsOutput('The number of days must be at least 1.')
            ->assertFailed();
    }

    public function test_the_purge_command_is_scheduled_daily(): void
    {
        $this->artisan('schedule:list')
            ->expectsOutputToContain('documents:purge')
            ->assertSuccessful();
    }

    private function document(string $slug, mixed $lastAccessedAt, mixed $createdAt): Document
    {
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
    }
}
