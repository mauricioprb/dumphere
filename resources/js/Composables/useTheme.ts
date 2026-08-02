import { computed, ref, watch } from 'vue';
import { applyDailyThemeColor } from '@/Lib/dailyBrand';
import { dailyHue } from '@/Lib/dailyTheme';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'md-editor-theme';
const TRANSITION_CLASSES = ['theme-transition-to-dark', 'theme-transition-to-light'] as const;
const PHASE_CLASSES = ['theme-phase-light', 'theme-phase-dark'] as const;
const THEME_PHASE_DURATION_MS = 240;
const THEME_TRANSITION_DURATION_MS = THEME_PHASE_DURATION_MS * 3;

let clearActiveTransition: (() => void) | null = null;
let transitionTimers: Array<ReturnType<typeof setTimeout>> = [];

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
    root.classList.remove(...TRANSITION_CLASSES, ...PHASE_CLASSES);
    applyDailyThemeColor(dailyHue.value, nextTheme === 'dark', document);

    if (!animate || typeof window === 'undefined' || prefersReducedMotion()) {
        root.classList.toggle('dark', nextTheme === 'dark');

        return;
    }

    const transitionClass = nextTheme === 'dark' ? TRANSITION_CLASSES[0] : TRANSITION_CLASSES[1];
    const firstPhase = nextTheme === 'dark' ? PHASE_CLASSES[0] : PHASE_CLASSES[1];
    const secondPhase = nextTheme === 'dark' ? PHASE_CLASSES[1] : PHASE_CLASSES[0];

    clearActiveTransition = () => {
        transitionTimers.forEach((timer) => clearTimeout(timer));
        transitionTimers = [];
        root.classList.toggle('dark', nextTheme === 'dark');
        root.classList.remove(transitionClass, ...PHASE_CLASSES);
        clearActiveTransition = null;
    };

    root.classList.add(transitionClass, firstPhase);

    transitionTimers.push(
        setTimeout(() => {
            root.classList.toggle('dark', nextTheme === 'dark');
            root.classList.remove(firstPhase);
            root.classList.add(secondPhase);
        }, THEME_PHASE_DURATION_MS),
        setTimeout(() => {
            root.classList.remove(secondPhase);
        }, THEME_PHASE_DURATION_MS * 2),
        setTimeout(() => {
            clearActiveTransition?.();
        }, THEME_TRANSITION_DURATION_MS),
    );
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
