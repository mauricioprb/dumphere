<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use App\Support\DocumentSlug;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Request;

class FindOrCreateDocument
{
    private const MAX_CREATIONS_PER_HOUR = 10;

    public function execute(string $slug, ?Document $owner = null): Document
    {
        $document = Document::where('slug', $slug)->first();

        if ($document === null) {
            $document = $owner === null
                ? $this->createFreeDocument($slug)
                : $this->createOwnedDocument($slug, $owner);
        }

        $stale = $document->last_accessed_at === null
            || $document->last_accessed_at->lt(now()->subMinutes(5));

        if ($stale) {
            $document->update(['last_accessed_at' => now()]);
        }

        return $document;
    }

    private function createFreeDocument(string $slug): Document
    {
        return Cache::lock('doc:create:' . hash('sha256', $slug), 5)
            ->block(3, function () use ($slug): Document {
                $existing = Document::where('slug', $slug)->first();

                if ($existing !== null) {
                    return $existing;
                }

                $this->enforceCreationRateLimit();

                return $this->createDocument($slug);
            });
    }

    private function createOwnedDocument(string $slug, Document $owner): Document
    {
        return DB::transaction(function () use ($slug, $owner): Document {
            $lockedOwner = Document::query()->lockForUpdate()->find($owner->getKey());

            abort_unless(
                $lockedOwner !== null
                && $lockedOwner->paid_until?->isFuture()
                && DocumentSlug::root($slug) === $lockedOwner->slug,
                403,
            );

            $existing = Document::where('slug', $slug)->first();

            if ($existing !== null) {
                return $existing;
            }

            $documentCount = Document::query()
                ->where('slug', $lockedOwner->slug)
                ->orWhere('slug', 'like', $lockedOwner->slug . '/%')
                ->count();

            abort_if($documentCount >= max(1, (int) config('stripe.max_documents')), 409);

            return $this->createDocument($slug);
        }, attempts: 5);
    }

    private function createDocument(string $slug): Document
    {
        return Document::create([
            'slug' => $slug,
            'title' => $this->slugToTitle($slug),
            'content_html' => '',
        ]);
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
