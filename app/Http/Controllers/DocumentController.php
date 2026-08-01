<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\FindOrCreateDocument;
use App\Actions\PersistDocumentContent;
use App\Exceptions\DocumentTooLargeException;
use App\Exceptions\TooManyDocumentsCreatedException;
use App\Support\SeoMetadata;
use App\Support\WebSocketTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(
        private readonly FindOrCreateDocument $findOrCreate,
        private readonly PersistDocumentContent $persistContent,
        private readonly WebSocketTokenService $wsTokenService,
    ) {}

    public function show(Request $request, string $slug): Response
    {
        try {
            $document = $this->findOrCreate->execute($slug);
        } catch (TooManyDocumentsCreatedException $e) {
            abort(429, $e->getMessage());
        }

        return Inertia::render('Document/Show', [
            'document' => [
                'id' => $document->id,
                'slug' => $document->slug,
                'title' => $document->title,
                'contentHtml' => $document->content_html ?? '',
                'yjsStateBase64' => $document->yjs_state_base64,
                'updatedAt' => $document->updated_at->toISOString(),
                'createdAt' => $document->created_at->toISOString(),
            ],
            'wsToken' => $this->wsTokenService->generate($document->id),
            'seo' => SeoMetadata::forDocument(
                $request,
                filled($document->title) ? $document->title : $document->slug,
            ),
        ]);
    }

    public function save(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'contentHtml' => ['present', 'nullable', 'string'],
        ]);

        try {
            $document = $this->persistContent->execute(
                slug: $slug,
                contentHtml: $validated['contentHtml'] ?? '',
            );

            return response()->json([
                'success' => true,
                'updatedAt' => $document->updated_at->toISOString(),
            ]);
        } catch (DocumentTooLargeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 413);
        }
    }
}
