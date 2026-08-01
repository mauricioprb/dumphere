import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('SEO head', () => {
    it('centralizes canonical, Open Graph, and Twitter metadata', () => {
        const component = readSource('resources/js/Components/UI/SeoHead.vue');
        const layout = readSource('resources/js/Components/Layout/AppLayout.vue');

        expect(layout).toContain('<SeoHead />');
        expect(component).toContain('head-key="canonical"');
        expect(component).toContain('property="og:image"');
        expect(component).toContain('property="og:image:width"');
        expect(component).toContain('name="twitter:card"');
        expect(component).toContain('content="summary_large_image"');
        expect(component).toContain('type="application/ld+json"');
    });

    it('removes competing page-level head declarations', () => {
        const pages = [
            readSource('resources/js/Pages/Home.vue'),
            readSource('resources/js/Pages/Terms.vue'),
            readSource('resources/js/Pages/Document/Show.vue'),
        ];

        for (const page of pages) {
            expect(page).not.toContain('<Head');
            expect(page).not.toContain('import { Head');
        }
    });
});
