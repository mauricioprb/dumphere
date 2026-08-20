<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { ChevronRight, FileText, PanelLeftClose, PanelLeftOpen, RefreshCw, Trash2, X } from '@lucide/vue';
import { useDocumentTree } from '@/Composables/useDocumentTree';
import { useI18n } from '@/Composables/useI18n';

const props = withDefaults(
    defineProps<{
        currentSlug: string;
        open: boolean;
        collapsed: boolean;
        isOwner?: boolean;
    }>(),
    { isOwner: false },
);

const emit = defineEmits<{
    close: [];
    availability: [available: boolean];
    toggleCollapse: [];
}>();

const { t } = useI18n();
const { visibleNodes, isTreeAvailable, isExpanded, isLoading, hasFailed, toggleNode, retryNode } = useDocumentTree(
    props.currentSlug,
);
const closeButton = ref<HTMLButtonElement | null>(null);
const depthClasses = ['ps-2', 'ps-6', 'ps-10', 'ps-14'];

watch(
    () => props.open,
    (open) => {
        if (open) nextTick(() => closeButton.value?.focus());
    },
);

watch(isTreeAvailable, (available) => emit('availability', available), { immediate: true });

function depthClass(depth: number): string {
    return depthClasses[Math.min(depth, depthClasses.length - 1)];
}

const deleting = ref('');

