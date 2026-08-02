/**
 * Brand assets that live outside CSS — the favicon and the `theme-color` meta —
 * cannot read `--daily-hue`, so they are rebuilt from the hue in JavaScript.
 *
 * The anchors below mirror the palette in resources/css/theme.css: the mark
 * always uses the dark surface, because it is drawn on the browser chrome
 * rather than on the page.
 */

const MARK_SURFACE = { lightness: 0.185, chroma: 0.014 };
const MARK_LETTERS = { lightness: 0.95, chroma: 0.01 };
const MARK_SLASH = { lightness: 0.77, chroma: 0.12 };

const PAPER = {
    light: { lightness: 0.985, chroma: 0.012, hueOffset: 0 },
    dark: { lightness: 0.145, chroma: 0.03, hueOffset: 180 },
} as const;

const MARK_LETTERS_PATH =
    'M257 -14Q191 -14 141.5 20Q92 54 65 116Q38 178 38 263Q38 343 62 405Q86 467 133 502Q180 537 250 537Q301 537 336 518Q371 499 393.5 462.5Q416 426 429 375L452 375Q445 407 439.5 437.5Q434 468 431 496Q428 524 428 545L428 715L572 715L572 0L452 0L452 152L432 152Q421 96 398 59Q375 22 339.5 4Q304 -14 257 -14ZM305 104Q338 104 361 118Q384 132 399 154.5Q414 177 421 203.5Q428 230 428 253L428 272Q428 291 422.5 311.5Q417 332 407 352Q397 372 382 387.5Q367 403 347 412Q327 421 303 421Q267 421 242 401Q217 381 203 345.5Q189 310 189 263Q189 215 203.5 179Q218 143 244 123.5Q270 104 305 104Z M919 0L919 715L1064 715L1064 551Q1064 531 1062.5 509Q1061 487 1057.5 464.5Q1054 442 1050.5 419Q1047 396 1043 373L1065 373Q1079 424 1100.5 461Q1122 498 1156 518.5Q1190 539 1242 539Q1334 539 1380 474.5Q1426 410 1426 277L1426 0L1281 0L1281 255Q1281 339 1256.5 379.5Q1232 420 1183 420Q1143 420 1117 396Q1091 372 1078 331.5Q1065 291 1063 241L1063 0Z';

const MARK_SLASH_PATH = 'M547 -87L795 712L928 712L680 -87Z';

/** oklch() is not accepted everywhere a color string can land, so it is resolved here. */
export function oklchToHex(lightness: number, chroma: number, hue: number): string {
    const radians = (hue * Math.PI) / 180;
    const a = Math.cos(radians) * chroma;
    const b = Math.sin(radians) * chroma;

    const longCubeRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const mediumCubeRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const shortCubeRoot = lightness - 0.0894841775 * a - 1.291485548 * b;

    const long = longCubeRoot ** 3;
    const medium = mediumCubeRoot ** 3;
    const short = shortCubeRoot ** 3;

    const channels = [
        4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
        -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
        -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
    ];

    return `#${channels.map(toHexChannel).join('')}`;
}

export function dailyPaperHex(hue: number, isDark: boolean): string {
    const { lightness, chroma, hueOffset } = isDark ? PAPER.dark : PAPER.light;
    const themeHue = (hue + hueOffset) % 360;

    return oklchToHex(lightness, chroma, themeHue);
}

export function buildMarkSvg(hue: number): string {
    const surface = oklchToHex(MARK_SURFACE.lightness, MARK_SURFACE.chroma, hue);
    const letters = oklchToHex(MARK_LETTERS.lightness, MARK_LETTERS.chroma, hue);
    const slash = oklchToHex(MARK_SLASH.lightness, MARK_SLASH.chroma, hue);

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">',
        `<rect width="64" height="64" rx="14" fill="${surface}"/>`,
        '<g transform="translate(2.47 44.67) scale(0.04035 -0.04035)">',
        `<path fill="${letters}" d="${MARK_LETTERS_PATH}"/>`,
        `<path fill="${slash}" d="${MARK_SLASH_PATH}"/>`,
        '</g></svg>',
    ].join('');
}

/**
 * Updates the tag rendered by the blade template instead of adding a second
 * one: browsers honour the first `theme-color` they find.
 */
export function applyDailyThemeColor(hue: number, isDark: boolean, target: Document): void {
    if (typeof target?.querySelector !== 'function') {
        return;
    }

    const meta = target.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    if (!meta) {
        return;
    }

    meta.content = dailyPaperHex(hue, isDark);
}

export function applyDailyFavicon(hue: number, target: Document): void {
    const icon = target.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');

    if (!icon) {
        return;
    }

    icon.href = `data:image/svg+xml,${encodeURIComponent(buildMarkSvg(hue))}`;
}

function toHexChannel(value: number): string {
    const companded = value <= 0.0031308 ? 12.92 * value : 1.055 * Math.max(value, 0) ** (1 / 2.4) - 0.055;
    const clamped = Math.min(255, Math.max(0, Math.round(companded * 255)));

    return clamped.toString(16).padStart(2, '0');
}
