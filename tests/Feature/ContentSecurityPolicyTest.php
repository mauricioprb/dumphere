<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Vite;

it('allows the active vite development server', function (): void {
    $hotFile = tempnam(sys_get_temp_dir(), 'vite-hot-');

    expect($hotFile)->not->toBeFalse();
    file_put_contents($hotFile, 'http://localhost:5173');
    Vite::useHotFile($hotFile);

    try {
        $policy = $this->get('/terms')
            ->assertOk()
            ->headers->get('Content-Security-Policy');

        expect($policy)
            ->toBeString()
            ->toContain("script-src 'self' 'nonce-")
            ->toContain('http://localhost:5173')
            ->toContain('connect-src')
            ->toContain('ws://localhost:5173');
    } finally {
        Vite::useHotFile(public_path('hot'));
        @unlink($hotFile);
    }
});

it('protects the inline loader styles with the request nonce', function (): void {
    $content = $this->get('/terms')
        ->assertOk()
        ->getContent();

    expect($content)->toMatch('/<style nonce="[^"]+">\s*:root\s*\{/');
});
