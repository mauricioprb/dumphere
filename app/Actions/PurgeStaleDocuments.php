<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Facades\Log;

class PurgeStaleDocuments
{
    private const DEFAULT_STALE_DAYS = 30;

    public function execute(int $staleDays = self::DEFAULT_STALE_DAYS): int
    {
        $threshold = now()->subDays($staleDays);

        $count = 0;

        Document::query()
            ->where(function ($query) use ($threshold): void {
                $query->where('last_accessed_at', '<', $threshold)
                    ->orWhere(function ($query) use ($threshold): void {
                        $query->whereNull('last_accessed_at')
                            ->where('created_at', '<', $threshold);
                    });
            })
            ->chunkById(100, function ($documents) use (&$count): void {
                foreach ($documents as $document) {
                    $document->delete();
                    $count++;
                }
            });

        Log::info("Purged {$count} stale documents older than {$staleDays} days.");

        return $count;
    }
}
