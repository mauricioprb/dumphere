<?php

declare(strict_types=1);

namespace App\WebSocket\Handlers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class YjsSyncHandler
{
    public function getState(string $slug): ?string
    {
        return Cache::get("doc:yjs:{$slug}");
    }

    public function applyUpdate(string $slug, string $stateBase64): void
    {
        Cache::put("doc:yjs:{$slug}", $stateBase64, now()->addHour());

        Log::debug("Yjs state updated for document '{$slug}'", [
            'state_size' => strlen($stateBase64),
        ]);
    }
}
