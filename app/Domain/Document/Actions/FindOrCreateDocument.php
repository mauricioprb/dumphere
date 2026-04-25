<?php

declare(strict_types=1);

namespace App\Domain\Document\Actions;

use App\Domain\Document\Exceptions\TooManyDocumentsCreatedException;
use App\Domain\Document\Models\Document;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Request;

class FindOrCreateDocument
{
    private const BLACKLIST = [
        '.env', 'phpinfo', 'actuator', 'wp-admin', 'wp-login', 'config', 'settings',
        'admin', 'administrator', 'cgi-bin', 'etc', 'var', 'tmp', 'credentials',
        'swagger', 'api-docs', 'v1', 'v2', 'health', 'metrics', 'proxy', 'webfig',
    ];

    private const MAX_CREATIONS_PER_HOUR = 10;

    public function execute(string $slug): Document
    {
        $cleanSlug = trim($slug, '/');

        foreach (self::BLACKLIST as $forbidden) {
            if (str_contains($cleanSlug, $forbidden)) {
                abort(403, 'Forbidden slug.');
            }
        }

        if (substr_count($cleanSlug, '/') > 3 || strlen($cleanSlug) > 100) {
            abort(403, 'Invalid slug structure.');
        }

        $exists = Document::where('slug', $slug)->exists();

        if (! $exists) {
            $this->enforceCreationRateLimit();
        }

        $document = Document::firstOrCreate(
            ['slug' => $slug],
            [
                'title' => $this->slugToTitle($slug),
                'markdown_content' => '',
                'yjs_state' => null,
            ]
        );

        $stale = $document->last_accessed_at === null
            || $document->last_accessed_at->lt(now()->subMinutes(5));

        if ($stale) {
            $document->update(['last_accessed_at' => now()]);
        }

        Cache::put("doc:slug:{$slug}", $document->id, now()->addHour());

        return $document;
    }

    /**
     * @throws TooManyDocumentsCreatedException
     */
    private function enforceCreationRateLimit(): void
    {
        $ip = Request::ip();
        $key = "doc_create_ip:{$ip}";

        $count = Cache::get($key, 0);

        if ($count >= self::MAX_CREATIONS_PER_HOUR) {
            throw new TooManyDocumentsCreatedException;
        }

        Cache::put($key, $count + 1, now()->addHour());
    }

    private function slugToTitle(string $slug): string
    {
        $clean = trim($slug, '/');
        $parts = explode('/', $clean);
        $lastPart = end($parts);

        return ucwords(str_replace('-', ' ', $lastPart));
    }
}
