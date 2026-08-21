import { describe, expect, it } from 'vitest';
import {
    documentBreadcrumbs,
    documentPathSlugs,
    documentTreeRequestHeaders,
    documentTreeRoot,
    flattenDocumentTree,
    hasDocumentTreeContext,
    readDocumentTreeCollapsed,
    storeDocumentTreeCollapsed,
} from '../../resources/js/Lib/documentTree';
import type { DocumentTreeNode } from '../../resources/js/types/document';

describe('document tree', () => {
    it('sends the current access proof outside the URL', () => {
        expect(documentTreeRequestHeaders('signed-token')).toEqual({
            Accept: 'application/json',
            Authorization: 'Bearer signed-token',
        });
    });

    it('builds every ancestor path and breadcrumb', () => {
        expect(documentPathSlugs('overclock/projetos/app-mobile')).toEqual([
            'overclock',
            'overclock/projetos',
            'overclock/projetos/app-mobile',
        ]);

        expect(documentBreadcrumbs('overclock/projetos/app-mobile')).toEqual([
            { slug: 'overclock', label: 'Overclock' },
            { slug: 'overclock/projetos', label: 'Projetos' },
            { slug: 'overclock/projetos/app-mobile', label: 'App Mobile' },
        ]);
    });

    it('reveals only the children of expanded branches', () => {
        const root = documentTreeRoot('overclock/projetos/api');
        const projetos: DocumentTreeNode = {
            slug: 'overclock/projetos',
            label: 'Projetos',
            hasChildren: true,
            exists: true,
        };
        const notas: DocumentTreeNode = {
            slug: 'overclock/notas',
            label: 'Notas',
            hasChildren: false,
            exists: true,
        };
        const api: DocumentTreeNode = {
            slug: 'overclock/projetos/api',
            label: 'API',
            hasChildren: false,
            exists: true,
        };
        const children = new Map<string, DocumentTreeNode[]>([
            ['overclock', [notas, projetos]],
            ['overclock/projetos', [api]],
        ]);

        expect(flattenDocumentTree(root, children, new Set(['overclock']))).toEqual([
            { ...root, depth: 0 },
            { ...notas, depth: 1 },
            { ...projetos, depth: 1 },
        ]);

        expect(flattenDocumentTree(root, children, new Set(['overclock', 'overclock/projetos']))).toEqual([
            { ...root, depth: 0 },
            { ...notas, depth: 1 },
            { ...projetos, depth: 1 },
            { ...api, depth: 2 },
        ]);
    });

    it('only reserves navigation space when the document belongs to a useful tree', () => {
        const child: DocumentTreeNode = {
            slug: 'overclock/projetos',
            label: 'Projetos',
            hasChildren: false,
            exists: true,
        };

        expect(hasDocumentTreeContext('overclock', [])).toBe(false);
        expect(hasDocumentTreeContext('overclock', [child])).toBe(true);
        expect(hasDocumentTreeContext('overclock/projetos', undefined)).toBe(true);
        expect(hasDocumentTreeContext('overclock', undefined, true)).toBe(true);
    });

    it('persists the collapsed sidebar preference without depending on storage availability', () => {
        const values = new Map<string, string>();
        const storage = {
            getItem: (key: string) => values.get(key) ?? null,
            setItem: (key: string, value: string) => values.set(key, value),
        };

        expect(readDocumentTreeCollapsed(storage)).toBe(false);

        storeDocumentTreeCollapsed(storage, true);
        expect(readDocumentTreeCollapsed(storage)).toBe(true);

        storeDocumentTreeCollapsed(storage, false);
        expect(readDocumentTreeCollapsed(storage)).toBe(false);
        expect(readDocumentTreeCollapsed(undefined)).toBe(false);
    });

    it('falls back to an open sidebar when browser storage rejects access', () => {
        const unavailableStorage = {
            getItem: () => {
                throw new Error('Storage unavailable');
            },
            setItem: () => {
                throw new Error('Storage unavailable');
            },
        };

        expect(readDocumentTreeCollapsed(unavailableStorage)).toBe(false);
        expect(() => storeDocumentTreeCollapsed(unavailableStorage, true)).not.toThrow();
    });
});
