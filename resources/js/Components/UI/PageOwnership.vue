<script setup lang="ts">
import { computed, ref } from 'vue';
import { Settings } from '@lucide/vue';
import PageSettingsDialog from '@/Components/UI/PageSettingsDialog.vue';
import { useI18n } from '@/Composables/useI18n';

const props = defineProps<{
    slug: string;
    isOwner: boolean;
}>();

const { t } = useI18n();
const prefix = computed(() => props.slug.split('/')[0]);
const settingsOpen = ref(false);
</script>

<template>
    <div>
        <button
            type="button"
            :aria-label="t('ownership.settings', { prefix })"
            :title="t('ownership.settings', { prefix })"
            class="editor-focus inline-flex size-11 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none sm:size-9"
            @click="settingsOpen = true"
        >
            <Settings class="size-4" aria-hidden="true" />
        </button>

        <PageSettingsDialog v-model:open="settingsOpen" :slug="slug" :prefix="prefix" :is-owner="isOwner" />
    </div>
</template>
