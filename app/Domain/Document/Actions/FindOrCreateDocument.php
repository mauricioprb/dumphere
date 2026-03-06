<?php

declare(strict_types=1);

namespace App\Domain\Document\Actions;

use App\Domain\Document\Models\Document;
use Illuminate\Support\Facades\Cache;

class FindOrCreateDocument
{
    public function execute(string $slug): Document
    {
        $document = Document::firstOrCreate(
            ['slug' => $slug],
            [
                'title' => $this->slugToTitle($slug),
                'markdown_content' => '',
                'yjs_state' => null,
            ]
        );

        $document->update(['last_accessed_at' => now()]);

        Cache::put("doc:slug:{$slug}", $document->id, now()->addHour());

        return $document;
    }

    private function slugToTitle(string $slug): string
    {
        $clean = trim($slug, '/');
        $parts = explode('/', $clean);
        $lastPart = end($parts);

        return ucwords(str_replace('-', ' ', $lastPart));
    }
}
