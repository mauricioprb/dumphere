<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDocumentStore } from '@/Stores/documentStore';
import { useI18n } from '@/Composables/useI18n';
import { useTimeAgo } from '@/Composables/useTimeAgo';

const store = useDocumentStore();
const { lastSavedAt } = storeToRefs(store);
const { t } = useI18n();

const timeAgo = useTimeAgo(lastSavedAt);

const statusText = computed(() => {
    if (store.saveStatus === 'error') return store.saveError ?? t('status.notSaved');
    if (store.saveStatus === 'saving') return t('status.saving');
    if (store.saveStatus === 'saved' && timeAgo.value) {
        return t('status.savedAgo', { time: timeAgo.value });
    }
    if (store.saveStatus === 'dirty') return t('status.saving');
    return t('status.notSaved');
});

const statusColor = computed(() => {
    if (store.saveStatus === 'error') return 'text-(--workspace-danger)';
    if (store.saveStatus === 'saving' || store.saveStatus === 'dirty') return 'text-(--workspace-warning)';
    return 'text-(--workspace-muted)';
});

const dotColor = computed(() => {
    if (store.saveStatus === 'error' || !store.isConnected) return 'bg-(--workspace-danger)';
    if (store.saveStatus === 'saving' || store.saveStatus === 'dirty') return 'bg-(--workspace-warning)';
    return 'bg-(--workspace-live)';
});

const dotLabel = computed(() => (store.isConnected ? t('status.connected') : t('status.disconnected')));
const accessibleStatus = computed(() => `${statusText.value}. ${dotLabel.value}.`);

const politeAnnouncement = ref('');
const assertiveAnnouncement = ref('');

watch(
    () => store.saveStatus,
    (status) => {
        if (status === 'saving' || status === 'dirty') {
            politeAnnouncement.value = t('status.saving');
            assertiveAnnouncement.value = '';
        } else if (status === 'saved') {
            politeAnnouncement.value = t('status.savedAgo', { time: timeAgo.value ?? '' });
            assertiveAnnouncement.value = '';
        } else if (status === 'error') {
            assertiveAnnouncement.value = store.saveError ?? t('status.failedToSave');
            politeAnnouncement.value = '';
        }
    },
);

watch(
    () => store.isConnected,
    (connected) => {
        if (!connected) {
            assertiveAnnouncement.value = t('status.disconnected');
        } else {
            politeAnnouncement.value = t('status.connected');
            assertiveAnnouncement.value = '';
        }
    },
);
</script>

<template>
    <div
        class="flex max-w-28 min-w-0 items-center gap-2 font-mono text-[0.72rem] sm:max-w-48"
        role="group"
        :aria-label="accessibleStatus"
    >
        <span class="size-1.5 shrink-0 translate-y-[-0.15em] rounded-full" :class="dotColor" aria-hidden="true" />
        <span class="truncate" :class="statusColor" :title="statusText">{{ statusText }}</span>
    </div>

    <div class="sr-only" aria-live="polite" aria-atomic="true">{{ politeAnnouncement }}</div>
    <div class="sr-only" aria-live="assertive" aria-atomic="true">{{ assertiveAnnouncement }}</div>
</template>
