<script setup lang="ts">
import { computed, ref } from 'vue';
import { Settings } from '@lucide/vue';
import BuyAddressDialog from '@/Components/UI/BuyAddressDialog.vue';
import PageSettingsDialog from '@/Components/UI/PageSettingsDialog.vue';
import { useI18n } from '@/Composables/useI18n';

const props = defineProps<{ slug: string; paid: boolean; price: string | null; isOwner: boolean }>();

const { t } = useI18n();
const prefix = computed(() => props.slug.split('/')[0]);
const buyOpen = ref(false);
const settingsOpen = ref(false);
</script>

<template>
    <button
        v-if="!paid"
        type="button"
        :title="t('ownership.buyTitle', { prefix })"
        class="editor-focus inline-flex min-h-11 shrink-0 items-center rounded-md bg-(--workspace-accent) px-3 text-sm font-medium text-(--workspace-accent-ink) transition-[filter,opacity] hover:brightness-95 focus:outline-none motion-reduce:transition-none sm:min-h-9"
        @click="buyOpen = true"
    >
        {{ t('ownership.buy') }}
    </button>

    <button
        v-else
        type="button"
        :aria-label="t('ownership.settings', { prefix })"
        :title="t('ownership.settings', { prefix })"
        class="editor-focus inline-flex size-11 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none sm:size-9"
        @click="settingsOpen = true"
    >
        <Settings class="size-4" aria-hidden="true" />
    </button>

    <BuyAddressDialog v-if="!paid" v-model:open="buyOpen" :prefix="prefix" :price="price" />
    <PageSettingsDialog v-if="paid" v-model:open="settingsOpen" :slug="slug" :prefix="prefix" :is-owner="isOwner" />
</template>
