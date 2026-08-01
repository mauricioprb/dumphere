import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('page loader design', () => {
    it('uses the same editorial loading motif before and after Vue mounts', () => {
        const component = readSource('resources/js/Components/UI/PageLoader.vue');
        const bootstrapView = readSource('resources/views/app.blade.php');

        for (const source of [component, bootstrapView]) {
            expect(source).toContain('page-loader-wordmark');
            expect(source).toContain('page-loader-selection__fill');
            expect(source).toContain('page-loader-selection__caret');
            expect(source).toContain('page-loader-status__signal');
            expect(source).toContain('dump');
            expect(source).toContain('here');
        }
    });

    it('removes the generic glowing spinner treatment', () => {
        const component = readSource('resources/js/Components/UI/PageLoader.vue');
        const bootstrapView = readSource('resources/views/app.blade.php');
        const loaderSources = `${component}\n${bootstrapView}`;

        expect(loaderSources).not.toContain('loader-goo');
        expect(loaderSources).not.toContain('loader-shadow');
        expect(loaderSources).not.toContain('linearGradient');
        expect(loaderSources).not.toContain('GaussianBlur');
        expect(loaderSources).not.toContain('backdrop-blur');
    });

    it('keeps navigation timing, accessibility, and motion preferences intact', () => {
        const component = readSource('resources/js/Components/UI/PageLoader.vue');
        const bootstrapView = readSource('resources/views/app.blade.php');

        expect(component).toContain("router.on('start', showLoader)");
        expect(component).toContain("router.on('finish', hideLoader)");
        expect(component).toContain('MINIMUM_VISIBLE_MS');
        expect(component).toContain("document.addEventListener('visibilitychange', updatePageVisibility)");
        expect(component).toContain('aria-live="polite"');
        expect(component).toContain('page-loader-stage--paused');
        expect(component).toContain('@media (prefers-reduced-motion: reduce)');
        expect(bootstrapView).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('matches the initial surface to the workspace palette in both themes', () => {
        const bootstrapView = readSource('resources/views/app.blade.php');

        expect(bootstrapView).toContain('background: #faf8f5');
        expect(bootstrapView).toContain('background: #15130f');
        expect(bootstrapView).toContain('background: #ed8741');
        expect(bootstrapView).toContain('background: #f08a43');
        expect(bootstrapView).toContain('background: #587314');
        expect(bootstrapView).toContain('background: #9fc85b');
    });

    it('keeps the slash, selection, and caret optically separated and aligned', () => {
        const component = readSource('resources/js/Components/UI/PageLoader.vue');
        const bootstrapView = readSource('resources/views/app.blade.php');

        for (const source of [component, bootstrapView]) {
            expect(source).toContain('column-gap: 0.08em');
            expect(source).toContain('letter-spacing: -0.035em');
            expect(source).toContain('box-sizing: border-box');
            expect(source).toContain('inset-block: 0');
            expect(source).toContain('width: 3px');
            expect(source).not.toContain('top: -0.09em');
            expect(source).not.toContain('bottom: -0.06em');
        }
    });
});
