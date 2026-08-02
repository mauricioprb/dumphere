import { ref } from 'vue';
import { applyDailyFavicon, applyDailyThemeColor } from '@/Lib/dailyBrand';
import { flashPalette, isPaletteFlashing } from '@/Lib/paletteFlash';

export const DAILY_THEME_TIME_ZONE = 'America/Sao_Paulo';

const DAY_IN_MILLISECONDS = 86_400_000;
const GOLDEN_ANGLE_DEGREES = 137.508;
const dailyDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DAILY_THEME_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

export interface DailyTheme {
    dateKey: string;
    hue: number;
}

export function resolveDailyTheme(now: Date = new Date()): DailyTheme {
    const dateParts = dailyDateFormatter.formatToParts(now);
    const year = readDatePart(dateParts, 'year');
    const month = readDatePart(dateParts, 'month');
    const day = readDatePart(dateParts, 'day');
    const ordinal = Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MILLISECONDS);
    const hue = Number((((ordinal * GOLDEN_ANGLE_DEGREES) % 360) + 360).toFixed(3)) % 360;

    return {
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        hue,
    };
}

/** Reactive mirror of the current hue, for the parts of the brand that live outside CSS. */
export const dailyHue = ref(resolveDailyTheme().hue);

export function applyDailyTheme(root: HTMLElement, now: Date = new Date()): DailyTheme {
    const dailyTheme = resolveDailyTheme(now);

    root.dataset.dailyThemeDate = dailyTheme.dateKey;
    dailyHue.value = dailyTheme.hue;

    // A flash in flight owns the property until it settles on this same hue.
    if (!isPaletteFlashing()) {
        root.style.setProperty('--daily-hue', `${dailyTheme.hue}deg`);
    }

    if (root.ownerDocument) {
        applyDailyFavicon(dailyTheme.hue, root.ownerDocument);
        applyDailyThemeColor(dailyTheme.hue, root.classList.contains('dark'), root.ownerDocument);
    }

    return dailyTheme;
}

export function startDailyTheme(root: HTMLElement): () => void {
    const refresh = () => {
        const previousHue = dailyHue.value;
        const dailyTheme = applyDailyTheme(root);

        // Midnight in São Paulo: announce the new palette the same way the
        // theme toggle does, instead of swapping it silently under the cursor.
        if (dailyTheme.hue !== previousHue && !prefersReducedMotion()) {
            flashPalette(root, dailyTheme.hue);
        }

        return dailyTheme;
    };
    const refreshWhenVisible = () => {
        if (document.visibilityState === 'visible') {
            refresh();
        }
    };

    refresh();

    const refreshTimer = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
        window.clearInterval(refreshTimer);
        document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
}

function prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function readDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
    const value = parts.find((part) => part.type === type)?.value;

    if (value === undefined) {
        throw new Error(`Missing ${type} in daily theme date`);
    }

    return Number(value);
}
