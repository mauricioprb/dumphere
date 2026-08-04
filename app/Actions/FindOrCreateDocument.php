<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Request;

class FindOrCreateDocument
{
    private const MAX_CREATIONS_PER_HOUR = 10;

    public function execute(string $slug): Document
    {
        $document = Document::where('slug', $slug)->first();

        if ($document === null) {
            $document = Cache::lock('doc:create:' . hash('sha256', $slug), 5)
                ->block(3, function () use ($slug): Document {
                    $existing = Document::where('slug', $slug)->first();

                    if ($existing !== null) {
                        return $existing;
                    }

                    $this->enforceCreationRateLimit();

                    return Document::create([
                        'slug' => $slug,
                        'title' => $this->slugToTitle($slug),
                        'content_html' => '',
                    ]);
                });
        }

        $stale = $document->last_accessed_at === null
            || $document->last_accessed_at->lt(now()->subMinutes(5));

        if ($stale) {
            $document->update(['last_accessed_at' => now()]);
        }

        return $document;
    }

    private function enforceCreationRateLimit(): void
    {
        $ip = Request::ip();
        $key = "doc_create_ip:{$ip}";

        $attempts = RateLimiter::hit($key, 3600);

        if ($attempts > self::MAX_CREATIONS_PER_HOUR) {
            abort(429, 'Too many documents created. Try again later.');
        }
    }

    private function slugToTitle(string $slug): string
    {
        $clean = trim($slug, '/');
        $parts = explode('/', $clean);
        $lastPart = end($parts);

        return ucwords(str_replace('-', ' ', $lastPart));
    }
}
