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
        expect(themeStyles).toContain(
            'animation: theme-toggle-to-dark var(--theme-lens-duration) var(--theme-lens-easing) both',
        );
    });

    it('uses the lens as the only transition clock while theme colors swap', () => {
        const themeStyles = readFileSync(new URL('../../resources/css/theme.css', import.meta.url), 'utf8');

        expect(themeStyles).toContain('--theme-lens-duration: 350ms');
        expect(themeStyles).toContain(
            'animation: theme-lens-to-dark var(--theme-lens-duration) var(--theme-lens-easing) both',
        );
        expect(themeStyles).toContain(
            'animation: theme-lens-to-light var(--theme-lens-duration) var(--theme-lens-easing) both',
        );
        expect(themeStyles).toContain('transition-delay: 0s !important');
        expect(themeStyles).toContain('transition-duration: 0s !important');
    });

    it('adds the directional lens effect when the theme changes', async () => {
        const { classes, setItem } = installBrowserGlobals();
        const { useTheme } = await import('../../resources/js/Composables/useTheme');
        const { setTheme } = useTheme();

        setTheme('dark');
        await nextTick();

        expect(classes).toContain('dark');
        expect(classes).toContain('theme-transition-to-dark');
        expect(setItem).toHaveBeenLastCalledWith('md-editor-theme', 'dark');

        setTheme('light');
        await nextTick();

        expect(classes).not.toContain('dark');
        expect(classes).not.toContain('theme-transition-to-dark');
        expect(classes).toContain('theme-transition-to-light');
        expect(setItem).toHaveBeenLastCalledWith('md-editor-theme', 'light');
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

    it('removes the temporary lens class when its animation finishes', async () => {
        const { classes, documentElement, listeners } = installBrowserGlobals();
        const { useTheme } = await import('../../resources/js/Composables/useTheme');

        useTheme().setTheme('dark');
        await nextTick();

        const finishTransition = listeners.get('animationend') as (event: AnimationEvent) => void;
        finishTransition({ animationName: 'theme-lens-to-dark', target: documentElement } as unknown as AnimationEvent);

        expect(classes).not.toContain('theme-transition-to-dark');
        expect(listeners.has('animationend')).toBe(false);
        expect(listeners.has('animationcancel')).toBe(false);
    });
});
