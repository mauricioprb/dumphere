<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { computed, nextTick, ref, watch } from 'vue';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import DocumentBreadcrumbs from '@/Components/Editor/DocumentBreadcrumbs.vue';
import DocumentTreeSidebar from '@/Components/Editor/DocumentTreeSidebar.vue';
import TiptapEditor from '@/Components/Editor/TiptapEditor.vue';
import ConnectionStatus from '@/Components/UI/ConnectionStatus.vue';
import ExpirationNotice from '@/Components/UI/ExpirationNotice.vue';
import PageOwnership from '@/Components/UI/PageOwnership.vue';
import UserBadge from '@/Components/UI/UserBadge.vue';
import ThemeToggle from '@/Components/UI/ThemeToggle.vue';
import Wordmark from '@/Components/UI/Wordmark.vue';
import { useDocumentStore } from '@/Stores/documentStore';
import { usePresence } from '@/Composables/usePresence';
import { useI18n } from '@/Composables/useI18n';
import { readDocumentTreeCollapsed, storeDocumentTreeCollapsed } from '@/Lib/documentTree';
import { PanelLeft, Users } from '@lucide/vue';
import type { DocumentData } from '@/types/document';

const props = withDefaults(
    defineProps<{
        document: DocumentData;
        wsToken: string;
        readonly?: boolean;
        paid?: boolean;
        price?: string | null;
        isOwner?: boolean;
        readonlyForVisitors?: boolean;
        lockedForVisitors?: boolean;
    }>(),
    {
        readonly: false,
        paid: false,
        price: null,
        isOwner: false,
        readonlyForVisitors: false,
        lockedForVisitors: false,
    },
);

const visitorRestriction = computed(() => {
    if (!props.isOwner) return null;
    if (props.readonlyForVisitors && props.lockedForVisitors) return 'status.visitorsLockedReadonly';
    if (props.readonlyForVisitors) return 'status.readonlyForVisitors';
    if (props.lockedForVisitors) return 'status.lockedForVisitors';

    return null;
});

const store = useDocumentStore();
const { users } = usePresence();
const { t } = useI18n();
const browserStorage = resolveBrowserStorage();
const treeNavigationOpen = ref(false);
const treeNavigationAvailable = ref(props.document.slug.includes('/'));
const treeNavigationCollapsed = ref(readDocumentTreeCollapsed(browserStorage));
const treeNavigationTrigger = ref<HTMLButtonElement | null>(null);

function resolveBrowserStorage(): Storage | undefined {
    try {
        return typeof window === 'undefined' ? undefined : window.localStorage;
    } catch {
        return undefined;
    }
}

function closeTreeNavigation(): void {
    const shouldRestoreFocus = treeNavigationOpen.value;

    treeNavigationOpen.value = false;

    if (shouldRestoreFocus) nextTick(() => treeNavigationTrigger.value?.focus());
}

function updateTreeNavigationAvailability(available: boolean): void {
    treeNavigationAvailable.value = available;

    if (!available) treeNavigationOpen.value = false;
}

function toggleTreeNavigationCollapse(): void {
    treeNavigationCollapsed.value = !treeNavigationCollapsed.value;
    storeDocumentTreeCollapsed(browserStorage, treeNavigationCollapsed.value);
}

watch(
    () => props.document,
    (document) => {
        store.setDocument(document);
        treeNavigationOpen.value = false;
        treeNavigationAvailable.value = document.slug.includes('/');
    },
    { immediate: true },
);
</script>

