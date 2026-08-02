import { computed, ref, watch } from 'vue';
import { applyDailyThemeColor } from '@/Lib/dailyBrand';
import { dailyHue } from '@/Lib/dailyTheme';
import { flashPalette } from '@/Lib/paletteFlash';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'md-editor-theme';
const TRANSITION_CLASSES = ['theme-transition-to-dark', 'theme-transition-to-light'] as const;

let clearActiveTransition: (() => void) | null = null;

function getSystemPreference(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function getStoredTheme(): Theme | null {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : null;
    }
    return null;
}

const theme = ref<Theme>(getStoredTheme() ?? getSystemPreference());

function prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function applyTheme(nextTheme: Theme, animate = false): void {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;

    clearActiveTransition?.();
    root.classList.remove(...TRANSITION_CLASSES);
    root.classList.toggle('dark', nextTheme === 'dark');
    applyDailyThemeColor(dailyHue.value, nextTheme === 'dark', document);

    if (!animate || typeof window === 'undefined' || prefersReducedMotion()) {
        return;
    }

    flashPalette(root, dailyHue.value);

    const transitionClass = nextTheme === 'dark' ? TRANSITION_CLASSES[0] : TRANSITION_CLASSES[1];
    const transitionAnimation = `theme-lens-to-${nextTheme}`;

    const finishTransition = (event: AnimationEvent): void => {
        if (event.target === root && event.animationName === transitionAnimation) {
            clearActiveTransition?.();
        }
    };

    clearActiveTransition = () => {
        root.classList.remove(transitionClass);
        root.removeEventListener('animationend', finishTransition);
        root.removeEventListener('animationcancel', finishTransition);
        clearActiveTransition = null;
    };

    root.classList.add(transitionClass);
    root.addEventListener('animationend', finishTransition);
    root.addEventListener('animationcancel', finishTransition);
}

applyTheme(theme.value);

watch(theme, (newTheme) => {
    applyTheme(newTheme, true);

    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newTheme);
    }
});

export function useTheme() {
    const isDark = computed(() => theme.value === 'dark');

    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
    }

    function setTheme(t: Theme) {
        theme.value = t;
    }

    return {
        theme,
        isDark,
        toggleTheme,
        setTheme,
    };
}
