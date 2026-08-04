import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('external page background', () => {
    it('uses the former Terms artwork opacity for every external page', () => {
        const styles = readSource('resources/css/external.css');
        const terms = readSource('resources/js/Pages/Terms.vue');

        expect(styles).toContain('--external-art-opacity: 0.05');
        expect(styles).toContain('--external-art-opacity: 0.022');
        expect(styles).not.toContain('.reading-surface');
        expect(terms).not.toContain('reading-surface');
    });

    it('uses document scrolling for the terms page', () => {
        const layout = readSource('resources/js/Components/Layout/AppLayout.vue');
        const terms = readSource('resources/js/Pages/Terms.vue');

        expect(layout).toContain('fixedViewport?: boolean');
        expect(layout).toContain('fixedViewport: true');
        expect(layout).toContain(":class=\"fixedViewport ? 'h-dvh min-h-screen' : 'min-h-screen'\"");
        expect(terms).toContain('<AppLayout :fixed-viewport="false">');
    });
});
