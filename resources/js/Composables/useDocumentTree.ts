import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import type { Ref } from 'vue';
import {
    documentPathSlugs,
    documentTreeRequestHeaders,
    documentTreeRoot,
    flattenDocumentTree,
    hasDocumentTreeContext,
} from '@/Lib/documentTree';
import type { DocumentTreeNode, DocumentTreeResponse } from '@/types/document';

export function useDocumentTree(currentSlug: string, wsToken: Readonly<Ref<string>>) {
    const root = ref(documentTreeRoot(currentSlug));
    const childrenByParent = reactive(new Map<string, DocumentTreeNode[]>());
    const nodesBySlug = reactive(new Map<string, DocumentTreeNode>([[root.value.slug, root.value]]));
    const expandedSlugs = reactive(new Set<string>());
    const loadingSlugs = reactive(new Set<string>());
    const failedSlugs = reactive(new Set<string>());
    const requests = new Map<string, AbortController>();

    const visibleNodes = computed(() => flattenDocumentTree(root.value, childrenByParent, expandedSlugs));
    const isTreeAvailable = computed(() =>
        hasDocumentTreeContext(currentSlug, childrenByParent.get(root.value.slug), failedSlugs.has(root.value.slug)),
    );

    async function loadChildren(slug: string): Promise<void> {
        if (childrenByParent.has(slug) || loadingSlugs.has(slug)) return;

        const controller = new AbortController();
        requests.set(slug, controller);
        loadingSlugs.add(slug);
        failedSlugs.delete(slug);

        try {
            const response = await fetch(`/api/document-tree/${slug}`, {
                headers: documentTreeRequestHeaders(wsToken.value),
                signal: controller.signal,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = (await response.json()) as DocumentTreeResponse;
            childrenByParent.set(slug, data.children);

            for (const child of data.children) {
                nodesBySlug.set(child.slug, child);
            }

            const parent = nodesBySlug.get(slug);
            if (parent) parent.hasChildren = data.children.length > 0;
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                failedSlugs.add(slug);
            }
        } finally {
            requests.delete(slug);
            loadingSlugs.delete(slug);
        }
    }

    async function toggleNode(node: DocumentTreeNode): Promise<void> {
        if (expandedSlugs.has(node.slug)) {
            expandedSlugs.delete(node.slug);
            return;
        }

        expandedSlugs.add(node.slug);
        await loadChildren(node.slug);
    }

    async function retryNode(slug: string): Promise<void> {
        failedSlugs.delete(slug);
        await loadChildren(slug);
    }

    onMounted(async () => {
        for (const slug of documentPathSlugs(currentSlug)) {
            expandedSlugs.add(slug);
            await loadChildren(slug);
        }
    });

    onUnmounted(() => {
        for (const request of requests.values()) request.abort();
        requests.clear();
    });

    return {
        visibleNodes,
        isTreeAvailable,
        isExpanded: (slug: string) => expandedSlugs.has(slug),
        isLoading: (slug: string) => loadingSlugs.has(slug),
        hasFailed: (slug: string) => failedSlugs.has(slug),
        toggleNode,
        retryNode,
    };
}
