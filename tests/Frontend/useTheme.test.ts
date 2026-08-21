import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

function installBrowserGlobals(options: { reducedMotion?: boolean; storedTheme?: string | null } = {}) {
    const classes = new Set<string>();
    const listeners = new Map<string, EventListener>();
    const setItem = vi.fn();

    const classList = {
        add: (...tokens: string[]) => tokens.forEach((token) => classes.add(token)),
        contains: (token: string) => classes.has(token),
        remove: (...tokens: string[]) => tokens.forEach((token) => classes.delete(token)),
        toggle: (token: string, force?: boolean) => {
            const shouldAdd = force ?? !classes.has(token);

            if (shouldAdd) {
                classes.add(token);
            } else {
                classes.delete(token);
            }

            return shouldAdd;
        },
    };

    const documentElement = {
        addEventListener: vi.fn((type: string, listener: EventListener) => listeners.set(type, listener)),
        classList,
        removeEventListener: vi.fn((type: string) => listeners.delete(type)),
    };

    vi.stubGlobal('document', { documentElement });
    vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => options.storedTheme ?? null),
        setItem,
    });
    vi.stubGlobal('window', {
        matchMedia: vi.fn((query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)' ? (options.reducedMotion ?? false) : false,
        })),
    });

    return { classes, documentElement, listeners, setItem };
}

afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.unstubAllGlobals();
});

describe('theme', () => {
    it('renders a flat sliding theme switch with both theme cues', () => {
        const toggle = readFileSync(
            new URL('../../resources/js/Components/UI/ThemeToggle.vue', import.meta.url),
            'utf8',
        );
        const themeStyles = readFileSync(new URL('../../resources/css/theme.css', import.meta.url), 'utf8');

        expect(toggle).toContain(':aria-pressed="isDark"');
        expect(toggle).toContain('<Sun class="theme-toggle__icon');
        expect(toggle).toContain('<Moon class="theme-toggle__icon');
        expect(toggle).toContain('theme-toggle__track');
        expect(toggle).toContain('theme-toggle__thumb');
        expect(toggle).toContain('h-11 w-14');
        expect(toggle).toContain('top-2.5 h-6');
        expect(toggle).not.toContain('focus-visible:ring');
        expect(themeStyles).toContain('.theme-toggle__thumb');
        expect(themeStyles).toContain('translate: 1.5rem 0');
        expect(themeStyles).toContain('box-shadow: none');
        expect(themeStyles).toContain('translate 160ms cubic-bezier(0.16, 1, 0.3, 1)');
        expect(themeStyles).toContain('html.theme-transition-to-dark .theme-toggle__thumb');
        expect(themeStyles).toContain('html.theme-transition-to-light .theme-toggle__thumb');
        expect(themeStyles).not.toContain('@keyframes theme-toggle-to-dark');
        expect(themeStyles).not.toContain('@keyframes theme-toggle-to-light');
    });

    it('defines two temporary palettes between the permanent themes', () => {
        const themeStyles = readFileSync(new URL('../../resources/css/theme.css', import.meta.url), 'utf8');

        expect(themeStyles).toContain('--theme-phase-duration: 240ms');
        expect(themeStyles).toContain('html.theme-phase-light');
        expect(themeStyles).toContain('html.theme-phase-dark');
        expect(themeStyles).toContain('--workspace-theme-hue: calc(var(--light-hue, var(--daily-hue)) + 250deg)');
        expect(themeStyles).toContain('--workspace-theme-hue: calc(var(--light-hue, var(--daily-hue)) + 72deg)');
        expect(themeStyles).toContain('transition-delay: 0s !important');
        expect(themeStyles).toContain('transition-duration: var(--theme-phase-duration) !important');
        expect(
            readFileSync(new URL('../../resources/js/Composables/useTheme.ts', import.meta.url), 'utf8'),
        ).not.toContain('flashPalette');
    });

    it('crosses the light and dark temporary palettes in order', async () => {
        vi.useFakeTimers();
        const { classes, setItem } = installBrowserGlobals();
        const { useTheme } = await import('../../resources/js/Composables/useTheme');
        const { setTheme } = useTheme();

        setTheme('dark');
        await nextTick();

        expect(classes).not.toContain('dark');
        expect(classes).toContain('theme-transition-to-dark');
        expect(classes).toContain('theme-phase-light');
        expect(setItem).toHaveBeenLastCalledWith('md-editor-theme', 'dark');

        vi.advanceTimersByTime(240);

        expect(classes).toContain('dark');
        expect(classes).not.toContain('theme-phase-light');
        expect(classes).toContain('theme-phase-dark');

        vi.advanceTimersByTime(240);

        expect(classes).not.toContain('theme-phase-dark');

        vi.advanceTimersByTime(240);

        expect(classes).not.toContain('theme-transition-to-dark');
    });

    it('changes theme without the lens effect when reduced motion is preferred', async () => {
        const { classes } = installBrowserGlobals({ reducedMotion: true });
        const { useTheme } = await import('../../resources/js/Composables/useTheme');

        useTheme().setTheme('dark');
        await nextTick();

        expect(classes).toContain('dark');
        expect(classes).not.toContain('theme-transition-to-dark');
        expect(classes).not.toContain('theme-transition-to-light');
    });

    it('cleans the active palette sequence when the theme changes again', async () => {
        vi.useFakeTimers();
        const { classes } = installBrowserGlobals();
        const { useTheme } = await import('../../resources/js/Composables/useTheme');

        useTheme().setTheme('dark');
        await nextTick();
        vi.advanceTimersByTime(240);

        useTheme().setTheme('light');
        await nextTick();

        expect(classes).not.toContain('theme-transition-to-dark');
        expect(classes).toContain('theme-transition-to-light');
        expect(classes).toContain('theme-phase-dark');

        vi.advanceTimersByTime(720);

        expect(classes).not.toContain('dark');
        expect(classes).not.toContain('theme-transition-to-light');
        expect(classes).not.toContain('theme-phase-light');
        expect(classes).not.toContain('theme-phase-dark');
    });
});
