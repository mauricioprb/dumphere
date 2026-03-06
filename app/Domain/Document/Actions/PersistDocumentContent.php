<?php

declare(strict_types=1);

namespace App\Domain\Document\Actions;

use App\Domain\Document\Exceptions\DocumentTooLargeException;
use App\Domain\Document\Models\Document;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PersistDocumentContent
{
    public function execute(string $slug, string $markdownContent, ?string $yjsStateBase64 = null): Document
    {
        $document = Document::where('slug', $slug)->firstOrFail();

        $contentSizeBytes = strlen($markdownContent);
        if ($contentSizeBytes > Document::MAX_SIZE_BYTES) {
            throw new DocumentTooLargeException(
                "Document '{$slug}' exceeds maximum size of " . Document::MAX_SIZE_BYTES . " bytes (current: {$contentSizeBytes} bytes)."
            );
        }

        $document->update([
            'markdown_content' => $markdownContent,
            'yjs_state' => $yjsStateBase64 ? json_decode(base64_decode($yjsStateBase64), true) : null,
            'last_accessed_at' => now(),
        ]);

        if ($yjsStateBase64) {
            Cache::put("doc:yjs:{$slug}", $yjsStateBase64, now()->addHour());
        }

        Log::info("Document '{$slug}' persisted", [
            'size_bytes' => $contentSizeBytes,
            'has_yjs_state' => (bool) $yjsStateBase64,
        ]);

        return $document;
    }
}
