import { describe, expect, it } from 'vitest';
import { isPermanentSaveRejection } from '../../resources/js/Lib/saveRetry';

describe('save retry policy', () => {
    it('stops retrying rejections that repeating the request cannot fix', () => {
        expect(isPermanentSaveRejection(413)).toBe(true);
        expect(isPermanentSaveRejection(404)).toBe(true);
        expect(isPermanentSaveRejection(422)).toBe(true);
    });

    it('keeps retrying timeouts, throttling and server faults', () => {
        expect(isPermanentSaveRejection(408)).toBe(false);
        expect(isPermanentSaveRejection(429)).toBe(false);
        expect(isPermanentSaveRejection(500)).toBe(false);
        expect(isPermanentSaveRejection(503)).toBe(false);
    });
});
