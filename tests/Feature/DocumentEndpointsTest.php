<?php

declare(strict_types=1);

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Document;
use App\Support\WebSocketTokenService;
use Inertia\Testing\AssertableInertia as Assert;

it('creates and opens a normalized document', function (): void {
    $this->withoutVite();
    config(['prefix.max_documents' => 37]);

    $this->get('/Configuration-Notes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Document/Show')
            ->where('document.slug', 'configuration-notes')
            ->where('document.contentHtml', '')
            ->where('document.yjsStateBase64', null)
            ->where('maxDocuments', 37)
            ->has('wsToken'));

    $document = Document::query()
        ->where('slug', 'configuration-notes')
        ->first();

    expect($document)
        ->not->toBeNull()
        ->and($document?->content_html)->toBe('');
});

it('rejects reserved or invalid slugs', function (): void {
    $this->get('/admin')->assertNotFound();
    $this->get('/one/two/three/four/five')->assertNotFound();
    $this->get('/trailing-')->assertNotFound();
});

it('persists an empty document', function (): void {
    $document = Document::create([
        'slug' => 'clear-me',
        'title' => 'Clear Me',
        'content_html' => '<p>old content</p>',
    ]);

    $this->postJson('/clear-me/save', ['contentHtml' => ''])
        ->assertOk()
        ->assertJsonPath('success', true);

    expect($document->fresh()->content_html)->toBe('');
});

it('exposes the persisted collaboration snapshot and a scoped token', function (): void {
    $this->withoutVite();
    $document = Document::create([
        'slug' => 'collaboration',
        'title' => 'Collaboration',
        'content_html' => '<p>Saved</p>',
        'yjs_state_base64' => 'AQID',
    ]);

    $response = $this->get('/collaboration')->assertOk();
    $token = $response->viewData('page')['props']['wsToken'];

    $response->assertInertia(fn (Assert $page) => $page
        ->where('document.id', $document->id)
        ->where('document.contentHtml', '<p>Saved</p>')
        ->where('document.yjsStateBase64', 'AQID'));

    expect(app(WebSocketTokenService::class)->verify($token))->toBe($document->id);
});

it('returns payload too large for content over the byte limit', function (): void {
    Document::create([
        'slug' => 'large',
        'title' => 'Large',
        'content_html' => '',
    ]);

    $this->postJson('/large/save', [
        'contentHtml' => str_repeat('a', Document::MAX_SIZE_BYTES + 1),
    ])->assertStatus(413);
});

it('sanitizes html before persisting it', function (): void {
    $document = Document::create([
        'slug' => 'sanitize-me',
        'title' => 'Sanitize Me',
        'content_html' => '',
    ]);

    $this->postJson('/sanitize-me/save', [
        'contentHtml' => '<p onclick="alert(1)">Safe</p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)">',
    ])->assertOk();

    expect($document->fresh()->content_html)
        ->toContain('<p>Safe</p>')
        ->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('onerror')
        ->not->toContain('javascript:');
});

it('sanitizes existing document html through the security migration', function (): void {
    $document = Document::create([
        'slug' => 'legacy-content',
        'title' => 'Legacy Content',
        'content_html' => '<p onmouseover="alert(1)">Legacy</p><svg onload="alert(1)"></svg>',
    ]);

    $migration = require database_path(
        'migrations/2026_07_31_000002_sanitize_existing_document_html.php'
    );
    $migration->up();

    expect($document->fresh()->content_html)
        ->toContain('<p>Legacy</p>')
        ->not->toContain('onmouseover')
        ->not->toContain('svg')
        ->not->toContain('onload');
});

it('limits new document creation per ip', function (): void {
    $this->withoutVite();

    foreach (range(1, 10) as $number) {
        $this->get("/document-{$number}")->assertOk();
    }

    $this->get('/document-11')->assertTooManyRequests();
    $this->assertDatabaseCount('documents', 10);
});

it('does not consume the creation limit for existing documents', function (): void {
    $this->withoutVite();

    Document::create([
        'slug' => 'existing',
        'title' => 'Existing',
        'content_html' => '',
    ]);

    foreach (range(1, 20) as $attempt) {
        $this->get('/existing')->assertOk();
    }

    $this->assertDatabaseCount('documents', 1);
});

it('mints a fresh websocket token on a partial reload', function (): void {
    $this->withoutVite();

    $document = Document::create([
        'slug' => 'long-lived-tab',
        'title' => 'Long Lived Tab',
        'content_html' => '',
    ]);

    $response = $this->get('/long-lived-tab', [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (new HandleInertiaRequests)->version(request()),
        'X-Inertia-Partial-Component' => 'Document/Show',
        'X-Inertia-Partial-Data' => 'wsToken',
    ])->assertOk();

    $props = $response->json('props');

    expect($props)->toHaveKey('wsToken')
        ->and($props)->not->toHaveKey('document')
        ->and(app(WebSocketTokenService::class)->verify($props['wsToken']))->toBe($document->id);
});
