import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('global navigation links', () => {
    it('uses direct Inertia visits without racing a prefetched response', () => {
        const navigationSources = [
            readSource('resources/js/Components/Layout/ExternalPageShell.vue'),
            readSource('resources/js/Pages/Home.vue'),
            readSource('resources/js/Pages/Terms.vue'),
            readSource('resources/js/Pages/Document/Show.vue'),
        ];

        expect(navigationSources[0]).toContain('href="/"');
        expect(navigationSources[1]).toContain('href="/terms"');
        expect(navigationSources[2]).toContain('href="/"');
        expect(navigationSources[3]).toContain('href="/"');

        for (const source of navigationSources) {
            expect(source).toContain("from '@inertiajs/vue3'");
            expect(source).toContain('<Link');
            expect(source).not.toMatch(/<Link\s[^>]*\bprefetch\b/);
        }
    });
});
