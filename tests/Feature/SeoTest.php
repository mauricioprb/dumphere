<?php

declare(strict_types=1);

use App\Models\Document;

beforeEach(function (): void {
    $this->withoutVite();
});

it('renders indexable metadata and open graph tags on the home page', function (): void {
    $html = $this->get('/')
        ->assertOk()
        ->getContent();

    expect($html)
        ->toContain('<title>Dumphere — Editor Markdown colaborativo</title>')
        ->toContain('<meta name="description" content="Crie e edite documentos Markdown')
        ->toContain('<meta name="robots" content="index, follow, max-image-preview:large')
        ->toContain('rel="canonical"')
        ->toContain('href="http://localhost:8000"')
        ->toContain('<meta property="og:image" content="http://localhost:8000/images/og/dumphere.png">')
        ->toContain('<meta property="og:image:width" content="1200">')
        ->toContain('<meta property="og:image:height" content="630">')
        ->toContain('<meta name="twitter:card" content="summary_large_image">')
        ->toContain('"@type":"WebApplication"');
});

it('uses page-specific metadata for the terms page', function (): void {
    $html = $this->get('/terms')
        ->assertOk()
        ->getContent();

    expect($html)
        ->toContain('<title>Termos e Privacidade — Dumphere</title>')
        ->toContain('href="http://localhost:8000/terms"')
        ->toContain('"@type":"WebPage"');
});

it('prevents collaborative documents from being indexed', function (): void {
    Document::create([
        'slug' => 'private-draft',
        'title' => 'Private Draft',
        'content_html' => '',
    ]);

    $html = $this->get('/private-draft')
        ->assertOk()
        ->getContent();

    expect($html)
        ->toContain('<title>Private Draft — Dumphere</title>')
        ->toContain('<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">')
        ->toContain('href="http://localhost:8000/private-draft"')
        ->not->toContain('application/ld+json');
});

it('publishes robots and sitemap discovery files', function (): void {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSeeText('Sitemap: http://localhost:8000/sitemap.xml');

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<loc>http://localhost:8000</loc>', false)
        ->assertSee('<loc>http://localhost:8000/terms</loc>', false)
        ->assertDontSee('private-draft');
});

it('ships a correctly sized open graph image', function (): void {
    $dimensions = getimagesize(public_path('images/og/dumphere.png'));

    expect($dimensions)
        ->not->toBeFalse()
        ->and($dimensions[0])->toBe(1200)
        ->and($dimensions[1])->toBe(630)
        ->and($dimensions['mime'])->toBe('image/png');
});
