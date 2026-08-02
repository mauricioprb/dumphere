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

        expect(bootstrapView).toContain("timeZone: 'America/Sao_Paulo'");
        expect(bootstrapView).toContain("root.style.setProperty('--daily-hue'");
        expect(bootstrapView).toContain('--workspace-theme-hue: var(--daily-hue)');
        expect(bootstrapView).toContain('--workspace-paper: oklch(0.985 0.012 var(--workspace-theme-hue))');
        expect(bootstrapView).toContain('--workspace-theme-hue: calc(var(--daily-hue) + 180deg)');
        expect(bootstrapView).toContain('--workspace-paper: oklch(0.145 0.03 var(--workspace-theme-hue))');
        expect(bootstrapView).toContain('background: var(--workspace-paper)');
        expect(bootstrapView).toContain('background: var(--workspace-accent)');
        expect(bootstrapView).toContain('background: var(--workspace-live)');
    });

    it('keeps the slash and selection optically separated without an extra cursor', () => {
        const component = readSource('resources/js/Components/UI/PageLoader.vue');
        const bootstrapView = readSource('resources/views/app.blade.php');

        for (const source of [component, bootstrapView]) {
            expect(source).toContain('column-gap: 0.08em');
            expect(source).toContain('letter-spacing: -0.035em');
            expect(source).toContain('box-sizing: border-box');
            expect(source).not.toContain('page-loader-selection__caret');
            expect(source).not.toContain('loader-caret');
        }
    });
});
