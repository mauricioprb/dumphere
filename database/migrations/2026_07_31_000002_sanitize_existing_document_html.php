<?php

declare(strict_types=1);

use App\Domain\Document\Services\DocumentHtmlSanitizer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $sanitizer = app(DocumentHtmlSanitizer::class);

        DB::table('documents')
            ->select(['id', 'content_html'])
            ->orderBy('id')
            ->chunkById(100, function ($documents) use ($sanitizer): void {
                foreach ($documents as $document) {
                    $original = (string) ($document->content_html ?? '');
                    $sanitized = $sanitizer->sanitize($original);

                    if ($sanitized === $original) {
                        continue;
                    }

                    DB::table('documents')
                        ->where('id', $document->id)
                        ->update(['content_html' => $sanitized]);
                }
            });
    }

    public function down(): void
    {
        // Sanitization is intentionally irreversible.
    }
};
