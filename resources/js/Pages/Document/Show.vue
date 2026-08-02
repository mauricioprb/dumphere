<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { watch } from 'vue';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import TiptapEditor from '@/Components/Editor/TiptapEditor.vue';
import ConnectionStatus from '@/Components/UI/ConnectionStatus.vue';
import ExpirationNotice from '@/Components/UI/ExpirationNotice.vue';
import UserBadge from '@/Components/UI/UserBadge.vue';
import ThemeToggle from '@/Components/UI/ThemeToggle.vue';
import Wordmark from '@/Components/UI/Wordmark.vue';
import { useDocumentStore } from '@/Stores/documentStore';
import { usePresence } from '@/Composables/usePresence';
import { useI18n } from '@/Composables/useI18n';
import { Users } from '@lucide/vue';
import type { DocumentData } from '@/types/document';

const props = defineProps<{
    document: DocumentData;
    wsToken: string;
}>();

const store = useDocumentStore();
const { users } = usePresence();
const { t } = useI18n();

watch(
    () => props.document,
    (document) => store.setDocument(document),
    { immediate: true },
);
</script>

<template>
    <AppLayout>
        <div class="editor-page flex min-h-0 flex-1 flex-col bg-(--workspace-paper) text-(--workspace-ink)">
            <header class="editor-header z-10 shrink-0 border-b border-(--workspace-rule) bg-(--workspace-paper)">
                <div class="flex min-h-14 w-full items-center justify-between gap-4 px-[clamp(0.75rem,2vw,1.5rem)]">
                    <div class="flex min-w-0 items-center gap-2.5 text-sm text-(--workspace-muted)">
                        <Link
                            href="/"
                            :aria-label="t('navigation.home')"
                            class="editor-focus inline-flex min-h-11 shrink-0 items-center rounded-md px-1 text-[0.95rem] text-(--workspace-ink) transition-colors hover:text-(--workspace-live) focus:outline-none motion-reduce:transition-none"
                        >
                            <Wordmark />
                        </Link>
                        <span class="text-(--workspace-rule)" aria-hidden="true">/</span>
                        <span class="truncate font-mono text-[0.78rem] text-(--workspace-muted)">{{
                            document.slug
                        }}</span>
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

                        <ConnectionStatus />

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main id="main-content" tabindex="-1" class="flex min-h-0 flex-1 flex-col focus:outline-none">
                <h1 class="sr-only">{{ document.title ?? document.slug }}</h1>
                <TiptapEditor
                    :document-id="document.id"
                    :slug="document.slug"
                    :initial-content="document.contentHtml"
                    :initial-yjs-state="document.yjsStateBase64"
                    :ws-token="wsToken"
                    class="flex min-h-0 flex-1 flex-col"
                />
            </main>

            <ExpirationNotice :slug="document.slug" :created-at="document.createdAt" />
        </div>
    </AppLayout>
</template>
