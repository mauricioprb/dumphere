import { describe, expect, it } from 'vitest';
import { normalizeDocumentPath } from '../../resources/js/Lib/documentPath';

describe('normalizeDocumentPath', () => {
    it('normalizes spaces, accents and nested paths', () => {
        expect(normalizeDocumentPath(' /Projetos/Visão Geral/ ')).toBe('projetos/visao-geral');
    });

    it('rejects empty path segments', () => {
        expect(normalizeDocumentPath('team//notes')).toBeNull();
    });

    it('rejects paths with more than four segments', () => {
        expect(normalizeDocumentPath('one/two/three/four/five')).toBeNull();
    });

    it('rejects paths longer than the backend limit', () => {
        expect(normalizeDocumentPath('a'.repeat(101))).toBeNull();
    });

    it('rejects paths reserved by the application', () => {
        expect(normalizeDocumentPath('terms/private')).toBeNull();
        expect(normalizeDocumentPath('api/notes')).toBeNull();
    });
});
