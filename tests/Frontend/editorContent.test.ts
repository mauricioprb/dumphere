import { describe, expect, it } from 'vitest';
import { getPersistableHtml } from '../../resources/js/Lib/editorContent';

describe('getPersistableHtml', () => {
    it('persists an empty editor as an empty string', () => {
        expect(
            getPersistableHtml({
                isEmpty: true,
                getHTML: () => '<p></p>',
            }),
        ).toBe('');
    });

    it('keeps non-empty HTML', () => {
        expect(
            getPersistableHtml({
                isEmpty: false,
                getHTML: () => '<p>Hello</p>',
            }),
        ).toBe('<p>Hello</p>');
    });
});
