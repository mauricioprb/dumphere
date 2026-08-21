import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { DAILY_THEME_TIME_ZONE, applyDailyTheme, resolveDailyTheme } from '../../resources/js/Lib/dailyTheme';

describe('daily theme', () => {
    it('changes at midnight in America/Sao_Paulo', () => {
        const beforeMidnight = resolveDailyTheme(new Date('2026-08-02T02:59:59Z'));
        const atMidnight = resolveDailyTheme(new Date('2026-08-02T03:00:00Z'));

        expect(DAILY_THEME_TIME_ZONE).toBe('America/Sao_Paulo');
        expect(beforeMidnight.dateKey).toBe('2026-08-01');
        expect(atMidnight.dateKey).toBe('2026-08-02');
        expect(atMidnight.hue).not.toBe(beforeMidnight.hue);
    });

    it('keeps one palette throughout the same Sao Paulo calendar day', () => {
        const morning = resolveDailyTheme(new Date('2026-08-02T10:00:00Z'));
        const evening = resolveDailyTheme(new Date('2026-08-03T02:59:59Z'));

        expect(evening).toEqual(morning);
    });

    it('applies the daily hue and date to the document root', () => {
        const setProperty = vi.fn();
        const root = {
            dataset: {},
            style: { setProperty },
        } as unknown as HTMLElement;

        const dailyTheme = applyDailyTheme(root, new Date('2026-08-02T12:00:00Z'));

        expect(root.dataset.dailyThemeDate).toBe('2026-08-02');
        expect(setProperty).toHaveBeenCalledWith('--daily-hue', `${dailyTheme.hue}deg`);
    });

    it('applies the Sao Paulo palette before assets load and keeps it current after mount', () => {
        const template = readFileSync(new URL('../../resources/views/app.blade.php', import.meta.url), 'utf8');
        const app = readFileSync(new URL('../../resources/js/app.ts', import.meta.url), 'utf8');

        expect(template).toContain("timeZone: 'America/Sao_Paulo'");
        expect(template).toContain("style.setProperty('--daily-hue'");
        expect(template.indexOf("timeZone: 'America/Sao_Paulo'")).toBeLessThan(template.indexOf('@vite'));
        expect(app).toContain('startDailyTheme(document.documentElement)');
    });

    it('derives matching light and dark semantic palettes from the daily hue', () => {
        const theme = readFileSync(new URL('../../resources/css/theme.css', import.meta.url), 'utf8');
        const external = readFileSync(new URL('../../resources/css/external.css', import.meta.url), 'utf8');
        const layout = readFileSync(
            new URL('../../resources/js/Components/Layout/AppLayout.vue', import.meta.url),
            'utf8',
        );

        expect(theme).toContain('--daily-hue: 87deg');
        expect(theme).toMatch(/:root\s*{[^}]*--workspace-theme-hue: var\(--light-hue, var\(--daily-hue\)\)/s);
        expect(theme).toMatch(/:root\s*{[^}]*--workspace-live: oklch\([^;]+var\(--workspace-theme-hue\)/s);
        expect(theme).toMatch(
            /\.dark\s*{[^}]*--workspace-theme-hue: var\(--dark-hue, calc\(var\(--light-hue, var\(--daily-hue\)\) \+ 180deg\)\)/s,
        );
        expect(theme).toMatch(/\.dark\s*{[^}]*--workspace-live: oklch\([^;]+var\(--workspace-theme-hue\)/s);
        expect(external).toContain('--external-paper: var(--workspace-paper)');
        expect(external).toContain('--external-live: var(--workspace-live)');
        expect(external.match(/--external-presence-[^;]+var\(--workspace-theme-hue\)/g)).toHaveLength(6);
        expect(external).not.toMatch(/--external-presence-[^;]+var\(--daily-hue\)/);
        expect(layout).toContain('bg-(--workspace-paper)');
        expect(layout).toContain('text-(--workspace-ink)');
    });
});
