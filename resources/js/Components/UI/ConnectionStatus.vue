<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '@/Stores/documentStore'
import { useI18n } from '@/Composables/useI18n'
import { useTimeAgo } from '@/Composables/useTimeAgo'

const store = useDocumentStore()
const { lastSavedAt } = storeToRefs(store)
const { t } = useI18n()

const timeAgo = useTimeAgo(lastSavedAt)

const statusText = computed(() => {
    if (store.error) return store.error
    if (store.isSaving) return t('status.saving')
    if (timeAgo.value) {
        return t('status.savedAgo', { time: timeAgo.value })
    }
    return t('status.notSaved')
})

const statusColor = computed(() => {
    if (store.error) return 'text-danger-500 dark:text-danger-400'
    if (store.isSaving) return 'text-warning-500 dark:text-warning-400'
    return 'text-neutral-400 dark:text-neutral-500'
})

const dotColor = computed(() => {
    if (!store.isConnected) return 'bg-danger-400'
    if (store.isSaving) return 'bg-warning-400'
    return 'bg-success-400'
})
</script>

<template>
    <div class="flex items-center gap-2 text-xs">
        <span
            class="w-2 h-2 rounded-full"
            :class="dotColor"
            :title="store.isConnected ? t('status.connected') : t('status.disconnected')"
        />
        <span :class="statusColor">
            {{ statusText }}
        </span>
    </div>
</template>
