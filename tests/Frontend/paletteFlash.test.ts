import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    PALETTE_FLASH_DURATION_MS,
    flashPalette,
    isPaletteFlashing,
    stopPaletteFlash,
    sweptHue,
} from '../../resources/js/Lib/paletteFlash';

function installAnimationFrame() {
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextHandle = 1;

    vi.stubGlobal('window', {
        requestAnimationFrame: (callback: FrameRequestCallback) => {
            const handle = nextHandle++;
            callbacks.set(handle, callback);

            return handle;
        },
        cancelAnimationFrame: (handle: number) => callbacks.delete(handle),
    });

    return {
        pending: () => callbacks.size,
        tick(timestamp: number) {
            const scheduled = [...callbacks.entries()];
            callbacks.clear();
            scheduled.forEach(([, callback]) => callback(timestamp));
        },
    };
}

function stubRoot() {
    const hues: number[] = [];

    return {
        hues,
        root: {
            style: {
                setProperty: (_name: string, value: string) => hues.push(Number.parseFloat(value)),
            },
        } as unknown as HTMLElement,
    };
}

describe('palette flash', () => {
    let animationFrame: ReturnType<typeof installAnimationFrame>;

    beforeEach(() => {
        animationFrame = installAnimationFrame();
    });

    afterEach(() => {
        stopPaletteFlash();
        vi.unstubAllGlobals();
    });

    it('sweeps through other palettes and lands exactly on the hue of the day', () => {
        const { hues, root } = stubRoot();

        flashPalette(root, 210);
        [0, 60, 175, 300, PALETTE_FLASH_DURATION_MS].forEach((timestamp) => animationFrame.tick(timestamp));

        expect(hues.length).toBe(5);
        expect(hues.at(-1)).toBe(210);
        expect(new Set(hues.slice(0, -1)).size).toBe(4);
        expect(isPaletteFlashing()).toBe(false);
    });

    it('front-loads the travel like circ.out instead of stepping evenly', () => {
        const early = sweptHue(0, 0.25) - sweptHue(0, 0.5);
        const late = sweptHue(0, 0.5) - sweptHue(0, 0.75);

        expect(sweptHue(0, 0)).toBe(180);
        expect(early).toBeGreaterThan(late);
        expect(sweptHue(0, 1)).toBe(0);
    });

    it('wraps the sweep into the 0–360 range', () => {
        [0, 0.2, 0.5, 0.9, 1].forEach((progress) => {
            const hue = sweptHue(300, progress);

            expect(hue).toBeGreaterThanOrEqual(0);
            expect(hue).toBeLessThan(360);
        });
    });

    it('stops cleanly and reports while running', () => {
        const { hues, root } = stubRoot();

        flashPalette(root, 90);
        animationFrame.tick(0);
        expect(isPaletteFlashing()).toBe(true);

        stopPaletteFlash();
        const framesWhenStopped = hues.length;
        animationFrame.tick(120);

        expect(isPaletteFlashing()).toBe(false);
        expect(hues.length).toBe(framesWhenStopped);
    });

    it('restarts from scratch when the theme is toggled twice in a row', () => {
        const { hues, root } = stubRoot();

        flashPalette(root, 10);
        animationFrame.tick(0);
        animationFrame.tick(80);

        flashPalette(root, 300);
        animationFrame.tick(500);
        animationFrame.tick(500 + PALETTE_FLASH_DURATION_MS);

        expect(hues.at(-1)).toBe(300);
        expect(isPaletteFlashing()).toBe(false);
    });
});
