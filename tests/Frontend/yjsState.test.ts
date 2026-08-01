import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { applyBase64YjsState } from '../../resources/js/Lib/yjsState';

describe('applyBase64YjsState', () => {
    it('hydrates a Yjs document from the server snapshot', () => {
        const source = new Y.Doc();
        source.getText('content').insert(0, 'saved');
        const state = Buffer.from(Y.encodeStateAsUpdate(source)).toString('base64');
        const target = new Y.Doc();

        expect(applyBase64YjsState(target, state)).toBe(true);

        expect(target.getText('content').toString()).toBe('saved');
    });

    it('falls back cleanly when the stored snapshot is corrupt', () => {
        const document = new Y.Doc();

        expect(applyBase64YjsState(document, 'not-valid-base64')).toBe(false);
        expect(document.getText('content').toString()).toBe('');
    });
});