async function removePage(slug: string, label: string): Promise<void> {
    if (!window.confirm(t('documentTree.deleteConfirm', { page: label }))) return;

    deleting.value = slug;

    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    try {
        const response = await fetch(`/${slug}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token },
        });

        if (!response.ok) return;

        // Deleting the page you are on leaves nowhere to stand, so go back to the address.
        const root = props.currentSlug.split('/')[0];
        const landing =
            props.currentSlug === slug || props.currentSlug.startsWith(`${slug}/`) ? root : props.currentSlug;

        router.visit(`/${landing}`);
    } finally {
        deleting.value = '';
    }
}
</script>

<template>
    <div class="contents">
        <button
            v-if="open && isTreeAvailable"
            type="button"
            :aria-label="t('documentTree.close')"
            class="fixed inset-0 z-30 bg-(--workspace-ink) opacity-45 lg:hidden"
            @click="emit('close')"
        />

        <aside
            v-if="isTreeAvailable"
            id="document-tree-sidebar"
            :aria-label="t('documentTree.title')"
            :class="[
                'fixed inset-y-0 start-0 z-40 w-72 shrink-0 flex-col overflow-hidden border-e border-(--workspace-rule) bg-(--workspace-panel) transition-[width] duration-150 ease-out motion-reduce:transition-none lg:static lg:z-auto lg:flex',
                collapsed ? 'lg:w-12' : 'lg:w-60',
                open ? 'flex' : 'hidden',
            ]"
            @keydown.esc="emit('close')"
        >
            <div
                :class="[
                    'flex min-h-12 shrink-0 items-center justify-between gap-1 border-b border-(--workspace-rule) px-3',
                    collapsed ? 'lg:justify-center lg:px-0' : '',
                ]"
            >
                <h2
                    :class="[
                        'font-display text-base font-semibold tracking-[-0.02em] text-(--workspace-ink)',
                        collapsed ? 'lg:sr-only' : '',
                    ]"
                >
                    {{ t('documentTree.title') }}
                </h2>
                <button
                    type="button"
                    :aria-label="collapsed ? t('documentTree.expandSidebar') : t('documentTree.collapseSidebar')"
                    aria-controls="document-tree-navigation"
                    :aria-expanded="!collapsed"
                    class="editor-focus hidden size-11 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-paper) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none lg:inline-flex"
                    @click="emit('toggleCollapse')"
                >
                    <PanelLeftOpen v-if="collapsed" class="size-4" aria-hidden="true" />
                    <PanelLeftClose v-else class="size-4" aria-hidden="true" />
                </button>
                <button
                    ref="closeButton"
                    type="button"
                    :aria-label="t('documentTree.close')"
                    class="editor-focus inline-flex size-11 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-paper) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none lg:hidden"
                    @click="emit('close')"
                >
                    <X class="size-4" aria-hidden="true" />
                </button>
            </div>

            <nav
                id="document-tree-navigation"
                :aria-label="t('documentTree.title')"
                :class="['min-h-0 flex-1 overflow-y-auto px-2 py-2 lg:min-w-60', collapsed ? 'lg:hidden' : '']"
            >
                <TransitionGroup
                    tag="ul"
                    class="space-y-0.5"
                    enter-active-class="transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
                    enter-from-class="-translate-y-1 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    leave-active-class="transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
                    leave-to-class="-translate-y-1 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                >
                    <li v-for="node in visibleNodes" :key="node.slug">
                        <div
                            :class="[
                                'flex min-h-9 min-w-0 items-center rounded-md pe-2 transition-colors motion-reduce:transition-none',
                                depthClass(node.depth),
                                node.slug === currentSlug
                                    ? 'bg-(--workspace-paper) text-(--workspace-ink)'
                                    : 'text-(--workspace-muted) hover:bg-(--workspace-paper) hover:text-(--workspace-ink)',
                            ]"
                        >
                            <button
                                v-if="node.hasChildren"
                                type="button"
                                :aria-label="
                                    isExpanded(node.slug)
                                        ? t('documentTree.collapse', { page: node.label })
                                        : t('documentTree.expand', { page: node.label })
                                "
                                :aria-expanded="isExpanded(node.slug)"
                                class="editor-focus inline-flex size-9 shrink-0 items-center justify-center rounded-md focus:outline-none"
                                @click="toggleNode(node)"
                            >
                                <ChevronRight
                                    :class="[
                                        'size-3.5 transition-transform motion-reduce:transition-none',
                                        isExpanded(node.slug) ? 'rotate-90' : '',
                                    ]"
                                    aria-hidden="true"
                                />
                            </button>
                            <span v-else class="block w-9 shrink-0" aria-hidden="true" />

                            <Link
                                :href="`/${node.slug}`"
                                :aria-current="node.slug === currentSlug ? 'page' : undefined"
                                :title="node.slug"
                                class="editor-focus flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md pe-1 focus:outline-none"
                                @click="emit('close')"
                            >
                                <FileText class="size-4 shrink-0" aria-hidden="true" />
                                <span class="min-w-0 flex-1 truncate text-sm">{{ node.label }}</span>
                                <span
                                    v-if="node.slug === currentSlug"
                                    class="size-1.5 shrink-0 rounded-full bg-(--workspace-live)"
                                    aria-hidden="true"
                                />
                            </Link>

                            <button
                                v-if="isOwner && node.depth > 0"
                                type="button"
                                :disabled="deleting === node.slug"
                                :aria-label="t('documentTree.delete', { page: node.label })"
                                :title="t('documentTree.delete', { page: node.label })"
                                class="editor-focus inline-flex size-9 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-paper) hover:text-(--workspace-danger) focus:outline-none disabled:opacity-50 motion-reduce:transition-none"
                                @click="removePage(node.slug, node.label)"
                            >
                                <Trash2 class="size-3.5" aria-hidden="true" />
                            </button>
                        </div>

                        <p
                            v-if="isLoading(node.slug) && isExpanded(node.slug)"
                            class="py-2 ps-11 pe-2 text-xs text-(--workspace-muted)"
                            role="status"
                        >
                            {{ t('documentTree.loading') }}
                        </p>
                        <div
                            v-else-if="hasFailed(node.slug) && isExpanded(node.slug)"
                            class="flex items-center gap-2 py-2 ps-11 pe-2 text-xs text-(--workspace-danger)"
                            role="alert"
                        >
                            <span class="min-w-0 flex-1">{{ t('documentTree.loadError') }}</span>
                            <button
                                type="button"
                                class="editor-focus inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md px-2 font-semibold text-(--workspace-ink) hover:bg-(--workspace-paper) focus:outline-none"
                                @click="retryNode(node.slug)"
                            >
                                <RefreshCw class="size-3.5" aria-hidden="true" />
                                {{ t('documentTree.retry') }}
                            </button>
                        </div>
                    </li>
                </TransitionGroup>
            </nav>
        </aside>
    </div>
</template>
