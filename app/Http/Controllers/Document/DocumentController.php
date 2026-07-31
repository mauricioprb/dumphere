<?php

declare(strict_types=1);

namespace App\Http\Controllers\Document;

use App\Domain\Document\Actions\FindOrCreateDocument;
use App\Domain\Document\Actions\PersistDocumentContent;
use App\Domain\Document\DTOs\DocumentData;
use App\Domain\Document\Exceptions\DocumentTooLargeException;
use App\Domain\Document\Exceptions\TooManyDocumentsCreatedException;
use App\Domain\Document\Services\WebSocketTokenService;
use App\Http\Controllers\Controller;
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

    public function show(string $slug): Response
    {
        try {
            $document = $this->findOrCreate->execute($slug);
        } catch (TooManyDocumentsCreatedException $e) {
            abort(429, $e->getMessage());
        }

        $data = DocumentData::fromModel($document);

        return Inertia::render('Document/Show', [
            'document' => $data->toArray(),
            'wsToken' => $this->wsTokenService->generate($document->id),
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
