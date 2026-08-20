<?php

declare(strict_types=1);

use App\Models\Document;
use Illuminate\Support\Facades\URL;

beforeEach(function (): void {
    config()->set('app.url', 'https://dumphere.test');
    URL::forceRootUrl('https://dumphere.test');
    URL::forceScheme('https');
    $this->withoutVite();
});

it('renders indexable metadata and open graph tags on the home page', function (): void {
    $html = $this->get('/')
        ->assertOk()
        ->getContent();

    expect($html)
        ->toContain('<title>Dumphere — Collaborative Markdown editor</title>')
        ->toContain('<meta name="description" content="Create and edit Markdown documents')
        ->toContain('<meta name="robots" content="index, follow, max-image-preview:large')
        ->toContain('rel="canonical"')
        ->toContain('href="https://dumphere.test"')
        ->toContain('<meta property="og:image" content="https://dumphere.test/images/og/dumphere.png">')
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
        ->toContain('<title>Terms and Privacy — Dumphere</title>')
        ->toContain('href="https://dumphere.test/terms"')
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
        ->toContain('href="https://dumphere.test/private-draft"')
        ->not->toContain('application/ld+json');
});

it('publishes robots and sitemap discovery files', function (): void {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSeeText('Sitemap: https://dumphere.test/sitemap.xml');

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<loc>https://dumphere.test</loc>', false)
        ->assertSee('<loc>https://dumphere.test/terms</loc>', false)
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
