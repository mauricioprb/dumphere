const SWEEP_DEGREES = 180;

export const PALETTE_FLASH_DURATION_MS = 350;

let frame: number | null = null;

export function isPaletteFlashing(): boolean {
    return frame !== null;
}

export function stopPaletteFlash(): void {
    if (frame !== null && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(frame);
    }

    frame = null;
}

export function flashPalette(root: HTMLElement, settleHue: number): void {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
        return;
    }

    stopPaletteFlash();

    let startedAt: number | null = null;

    const step = (timestamp: number) => {
        startedAt ??= timestamp;

        const progress = Math.min((timestamp - startedAt) / PALETTE_FLASH_DURATION_MS, 1);
        const hue = progress >= 1 ? settleHue : sweptHue(settleHue, progress);

        root.style.setProperty('--daily-hue', `${hue}deg`);

        frame = progress < 1 ? window.requestAnimationFrame(step) : null;
    };

    frame = window.requestAnimationFrame(step);
}

export function sweptHue(settleHue: number, progress: number): number {
    const eased = Math.sqrt(1 - (progress - 1) ** 2);
    const hue = (settleHue + SWEEP_DEGREES * (1 - eased)) % 360;

    return Number(hue.toFixed(3));
}
