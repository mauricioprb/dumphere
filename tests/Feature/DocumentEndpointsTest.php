<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Document\Models\Document;
use App\Domain\Document\Services\WebSocketTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DocumentEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_and_opens_a_normalized_document(): void
    {
        $this->withoutVite();

        $this->get('/Configuration-Notes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Document/Show')
                ->where('document.slug', 'configuration-notes')
                ->where('document.contentHtml', '')
                ->where('document.yjsStateBase64', null)
                ->has('wsToken'));

        $this->assertDatabaseHas('documents', [
            'slug' => 'configuration-notes',
            'content_html' => '',
        ]);
    }

    public function test_it_rejects_reserved_or_invalid_slugs(): void
    {
        $this->get('/admin')->assertNotFound();
        $this->get('/one/two/three/four/five')->assertNotFound();
        $this->get('/trailing-')->assertNotFound();
    }

    public function test_it_persists_an_empty_document(): void
    {
        $document = Document::create([
            'slug' => 'clear-me',
            'title' => 'Clear Me',
            'content_html' => '<p>old content</p>',
        ]);

        $this->postJson('/clear-me/save', ['contentHtml' => ''])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame('', $document->fresh()->content_html);
    }

    public function test_it_exposes_the_persisted_collaboration_snapshot_and_a_scoped_token(): void
    {
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

        $this->assertSame(
            $document->id,
            app(WebSocketTokenService::class)->verify($token),
        );
    }

    public function test_it_returns_payload_too_large_for_content_over_the_byte_limit(): void
    {
        Document::create([
            'slug' => 'large',
            'title' => 'Large',
            'content_html' => '',
        ]);

        $this->postJson('/large/save', [
            'contentHtml' => str_repeat('a', Document::MAX_SIZE_BYTES + 1),
        ])->assertStatus(413);
    }

    public function test_it_sanitizes_html_before_persisting_it(): void
    {
        $document = Document::create([
            'slug' => 'sanitize-me',
            'title' => 'Sanitize Me',
            'content_html' => '',
        ]);

        $this->postJson('/sanitize-me/save', [
            'contentHtml' => '<p onclick="alert(1)">Safe</p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)">',
        ])->assertOk();

        $persisted = $document->fresh()->content_html;

        $this->assertStringContainsString('<p>Safe</p>', $persisted);
        $this->assertStringNotContainsString('script', $persisted);
        $this->assertStringNotContainsString('onclick', $persisted);
        $this->assertStringNotContainsString('onerror', $persisted);
        $this->assertStringNotContainsString('javascript:', $persisted);
    }

    public function test_the_security_migration_sanitizes_existing_document_html(): void
    {
        $document = Document::create([
            'slug' => 'legacy-content',
            'title' => 'Legacy Content',
            'content_html' => '<p onmouseover="alert(1)">Legacy</p><svg onload="alert(1)"></svg>',
        ]);

        $migration = require database_path(
            'migrations/2026_07_31_000002_sanitize_existing_document_html.php'
        );
        $migration->up();

        $persisted = $document->fresh()->content_html;

        $this->assertStringContainsString('<p>Legacy</p>', $persisted);
        $this->assertStringNotContainsString('onmouseover', $persisted);
        $this->assertStringNotContainsString('svg', $persisted);
        $this->assertStringNotContainsString('onload', $persisted);
    }

    public function test_it_limits_new_document_creation_per_ip(): void
    {
        $this->withoutVite();

        foreach (range(1, 10) as $number) {
            $this->get("/document-{$number}")->assertOk();
        }

        $this->get('/document-11')->assertTooManyRequests();
        $this->assertDatabaseCount('documents', 10);
    }

    public function test_existing_documents_do_not_consume_the_creation_limit(): void
    {
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
    }
}
