<?php

declare(strict_types=1);

namespace App\Domain\Document\Actions;

use App\Domain\Document\Models\Document;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PurgeStaleDocuments
{
    private const DEFAULT_STALE_DAYS = 30;

    public function execute(int $staleDays = self::DEFAULT_STALE_DAYS): int
    {
        $threshold = now()->subDays($staleDays);

        $staleDocuments = Document::where('last_accessed_at', '<', $threshold)
            ->orWhereNull('last_accessed_at')
            ->where('created_at', '<', $threshold)
            ->get();

        $count = $staleDocuments->count();

        foreach ($staleDocuments as $document) {
            Cache::forget("doc:slug:{$document->slug}");
            Cache::forget("doc:yjs:{$document->slug}");

            $document->delete();
        }

        Log::info("Purged {$count} stale documents older than {$staleDays} days.");

        return $count;
    }
}