<template>
    <AppLayout>
        <div class="editor-page flex min-h-0 flex-1 flex-col bg-(--workspace-paper) text-(--workspace-ink)">
            <header class="editor-header z-10 shrink-0 border-b border-(--workspace-rule) bg-(--workspace-paper)">
                <div class="flex min-h-14 w-full items-center justify-between gap-4 px-[clamp(0.75rem,2vw,1.5rem)]">
                    <div class="flex min-w-0 items-center gap-2.5 text-sm text-(--workspace-muted)">
                        <button
                            v-if="treeNavigationAvailable"
                            ref="treeNavigationTrigger"
                            type="button"
                            :aria-label="t('documentTree.open')"
                            aria-controls="document-tree-sidebar"
                            :aria-expanded="treeNavigationOpen"
                            class="editor-focus inline-flex size-11 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none lg:hidden"
                            @click="treeNavigationOpen = true"
                        >
                            <PanelLeft class="size-4" aria-hidden="true" />
                        </button>
                        <Link
                            href="/"
                            :aria-label="t('navigation.home')"
                            class="editor-focus inline-flex min-h-11 shrink-0 items-center rounded-md px-1 text-[0.95rem] text-(--workspace-ink) transition-colors hover:text-(--workspace-live) focus:outline-none motion-reduce:transition-none"
                        >
                            <Wordmark />
                        </Link>
                        <span class="text-(--workspace-rule)" aria-hidden="true">/</span>
                        <DocumentBreadcrumbs :slug="document.slug" />
                    </div>

                    <div class="flex shrink-0 items-center gap-1 sm:gap-3">
                        <ul
                            v-if="users.length > 0"
                            :aria-label="t('presence.ariaLabel')"
                            class="hidden items-center -space-x-2 sm:flex"
                        >
                            <UserBadge v-for="user in users.slice(0, 5)" :key="user.id" :user="user" />
                            <li v-if="users.length > 5" class="ml-2 text-xs text-(--workspace-muted)">
                                {{ t('presence.more', { count: users.length - 5 }) }}
                            </li>
                        </ul>
                        <span
                            v-if="users.length > 0"
                            :aria-label="t('presence.online', { count: users.length })"
                            class="inline-flex min-h-11 items-center gap-1 font-mono text-xs text-(--workspace-muted) sm:hidden"
                        >
                            <Users class="size-4" aria-hidden="true" />
                            <span aria-hidden="true">{{ users.length }}</span>
                        </span>

                        <PageOwnership :slug="document.slug" :paid="paid" :price="price" :is-owner="isOwner" />

                        <span
                            v-if="readonly"
                            class="inline-flex min-h-11 shrink-0 items-center font-mono text-[0.72rem] text-(--workspace-muted) sm:min-h-9"
                        >
                            {{ t('status.readonly') }}
                        </span>
                        <template v-else>
                            <span
                                v-if="visitorRestriction"
                                :title="t('status.visitorRestrictionLong')"
                                class="hidden min-h-11 shrink-0 items-center font-mono text-[0.72rem] text-(--workspace-warning) sm:inline-flex sm:min-h-9"
                            >
                                {{ t(visitorRestriction) }}
                            </span>
                            <ConnectionStatus />
                        </template>

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main id="main-content" tabindex="-1" class="flex min-h-0 flex-1 focus:outline-none">
                <DocumentTreeSidebar
                    :key="document.id"
                    :current-slug="document.slug"
                    :open="treeNavigationOpen"
                    :collapsed="treeNavigationCollapsed"
                    :is-owner="isOwner"
                    @availability="updateTreeNavigationAvailability"
                    @close="closeTreeNavigation"
                    @toggle-collapse="toggleTreeNavigationCollapse"
                />
                <div class="flex min-w-0 flex-1 flex-col">
                    <h1 class="sr-only">{{ document.title ?? document.slug }}</h1>
                    <TiptapEditor
                        :key="`${document.id}:${readonly}`"
                        :document-id="document.id"
                        :slug="document.slug"
                        :initial-content="document.contentHtml"
                        :initial-yjs-state="document.yjsStateBase64"
                        :ws-token="wsToken"
                        :readonly="readonly"
                        class="flex min-h-0 flex-1 flex-col"
                    />
                </div>
            </main>

            <ExpirationNotice v-if="!paid" :slug="document.slug" :created-at="document.createdAt" />
        </div>
    </AppLayout>
</template>
