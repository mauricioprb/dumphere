<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\FindOrCreateDocument;
use App\Actions\ListDocumentChildren;
use App\Actions\PersistDocumentContent;
use App\Actions\ResolvePrefixPrice;
use App\Models\Document;
use App\Support\ErrorPage;
use App\Support\PrefixCookie;
use App\Support\SeoMetadata;
use App\Support\WebSocketTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class DocumentController
{
    public function __construct(
        private readonly FindOrCreateDocument $findOrCreate,
        private readonly ListDocumentChildren $listDocumentChildren,
        private readonly PersistDocumentContent $persistContent,
        private readonly WebSocketTokenService $wsTokenService,
        private readonly ResolvePrefixPrice $resolvePrice,
    ) {}

    public function show(Request $request, string $slug, bool $unlocked = false): Response|SymfonyResponse
    {
        $owner = Document::prefixOwner($slug);
        $isOwner = $owner !== null && PrefixCookie::held($request, $owner, PrefixCookie::OWNER);

        if (! $isOwner && ! $unlocked && $owner?->visitor_password_hash !== null) {
            return Inertia::render('Document/Locked', [
                'slug' => $slug,
                'themeHue' => $owner->theme_hue,
                'themeChroma' => $owner->theme_chroma,
                'themeHueDark' => $owner->theme_hue_dark,
                'themeChromaDark' => $owner->theme_chroma_dark,
                'seo' => SeoMetadata::forDocument($request, $slug),
            ])->withViewData(self::themeViewData($owner));
        }

        if ($owner !== null && ! $isOwner && ! Document::where('slug', $slug)->exists()) {
            return ErrorPage::render($request, 404, 'taken', $owner->slug);
        }

        $readonly = $owner?->readonly === true && ! $isOwner;
        $document = $this->findOrCreate->execute($slug, trusted: $isOwner);

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
            'paid' => $owner !== null,
            'isOwner' => $isOwner,
            'themeHue' => $owner?->theme_hue,
            'themeChroma' => $owner?->theme_chroma,
            'themeHueDark' => $owner?->theme_hue_dark,
            'themeChromaDark' => $owner?->theme_chroma_dark,
            'price' => $owner === null
                ? $this->resolvePrice->execute($request->getPreferredLanguage(['en', 'pt-BR']))
                : null,
            'readonly' => $readonly,
            'readonlyForVisitors' => $owner?->readonly === true,
            'lockedForVisitors' => $owner?->visitor_password_hash !== null,
            'wsToken' => $this->wsTokenService->generate(
                $document->id,
                $readonly ? WebSocketTokenService::SCOPE_READ : WebSocketTokenService::SCOPE_WRITE,
                WebSocketTokenService::gate(
                    $owner?->readonly === true,
                    $owner?->visitor_password_hash,
                    $owner?->owner_session_id,
                ),
            ),
            'seo' => SeoMetadata::forDocument(
                $request,
                filled($document->title) ? $document->title : $document->slug,
            ),
        ])->withViewData(self::themeViewData($owner));
    }

    public function destroy(Request $request, string $slug): JsonResponse
    {
        $owner = Document::prefixOwner($slug);

        abort_if($owner === null || ! PrefixCookie::held($request, $owner, PrefixCookie::OWNER), 403);
        abort_if($slug === $owner->slug, 422, 'The address itself cannot be deleted.');

        $target = Document::where('slug', $slug)->first();

        $removed = Document::query()
            ->where('slug', $slug)
            ->orWhere('slug', 'like', $slug . '/%')
            ->delete();

        $target?->announceDeleted();

        return response()->json(['removed' => $removed]);
    }

    public function tree(string $slug): JsonResponse
    {
        return response()->json([
            'children' => $this->listDocumentChildren->execute($slug),
        ]);
    }

    public function unlock(Request $request, string $slug): Response
    {
        $owner = Document::prefixOwner($slug);

        if ($owner?->visitor_password_hash === null
            || ! Hash::check((string) $request->input('password'), $owner->visitor_password_hash)) {
            throw ValidationException::withMessages(['password' => __('prefix.wrong_visitor_password')]);
        }

        return $this->show($request, $slug, unlocked: true);
    }

    public function save(Request $request, string $slug): JsonResponse
    {
        $owner = Document::prefixOwner($slug);
        $isOwner = $owner !== null && PrefixCookie::held($request, $owner, PrefixCookie::OWNER);

        if (! $isOwner) {
            abort_if($owner?->readonly === true, 403, 'This page is read-only.');

            if ($owner?->visitor_password_hash !== null && ! $this->wsTokenService->matches(
                (string) $request->input('wsToken'),
                $this->findOrCreate->execute($slug)->id,
                WebSocketTokenService::gate(
                    $owner->readonly,
                    $owner->visitor_password_hash,
                    $owner->owner_session_id,
                ),
            )) {
                abort(403, 'This page is locked.');
            }
        }

        $validated = $request->validate([
            'contentHtml' => ['present', 'nullable', 'string'],
        ]);

        $document = $this->persistContent->execute(
            slug: $slug,
            contentHtml: $validated['contentHtml'] ?? '',
        );

        return response()->json([
            'success' => true,
            'updatedAt' => $document->updated_at->toISOString(),
        ]);
    }

    /** @return array<string, int|null> */
    private static function themeViewData(?Document $owner): array
    {
        return [
            'themeHue' => $owner?->theme_hue,
            'themeChroma' => $owner?->theme_chroma,
            'themeHueDark' => $owner?->theme_hue_dark,
            'themeChromaDark' => $owner?->theme_chroma_dark,
        ];
    }

    private static function unlockCookie(Document $owner): string
    {
        return 'dh_unlock_' . substr(hash('sha256', $owner->slug), 0, 16);
    }

    private static function unlockValue(Document $owner): string
    {
        return substr(hash('sha256', (string) $owner->visitor_password_hash), 0, 32);
    }

    private function isUnlocked(Request $request, Document $owner): bool
    {
        return PrefixCookie::held($request, $owner, PrefixCookie::VISITOR);
    }
}
