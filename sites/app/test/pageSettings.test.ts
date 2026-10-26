import { describe, expect, it } from 'vitest';
import { shouldPreviewSettings, shouldReloadSettings } from '@/Lib/pageSettings';

describe('page settings reloads', () => {
    it('keeps the page mounted when an existing owner opens settings', () => {
        expect(shouldReloadSettings(false, true, true)).toBe(false);
    });

    it('reloads after authenticating or saving changes', () => {
        expect(shouldReloadSettings(false, true, false)).toBe(true);
        expect(shouldReloadSettings(true, false, true)).toBe(true);
    });
});

describe('page settings preview', () => {
    it('preserves the current address palette until settings load', () => {
        expect(shouldPreviewSettings(true, false)).toBe(false);
        expect(shouldPreviewSettings(true, true)).toBe(true);
        expect(shouldPreviewSettings(false, true)).toBe(false);
    });
});
