<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { watch } from 'vue'
import AppLayout from '@/Components/Layout/AppLayout.vue'
import TiptapEditor from '@/Components/Editor/TiptapEditor.vue'
import ConnectionStatus from '@/Components/UI/ConnectionStatus.vue'
import ExpirationNotice from '@/Components/UI/ExpirationNotice.vue'
import UserBadge from '@/Components/UI/UserBadge.vue'
import ThemeToggle from '@/Components/UI/ThemeToggle.vue'
import { useDocumentStore } from '@/Stores/documentStore'
import { usePresence } from '@/Composables/usePresence'
import { useI18n } from '@/Composables/useI18n'
import { FileText } from '@lucide/vue'
import type { DocumentData } from '@/types/document'

const props = defineProps<{
    document: DocumentData
    wsToken: string
}>()

const store = useDocumentStore()
const { users } = usePresence()
const { t } = useI18n()

watch(
    () => props.document,
    document => store.setDocument(document),
    { immediate: true },
)
</script>

<template>
    <Head :title="document.title ?? document.slug" />
    <AppLayout>
        <div class="shrink-0 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-10">
            <div class="px-4 py-2 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 min-w-0">
                    <Link
                        href="/"
                        prefetch
                        :aria-label="t('navigation.home')"
                        class="rounded hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
                    >
                        <FileText class="w-5 h-5" :stroke-width="2" aria-hidden="true" />
                    </Link>
                    <span class="text-neutral-300 dark:text-neutral-600">/</span>
                    <span class="font-mono text-neutral-700 dark:text-neutral-300 truncate">{{ document.slug }}</span>
                </div>

                <div class="flex items-center gap-3">
                    <div v-if="users.length > 0" class="flex items-center -space-x-2">
                        <UserBadge
                            v-for="user in users.slice(0, 5)"
                            :key="user.id"
                            :user="user"
                        />
                        <span
                            v-if="users.length > 5"
                            class="ml-2 text-xs text-neutral-500 dark:text-neutral-400"
                        >
                            {{ t('presence.more', { count: users.length - 5 }) }}
                        </span>
                    </div>

                    <ConnectionStatus />

                    <ThemeToggle />
                </div>
            </div>
        </div>

        <div class="flex-1 min-h-0 flex flex-col">
            <TiptapEditor
                :document-id="document.id"
                :slug="document.slug"
                :initial-content="document.contentHtml"
                :initial-yjs-state="document.yjsStateBase64"
                :ws-token="wsToken"
                class="flex-1 min-h-0 flex flex-col"
            />
        </div>

        <ExpirationNotice :slug="document.slug" :created-at="document.createdAt" />
    </AppLayout>
</template>
