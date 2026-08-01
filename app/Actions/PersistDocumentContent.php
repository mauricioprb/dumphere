<?php

declare(strict_types=1);

namespace App\Actions;

use App\Exceptions\DocumentTooLargeException;
use App\Models\Document;
use App\Support\DocumentHtmlSanitizer;
use Illuminate\Support\Facades\Log;

class PersistDocumentContent
{
    public function __construct(
        private readonly DocumentHtmlSanitizer $htmlSanitizer,
    ) {}

    public function execute(string $slug, string $contentHtml): Document
    {
        $document = Document::where('slug', $slug)->firstOrFail();

        $contentSizeBytes = strlen($contentHtml);
        if ($contentSizeBytes > Document::MAX_SIZE_BYTES) {
            throw new DocumentTooLargeException(
                "Document '{$slug}' exceeds maximum size of " . Document::MAX_SIZE_BYTES . " bytes (current: {$contentSizeBytes} bytes)."
            );
        }

        $contentHtml = $this->htmlSanitizer->sanitize($contentHtml);

        $document->update([
            'content_html' => $contentHtml,
            'last_accessed_at' => now(),
        ]);

        Log::info('Document content persisted', [
            'document_id' => $document->id,
            'size_bytes' => $contentSizeBytes,
        ]);

        return $document;
    }
}
