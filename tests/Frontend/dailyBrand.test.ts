import { describe, expect, it, vi } from 'vitest';
import {
    applyDailyFavicon,
    applyDailyThemeColor,
    buildMarkSvg,
    dailyPaperHex,
    oklchToHex,
} from '../../resources/js/Lib/dailyBrand';

describe('daily brand assets', () => {
    it('converts oklch anchors to sRGB hex', () => {
        expect(oklchToHex(1, 0, 0)).toBe('#ffffff');
        expect(oklchToHex(0, 0, 0)).toBe('#000000');
        expect(oklchToHex(0.77, 0.12, 130)).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('keeps every channel inside the sRGB range for out-of-gamut hues', () => {
        for (let hue = 0; hue < 360; hue += 15) {
            const hex = oklchToHex(0.77, 0.12, hue);

            expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        }
    });

    it('derives complementary light and dark browser chrome colors', () => {
        const light = dailyPaperHex(200, false);
        const dark = dailyPaperHex(200, true);

        expect(light).toBe(oklchToHex(0.985, 0.012, 200));
        expect(dark).toBe(oklchToHex(0.145, 0.03, 20));
        expect(light).not.toBe(dark);
        expect(Number.parseInt(light.slice(1, 3), 16)).toBeGreaterThan(Number.parseInt(dark.slice(1, 3), 16));
    });

    it('rebuilds the mark so the slash follows the hue of the day', () => {
        const cool = buildMarkSvg(240);
        const warm = buildMarkSvg(30);

        expect(cool).toContain('viewBox="0 0 64 64"');
        expect(cool.match(/fill="#[0-9a-f]{6}"/g)).toHaveLength(3);
        expect(cool).not.toBe(warm);
    });

    it('swaps the svg favicon for the current hue', () => {
        const icon = { href: '/images/logo/dumphere-mark.svg' };
        const target = { querySelector: vi.fn().mockReturnValue(icon) } as unknown as Document;

        applyDailyFavicon(315, target);

        expect(target.querySelector).toHaveBeenCalledWith('link[rel="icon"][type="image/svg+xml"]');
        expect(icon.href.startsWith('data:image/svg+xml,')).toBe(true);
        expect(decodeURIComponent(icon.href)).toContain('<rect width="64" height="64" rx="14"');
    });

    it('updates the single theme-color tag rendered by the server', () => {
        const meta = { content: '#17181a' };
        const target = { querySelector: vi.fn().mockReturnValue(meta) } as unknown as Document;

        applyDailyThemeColor(200, true, target);
        const dark = meta.content;
        applyDailyThemeColor(200, false, target);

        expect(target.querySelector).toHaveBeenCalledWith('meta[name="theme-color"]');
        expect(dark).toBe(dailyPaperHex(200, true));
        expect(meta.content).toBe(dailyPaperHex(200, false));
    });

    it('leaves the document alone when there is no svg icon', () => {
        const target = { querySelector: vi.fn().mockReturnValue(null) } as unknown as Document;

        expect(() => applyDailyFavicon(120, target)).not.toThrow();
    });
});
