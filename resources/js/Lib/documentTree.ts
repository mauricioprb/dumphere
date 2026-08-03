import type { DocumentTreeNode } from '@/types/document';

const DOCUMENT_TREE_COLLAPSED_STORAGE_KEY = 'dumphere:document-tree-collapsed';

interface DocumentTreePreferenceStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export interface DocumentBreadcrumb {
    slug: string;
    label: string;
}

export interface VisibleDocumentTreeNode extends DocumentTreeNode {
    depth: number;
}

export function documentPathSlugs(slug: string): string[] {
    const segments = slug.split('/').filter(Boolean);

    return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
}

export function documentBreadcrumbs(slug: string): DocumentBreadcrumb[] {
    return documentPathSlugs(slug).map((path) => ({
        slug: path,
        label: formatDocumentSegment(path.split('/').at(-1) ?? path),
    }));
}

export function documentTreeRoot(slug: string): DocumentTreeNode {
    const [rootSlug = slug] = documentPathSlugs(slug);

    return {
        slug: rootSlug,
        label: formatDocumentSegment(rootSlug),
        hasChildren: true,
        exists: rootSlug === slug,
    };
}

export function hasDocumentTreeContext(
    slug: string,
    rootChildren: readonly DocumentTreeNode[] | undefined,
    rootLoadFailed = false,
): boolean {
    return documentPathSlugs(slug).length > 1 || (rootChildren?.length ?? 0) > 0 || rootLoadFailed;
}

export function flattenDocumentTree(
    root: DocumentTreeNode,
    childrenByParent: ReadonlyMap<string, DocumentTreeNode[]>,
    expandedSlugs: ReadonlySet<string>,
): VisibleDocumentTreeNode[] {
    const visibleNodes: VisibleDocumentTreeNode[] = [];

    function append(node: DocumentTreeNode, depth: number): void {
        visibleNodes.push({ ...node, depth });

        if (!expandedSlugs.has(node.slug)) return;

        for (const child of childrenByParent.get(node.slug) ?? []) {
            append(child, depth + 1);
        }
    }

    append(root, 0);

    return visibleNodes;
}

export function formatDocumentSegment(segment: string): string {
    return segment
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function readDocumentTreeCollapsed(storage: DocumentTreePreferenceStorage | undefined): boolean {
    try {
        return storage?.getItem(DOCUMENT_TREE_COLLAPSED_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function storeDocumentTreeCollapsed(
    storage: DocumentTreePreferenceStorage | undefined,
    collapsed: boolean,
): void {
    try {
        storage?.setItem(DOCUMENT_TREE_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
        return;
    }
}
