<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Support\Facades\Vite;
use Tests\TestCase;

class ContentSecurityPolicyTest extends TestCase
{
    public function test_it_allows_the_active_vite_development_server(): void
    {
        $hotFile = tempnam(sys_get_temp_dir(), 'vite-hot-');

        $this->assertNotFalse($hotFile);
        file_put_contents($hotFile, 'http://localhost:5173');
        Vite::useHotFile($hotFile);

        try {
            $policy = $this->get('/terms')
                ->assertOk()
                ->headers->get('Content-Security-Policy');

            $this->assertIsString($policy);
            $this->assertStringContainsString(
                "script-src 'self' 'nonce-",
                $policy,
            );
            $this->assertStringContainsString(
                'http://localhost:5173',
                $policy,
            );
            $this->assertStringContainsString(
                'connect-src',
                $policy,
            );
            $this->assertStringContainsString(
                'ws://localhost:5173',
                $policy,
            );
        } finally {
            Vite::useHotFile(public_path('hot'));
            @unlink($hotFile);
        }
    }
}
