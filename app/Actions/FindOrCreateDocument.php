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

    /**
     * @param  bool  $trusted  Owners creating pages inside the address they paid for.
     *                         The per-IP limit exists to stop strangers spamming new
     *                         documents, which is not what an owner is doing.
     */
    public function execute(string $slug, bool $trusted = false): Document
    {
        $document = Document::where('slug', $slug)->first();

        if ($document === null) {
            $document = Cache::lock('doc:create:' . hash('sha256', $slug), 5)
                ->block(3, function () use ($slug, $trusted): Document {
                    $existing = Document::where('slug', $slug)->first();

                    if ($existing !== null) {
                        return $existing;
                    }

                    if (! $trusted) {
                        $this->enforceCreationRateLimit();
                    }

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
            abort(response('', 429, ['Retry-After' => (string) RateLimiter::availableIn($key)]));
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
