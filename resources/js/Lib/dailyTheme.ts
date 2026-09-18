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

/** Paints one hue across the palette, the favicon and the browser theme colour. */
export function applyHue(root: HTMLElement, hue: number): void {
    dailyHue.value = hue;

    // A flash in flight owns the property until it settles on this same hue.
    if (!isPaletteFlashing()) {
        root.style.setProperty('--daily-hue', `${hue}deg`);
    }

    if (root.ownerDocument) {
        applyDailyFavicon(hue, root.ownerDocument);
        applyDailyThemeColor(hue, root.classList.contains('dark'), root.ownerDocument);
    }
}

export function applyDailyTheme(root: HTMLElement, now: Date = new Date()): DailyTheme {
    const dailyTheme = resolveDailyTheme(now);

    root.dataset.dailyThemeDate = dailyTheme.dateKey;
    applyHue(root, dailyTheme.hue);

    return dailyTheme;
}

/**
 * Applies the palette an address carries. Called again whenever the page data
 * changes, so a visitor sees the owner's new colours without reloading.
 */
function toggleAttribute(root: HTMLElement, name: string, present: boolean): void {
    if (present) {
        root.setAttribute(name, '');
    } else {
        root.removeAttribute(name);
    }
}

export interface AddressTheme {
    hue: number | null;
    chroma: number | null;
    hueDark: number | null;
    chromaDark: number | null;
}

export function applyAddressTheme(root: HTMLElement, theme: AddressTheme): void {
    // Earlier builds wrote this one inline, where it outranks the per-mode declaration
    // and pins the whole palette. Clearing it keeps an open tab from getting stuck.
    root.style.removeProperty('--theme-chroma');

    const inputs: Array<[string, number | null, number]> = [
        ['--light-hue', theme.hue, 1],
        ['--light-chroma', theme.chroma, 100],
        ['--dark-hue', theme.hueDark, 1],
        ['--dark-chroma', theme.chromaDark, 100],
    ];

    for (const [property, value, divisor] of inputs) {
        if (value === null) {
            root.style.removeProperty(property);
        } else {
            root.style.setProperty(property, divisor === 1 ? `${value}deg` : String(value / divisor));
        }
    }

    toggleAttribute(root, 'data-neutral-light', theme.chroma === 0);
    toggleAttribute(root, 'data-neutral-dark', (theme.chromaDark ?? theme.chroma) === 0);

    if (theme.hue === null) {
        delete root.dataset.themeHue;
        applyDailyTheme(root);

        return;
    }

    root.dataset.themeHue = String(theme.hue);
    applyHue(root, theme.hue);
}

/** A reserved address pins its palette; the server writes the hue before the first paint. */
export function pinnedHue(root: HTMLElement): number | null {
    const raw = root.dataset.themeHue;
    const hue = Number(raw);

    return raw !== undefined && raw !== '' && Number.isFinite(hue) ? hue : null;
}

export function startDailyTheme(root: HTMLElement): () => void {
    const pinned = pinnedHue(root);

    if (pinned !== null) {
        applyHue(root, pinned);

        return () => {};
    }

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
