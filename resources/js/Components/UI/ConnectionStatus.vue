<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '@/Stores/documentStore'
import { useI18n } from '@/Composables/useI18n'
import { useTimeAgo } from '@/Composables/useTimeAgo'

const store = useDocumentStore()
const { lastSavedAt } = storeToRefs(store)
const { t } = useI18n()

const timeAgo = useTimeAgo(lastSavedAt)

const statusText = computed(() => {
    if (store.saveStatus === 'error') return store.saveError ?? t('status.notSaved')
    if (store.saveStatus === 'saving') return t('status.saving')
    if (store.saveStatus === 'saved' && timeAgo.value) {
        return t('status.savedAgo', { time: timeAgo.value })
    }
    if (store.saveStatus === 'dirty') return t('status.saving')
    return t('status.notSaved')
})

const statusColor = computed(() => {
    if (store.saveStatus === 'error') return 'text-danger-500 dark:text-danger-400'
    if (store.saveStatus === 'saving' || store.saveStatus === 'dirty') return 'text-warning-500 dark:text-warning-400'
    return 'text-neutral-400 dark:text-neutral-500'
})

const dotColor = computed(() => {
    if (store.saveStatus === 'error') return 'bg-danger-500'
    if (store.saveStatus === 'saving' || store.saveStatus === 'dirty') return 'bg-warning-400'
    if (!store.isConnected) return 'bg-danger-400'
    return 'bg-success-400'
})

const dotLabel = computed(() =>
    store.isConnected ? t('status.connected') : t('status.disconnected')
)

const politeAnnouncement = ref('')
const assertiveAnnouncement = ref('')

watch(() => store.saveStatus, (status) => {
    if (status === 'saving' || status === 'dirty') {
        politeAnnouncement.value = t('status.saving')
        assertiveAnnouncement.value = ''
    } else if (status === 'saved') {
        politeAnnouncement.value = t('status.savedAgo', { time: timeAgo.value })
        assertiveAnnouncement.value = ''
    } else if (status === 'error') {
        assertiveAnnouncement.value = store.saveError ?? t('status.failedToSave')
        politeAnnouncement.value = ''
    }
})

watch(() => store.isConnected, (connected) => {
    if (!connected) {
        assertiveAnnouncement.value = t('status.disconnected')
    } else {
        politeAnnouncement.value = t('status.connected')
        assertiveAnnouncement.value = ''
    }
})
</script>

<template>
    <div class="flex items-center gap-2 text-xs" aria-hidden="true">
        <span
            class="w-2 h-2 rounded-full"
            :class="dotColor"
        />
        <span :class="statusColor">{{ statusText }}</span>
    </div>

    <div class="sr-only" aria-live="polite" aria-atomic="true">{{ politeAnnouncement }}</div>
    <div class="sr-only" aria-live="assertive" aria-atomic="true">{{ assertiveAnnouncement }}</div>

    <span class="sr-only">{{ dotLabel }}</span>
</template>
